import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
import argparse
import logging
import json
import pandas as pd
import numpy as np
import joblib
from src.data_processing import DataPipeline
from src.feature_engineering import FeatureEngineer
from src.anomaly_detection import AnomalyDetector
from src.models import FraudModels
from src.explainability import FraudExplainer


# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def parse_args():
    parser = argparse.ArgumentParser(description="Financial Fraud Detection ML Pipeline")
    parser.add_argument("--workspace", type=str, default="e:/fraud detection", help="Path to workspace directory")
    parser.add_argument("--sample-size", type=int, default=50000, help="Downsample training size (set to 0 for full run)")
    parser.add_argument("--random-state", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--output-dir", type=str, default="models", help="Directory to save models and reports")
    return parser.parse_args()

def main():
    args = parse_args()
    os.makedirs(args.output_dir, exist_ok=True)
    
    # 1. Initialize Pipeline modules
    logger.info("Initializing Data Preprocessing Pipeline...")
    sample_size = args.sample_size if args.sample_size > 0 else None
    data_pipe = DataPipeline(workspace_dir=args.workspace, sample_size=sample_size, random_state=args.random_state)
    feat_eng = FeatureEngineer()
    anomaly_det = AnomalyDetector(contamination=0.03, random_state=args.random_state)
    models_engine = FraudModels(random_state=args.random_state)
    
    # 2. Ingest and Downsample Raw Data
    logger.info("Loading raw IEEE datasets from zip...")
    train_raw, test_raw = data_pipe.load_ieee_raw(train_only=True)
    
    # Sample the data if requested to run within reasonable time limits
    if sample_size is not None:
        logger.info(f"Applying stratified downsampling to {sample_size} rows...")
        train_sampled = data_pipe.downsample_data(train_raw, label_col='isFraud')
    else:
        train_sampled = train_raw.sort_values(by='TransactionDT').reset_index(drop=True)
        
    # Clean memory
    del train_raw
    
    # 3. Temporal Train-Validation Split (Industry Best Practice)
    logger.info("Performing temporal train-validation split (80-20)...")
    train_sampled = train_sampled.sort_values(by='TransactionDT').reset_index(drop=True)
    split_idx = int(len(train_sampled) * 0.8)
    train_split = train_sampled.iloc[:split_idx].copy()
    val_split = train_sampled.iloc[split_idx:].copy()
    
    logger.info(f"Training split shape: {train_split.shape}, Val split shape: {val_split.shape}")
    logger.info(f"Training fraud rate: {train_split['isFraud'].mean():.4f}, Val fraud rate: {val_split['isFraud'].mean():.4f}")
    
    # 4. Separate features and target
    y_train = train_split['isFraud'].values
    y_val = val_split['isFraud'].values
    
    # 5. Get Column Types
    cat_cols, num_cols = data_pipe.get_categorical_and_numerical_columns(train_split, target_col='isFraud', id_col='TransactionID')
    
    # 6. Fill Missing Values
    logger.info("Imputing missing values...")
    train_split_filled = data_pipe.handle_missing_values(train_split, cat_cols, num_cols, is_train=True)
    val_split_filled = data_pipe.handle_missing_values(val_split, cat_cols, num_cols, is_train=False)
    
    # 7. Encode Categorical Features
    logger.info("Encoding categorical features...")
    train_split_encoded, val_split_encoded = data_pipe.encode_categorical_features(
        train_split_filled, val_split_filled, cat_cols
    )
    
    # 8. Feature Engineering
    logger.info("Running Feature Engineering...")
    train_engineered = feat_eng.engineer_ieee_features(train_split_encoded, is_train=True)
    val_engineered = feat_eng.engineer_ieee_features(val_split_encoded, is_train=False)
    
    # Update categorical and numerical column lists after engineering new features
    # (e.g. hour_of_day, day_of_week, user_trans_count are numerical; temporal/weekend etc.)
    new_features = ['hour_of_day', 'day_of_week', 'is_weekend', 'user_trans_count', 
                    'user_trans_sum', 'user_trans_avg', 'spend_ratio_avg', 'time_since_last_trans']
    # Add mapped risk scores
    risk_score_cols = [f"{col}_risk" for col in cat_cols if col in ['P_emaildomain', 'R_emaildomain', 'ProductCD', 'card4', 'card6', 'DeviceType']]
    num_cols = num_cols + new_features + risk_score_cols
    
    # 9. Anomaly Detection (Isolation Forest)
    logger.info("Training anomaly detector on legitimate transactions...")
    anomaly_det.fit(train_engineered, num_cols, label_col='isFraud')
    
    train_engineered['anomaly_score'] = anomaly_det.predict_anomaly_score(train_engineered)
    val_engineered['anomaly_score'] = anomaly_det.predict_anomaly_score(val_engineered)
    
    # Add anomaly_score to numerical columns
    num_cols.append('anomaly_score')
    
    # 10. Prepare training matrices
    feature_cols = [c for c in train_engineered.columns if c not in ['isFraud', 'TransactionID', 'TransactionDT']]
    X_train = train_engineered[feature_cols]
    X_val = val_engineered[feature_cols]
    
    logger.info(f"Final training feature space shape: {X_train.shape}")
    
    # 11. Train Classifiers
    models_engine.feature_cols = feature_cols
    models_engine.fit_scaler(X_train, num_cols)
    
    # Train Logistic Regression
    models_engine.train_logistic_regression(X_train, y_train, num_cols)
    
    # Train LightGBM
    lgb_model = models_engine.train_lightgbm(X_train, y_train)
    
    # Train CatBoost
    models_engine.train_catboost(X_train, y_train)
    
    # Train XGBoost
    models_engine.train_xgboost(X_train, y_train)
    
    # Train Stacking Ensemble Classifier
    models_engine.train_stacking_ensemble(X_train, y_train)
    
    # 12. Evaluate Models individually and the Stacking Ensemble
    logger.info("Evaluating models on Validation Set...")
    
    results = {}
    
    # Evaluate Logistic Regression
    X_val_scaled = models_engine.scale_features(X_val, num_cols)
    lr_cols = [c for c in num_cols if c in X_val.columns]
    lr_probs = models_engine.models['logistic_regression'].predict_proba(X_val_scaled[lr_cols])[:, 1]
    results['Logistic Regression'] = models_engine.evaluate_model(y_val, lr_probs)
    
    # Evaluate LightGBM
    lgb_probs = models_engine.models['lightgbm'].predict_proba(X_val)[:, 1]
    results['LightGBM'] = models_engine.evaluate_model(y_val, lgb_probs)
    
    # Evaluate CatBoost
    cb_probs = models_engine.models['catboost'].predict_proba(X_val)[:, 1]
    results['CatBoost'] = models_engine.evaluate_model(y_val, cb_probs)
    
    # Evaluate XGBoost
    xgb_probs = models_engine.models['xgboost'].predict_proba(X_val)[:, 1]
    results['XGBoost'] = models_engine.evaluate_model(y_val, xgb_probs)
    
    # Evaluate Stacking Ensemble
    stacking_probs = models_engine.ensemble_predict_proba(X_val)
    results['Stacking Ensemble'] = models_engine.evaluate_model(y_val, stacking_probs)
    
    # 13. Initialize SHAP Explainer on LightGBM and save it
    # We use a subset of validation data as background (100 rows)
    logger.info("Fitting SHAP TreeExplainer on LightGBM...")
    explainer = FraudExplainer()
    background_sample = X_train.sample(n=min(100, len(X_train)), random_state=args.random_state)
    explainer.fit(lgb_model, background_sample)
    
    # 14. Save Models and Metadata
    logger.info(f"Saving all pipeline components to {args.output_dir}...")
    models_engine.save_pipeline(args.output_dir)
    anomaly_det.save(os.path.join(args.output_dir, 'anomaly_detector.joblib'))
    joblib.dump(explainer, os.path.join(args.output_dir, 'shap_explainer.joblib'))
    
    # Save preprocessing metadata
    preprocessing_meta = {
        'categorical_encoders': data_pipe.categorical_encoders,
        'numerical_imputations': data_pipe.numerical_imputations,
        'risk_mappings': feat_eng.risk_mappings,
        'num_cols': num_cols,
        'cat_cols': cat_cols
    }
    joblib.dump(preprocessing_meta, os.path.join(args.output_dir, 'preprocessing_meta.joblib'))
    
    # 15. Generate reports
    # Log results table
    logger.info("Validation Results Summary:")
    print(f"{'Model':<25} | {'ROC-AUC':<10} | {'PR-AUC':<10} | {'Recall':<10} | {'Precision':<10} | {'F1-Score':<10}")
    print("-" * 75)
    for model_name, metrics in results.items():
        print(f"{model_name:<25} | {metrics['roc_auc']:<10.4f} | {metrics['pr_auc']:<10.4f} | {metrics['recall']:<10.4f} | {metrics['precision']:<10.4f} | {metrics['f1_score']:<10.4f}")

        
    # Write JSON report
    with open(os.path.join(args.output_dir, "evaluation_report.json"), "w") as f:
        json.dump(results, f, indent=4)
        
    # Write beautiful markdown report
    markdown_report_path = os.path.join(args.output_dir, "evaluation_report.md")
    with open(markdown_report_path, "w") as f:
        f.write("# Model Evaluation Report\n\n")
        f.write("This report evaluates the performance of the various machine learning models trained on the IEEE-CIS Fraud Detection dataset.\n\n")
        f.write("## Performance Metrics Comparison\n\n")
        f.write("| Model | ROC-AUC | PR-AUC | Recall | Precision | F1-Score |\n")
        f.write("| :--- | :---: | :---: | :---: | :---: | :---: |\n")
        for model_name, metrics in results.items():
            f.write(f"| {model_name} | {metrics['roc_auc']:.4f} | {metrics['pr_auc']:.4f} | {metrics['recall']:.4f} | {metrics['precision']:.4f} | {metrics['f1_score']:.4f} |\n")
            
        f.write("\n## Detailed Confusion Matrices\n\n")
        for model_name, metrics in results.items():
            cm = metrics['confusion_matrix']
            f.write(f"### {model_name}\n")
            f.write(f"- **True Negatives (Legitimate flagged as Legitimate)**: {cm['tn']:,}\n")
            f.write(f"- **False Positives (Legitimate flagged as Fraud)**: {cm['fp']:,}\n")
            f.write(f"- **False Negatives (Fraud flagged as Legitimate)**: {cm['fn']:,}\n")
            f.write(f"- **True Positives (Fraud flagged as Fraud)**: {cm['tp']:,}\n\n")
            
    logger.info(f"Pipeline complete! Validation results saved to {markdown_report_path}")

if __name__ == "__main__":
    main()
