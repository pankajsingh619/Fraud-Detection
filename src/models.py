import os
import logging
import joblib
import json
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import StackingClassifier
from sklearn.metrics import (
    precision_score, recall_score, f1_score, 
    roc_auc_score, precision_recall_curve, auc, confusion_matrix
)
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier
from xgboost import XGBClassifier

logger = logging.getLogger(__name__)

class FraudModels:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.models = {}
        self.feature_cols = None

    def fit_scaler(self, X, num_cols):
        """Fits the numerical features scaler (required for Logistic Regression)."""
        # Ensure we only scale numeric columns that are actually in X
        cols_to_scale = [c for c in num_cols if c in X.columns]
        if len(cols_to_scale) > 0:
            self.scaler.fit(X[cols_to_scale])
            
    def scale_features(self, X, num_cols):
        """Transforms numerical features using the fitted scaler."""
        X_scaled = X.copy()
        cols_to_scale = [c for c in num_cols if c in X.columns]
        if len(cols_to_scale) > 0:
            X_scaled[cols_to_scale] = self.scaler.transform(X[cols_to_scale])
        return X_scaled

    def train_logistic_regression(self, X_train, y_train, num_cols):
        """Trains Logistic Regression baseline on scaled numerical features."""
        logger.info("Training Logistic Regression baseline...")
        X_train_scaled = self.scale_features(X_train, num_cols)
        
        # We only use scaled numerical features for LR (categorical values might be raw codes and confuse linear model)
        cols_to_use = [c for c in num_cols if c in X_train.columns]
        
        model = LogisticRegression(
            class_weight='balanced',
            max_iter=1000,
            random_state=self.random_state,
            n_jobs=-1
        )
        model.fit(X_train_scaled[cols_to_use], y_train)
        self.models['logistic_regression'] = model
        logger.info("Logistic Regression training complete.")
        return model

    def train_lightgbm(self, X_train, y_train):
        """Trains LightGBM classifier."""
        logger.info("Training LightGBM model...")
        
        # Calculate class weights or balance ratio
        pos_weight = (len(y_train) - y_train.sum()) / y_train.sum()
        
        model = LGBMClassifier(
            objective='binary',
            class_weight='balanced',
            n_estimators=100,
            learning_rate=0.05,
            num_leaves=31,
            random_state=self.random_state,
            n_jobs=-1,
            verbose=-1
        )
        model.fit(X_train, y_train)
        self.models['lightgbm'] = model
        logger.info("LightGBM training complete.")
        return model

    def train_catboost(self, X_train, y_train):
        """Trains CatBoost classifier."""
        logger.info("Training CatBoost model...")
        
        # CatBoost requires string categorical representation or integer codes
        model = CatBoostClassifier(
            iterations=150,
            learning_rate=0.08,
            depth=6,
            auto_class_weights='Balanced',
            random_seed=self.random_state,
            verbose=0,
            thread_count=-1
        )
        model.fit(X_train, y_train)
        self.models['catboost'] = model
        logger.info("CatBoost training complete.")
        return model

    def train_xgboost(self, X_train, y_train):
        """Trains XGBoost classifier."""
        logger.info("Training XGBoost model...")
        
        # Calculate scale_pos_weight for imbalance handling
        num_neg = (y_train == 0).sum()
        num_pos = (y_train == 1).sum()
        scale_pos_weight = num_neg / num_pos if num_pos > 0 else 1.0
        
        model = XGBClassifier(
            use_label_encoder=False,
            eval_metric='logloss',
            scale_pos_weight=scale_pos_weight,
            n_estimators=100,
            max_depth=6,
            learning_rate=0.05,
            random_state=self.random_state,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        self.models['xgboost'] = model
        logger.info("XGBoost training complete.")
        return model

    def train_stacking_ensemble(self, X_train, y_train):
        """Trains a Stacking Classifier with LightGBM, CatBoost, and XGBoost as base models and Logistic Regression as meta-learner."""
        logger.info("Training Stacking Ensemble Classifier...")
        
        # Ensure base models are trained
        if 'lightgbm' not in self.models:
            self.train_lightgbm(X_train, y_train)
        if 'catboost' not in self.models:
            self.train_catboost(X_train, y_train)
        if 'xgboost' not in self.models:
            self.train_xgboost(X_train, y_train)
            
        estimators = [
            ('lightgbm', self.models['lightgbm']),
            ('catboost', self.models['catboost']),
            ('xgboost', self.models['xgboost'])
        ]
        
        # Meta-learner: Logistic Regression with balanced weights
        meta_learner = LogisticRegression(
            class_weight='balanced',
            random_state=self.random_state,
            n_jobs=-1
        )
        
        stacking_clf = StackingClassifier(
            estimators=estimators,
            final_estimator=meta_learner,
            cv=3,  # 3-fold CV for speed and preventing target leakage
            n_jobs=-1,
            passthrough=False
        )
        
        stacking_clf.fit(X_train, y_train)
        self.models['stacking_ensemble'] = stacking_clf
        logger.info("Stacking Ensemble Classifier training complete.")
        return stacking_clf

    def soft_voting_predict_proba(self, X):
        """Calculates soft-voting probability by averaging base model predictions."""
        lgb_model = self.models.get('lightgbm')
        cb_model = self.models.get('catboost')
        xgb_model = self.models.get('xgboost')
        
        probs = []
        if lgb_model is not None:
            probs.append(lgb_model.predict_proba(X)[:, 1])
        if cb_model is not None:
            probs.append(cb_model.predict_proba(X)[:, 1])
        if xgb_model is not None:
            probs.append(xgb_model.predict_proba(X)[:, 1])
            
        if len(probs) == 0:
            raise ValueError("No base models found for soft voting.")
        return np.mean(probs, axis=0)

    def ensemble_predict_proba(self, X):
        """Predicts probabilities using the Stacking Ensemble model (falls back to soft voting if not trained)."""
        stacking_model = self.models.get('stacking_ensemble')
        if stacking_model is not None:
            logger.debug("Ensemble prediction computed using Stacking Classifier (Meta-Learner)")
            return stacking_model.predict_proba(X)[:, 1]
        else:
            logger.debug("Ensemble prediction computed using Soft-Voting fallback")
            return self.soft_voting_predict_proba(X)

    def evaluate_model(self, y_true, y_prob, threshold=0.5):
        """Evaluates the predictions and returns a dictionary of metrics."""
        y_pred = (y_prob >= threshold).astype(int)
        
        # Precision, Recall, F1
        precision = precision_score(y_true, y_pred, zero_division=0)
        recall = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        
        # ROC-AUC
        roc_auc = roc_auc_score(y_true, y_prob)
        
        # PR-AUC
        precisions, recalls, _ = precision_recall_curve(y_true, y_prob)
        pr_auc = auc(recalls, precisions)
        
        # Confusion matrix
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
        
        return {
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'roc_auc': roc_auc,
            'pr_auc': pr_auc,
            'confusion_matrix': {'tn': int(tn), 'fp': int(fp), 'fn': int(fn), 'tp': int(tp)}
        }

    def save_pipeline(self, dir_path, model_version="v1.0.0", dataset_version="ieee_cis"):
        """Saves all trained models, the scaler, and model versioning metadata."""
        os.makedirs(dir_path, exist_ok=True)
        logger.info(f"Saving models, scaler, and version metadata to {dir_path}...")
        
        joblib.dump(self.scaler, os.path.join(dir_path, 'scaler.joblib'))
        joblib.dump(self.feature_cols, os.path.join(dir_path, 'feature_cols.joblib'))
        
        for name, model in self.models.items():
            model_path = os.path.join(dir_path, f'{name}.joblib')
            joblib.dump(model, model_path)
            logger.info(f"Saved {name} model.")
            
        # Model Versioning info
        version_info = {
            'model_version': model_version,
            'dataset_version': dataset_version,
            'training_date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'base_models': [name for name in self.models.keys() if name != 'stacking_ensemble'],
            'ensemble_type': 'StackingClassifier (Meta-Learner: LogisticRegression)' if 'stacking_ensemble' in self.models else 'None'
        }
        
        with open(os.path.join(dir_path, 'version_info.json'), 'w') as f:
            json.dump(version_info, f, indent=4)
        logger.info("Saved version_info.json metadata.")

    def load_pipeline(self, dir_path):
        """Loads models, the scaler, and prints versioning metadata."""
        logger.info(f"Loading pipeline from {dir_path}...")
        
        self.scaler = joblib.load(os.path.join(dir_path, 'scaler.joblib'))
        self.feature_cols = joblib.load(os.path.join(dir_path, 'feature_cols.joblib'))
        
        model_names = ['logistic_regression', 'lightgbm', 'catboost', 'xgboost', 'stacking_ensemble']
        for name in model_names:
            model_path = os.path.join(dir_path, f'{name}.joblib')
            if os.path.exists(model_path):
                self.models[name] = joblib.load(model_path)
                logger.info(f"Loaded {name} model.")
            else:
                logger.warning(f"Model file {model_path} not found.")
                
        # Read version metadata
        version_path = os.path.join(dir_path, 'version_info.json')
        if os.path.exists(version_path):
            with open(version_path, 'r') as f:
                version_info = json.load(f)
            logger.info(f"=== Pipeline Version Info ===")
            logger.info(f"  Model Version:   {version_info.get('model_version')}")
            logger.info(f"  Dataset Version: {version_info.get('dataset_version')}")
            logger.info(f"  Training Date:   {version_info.get('training_date')}")
            logger.info(f"  Ensemble Type:   {version_info.get('ensemble_type')}")
            logger.info(f"=============================")
        else:
            logger.warning("No version_info.json metadata found in directory.")
                
        return self
