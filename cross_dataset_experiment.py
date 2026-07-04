import os
import zipfile
import logging
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, recall_score, precision_score, f1_score, precision_recall_curve, auc, confusion_matrix
from lightgbm import LGBMClassifier
from xgboost import XGBClassifier

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    workspace_dir = "e:/fraud detection"
    ieee_zip = os.path.join(workspace_dir, "ieee-fraud-detection.zip")
    sparkov_zip = os.path.join(workspace_dir, "fraudTest.csv.zip")
    random_state = 42
    
    logger.info("=== Loading IEEE-CIS (Train Domain) ===")
    with zipfile.ZipFile(ieee_zip) as z:
        train_trans = pd.read_csv(z.open("train_transaction.csv"), nrows=50000)
    
    logger.info("=== Loading Sparkov (Test Domain) ===")
    with zipfile.ZipFile(sparkov_zip) as z:
        test_sp = pd.read_csv(z.open("fraudTest.csv"), nrows=50000)
        
    # --- Feature Ingestion & Alignments ---
    logger.info("Engineering aligned features...")
    
    # 1. IEEE features
    train_trans['hour_of_day'] = (train_trans['TransactionDT'] / 3600) % 24
    train_trans['day_of_week'] = (train_trans['TransactionDT'] / (3600 * 24)) % 7
    train_trans['spend_ratio_avg'] = train_trans['TransactionAmt'] / train_trans['TransactionAmt'].mean()
    
    # 2. Sparkov features
    test_sp['trans_date_trans_time'] = pd.to_datetime(test_sp['trans_date_trans_time'])
    test_sp['hour_of_day'] = test_sp['trans_date_trans_time'].dt.hour
    test_sp['day_of_week'] = test_sp['trans_date_trans_time'].dt.dayofweek
    test_sp['spend_ratio_avg'] = test_sp['amt'] / test_sp['amt'].mean()
    test_sp = test_sp.rename(columns={'amt': 'TransactionAmt', 'is_fraud': 'isFraud'})
    
    shared_cols = ['TransactionAmt', 'hour_of_day', 'day_of_week', 'spend_ratio_avg']
    
    # 3. Anomaly Scores (Isolation Forest) trained locally on normal transactions in each domain
    logger.info("Training Isolation Forest on IEEE (Normal)...")
    anomaly_detector_ieee = IsolationForest(contamination=0.03, random_state=random_state)
    anomaly_detector_ieee.fit(train_trans[train_trans['isFraud'] == 0][shared_cols])
    train_trans['anomaly_score'] = -anomaly_detector_ieee.decision_function(train_trans[shared_cols])
    
    logger.info("Training Isolation Forest on Sparkov (Normal)...")
    anomaly_detector_sp = IsolationForest(contamination=0.03, random_state=random_state)
    anomaly_detector_sp.fit(test_sp[test_sp['isFraud'] == 0][shared_cols])
    test_sp['anomaly_score'] = -anomaly_detector_sp.decision_function(test_sp[shared_cols])
    
    features = shared_cols + ['anomaly_score']
    
    # 4. Standardize separately to align scales across different datasets
    logger.info("Standardizing feature spaces separately...")
    scaler_ieee = StandardScaler()
    scaler_sp = StandardScaler()
    
    X_train = scaler_ieee.fit_transform(train_trans[features])
    y_train = train_trans['isFraud'].values
    
    X_test = scaler_sp.fit_transform(test_sp[features])
    y_test = test_sp['isFraud'].values
    
    # 5. Model Training & Cross-Dataset Testing
    logger.info("Evaluating models trained on IEEE and tested on Sparkov...")
    
    results = {}
    for name, clf in [
        ('Logistic Regression', LogisticRegression(class_weight='balanced', random_state=random_state, n_jobs=-1)),
        ('LightGBM', LGBMClassifier(class_weight='balanced', random_state=random_state, n_jobs=-1, verbose=-1)),
        ('XGBoost', XGBClassifier(random_state=random_state, eval_metric='logloss', n_jobs=-1)),
    ]:
        clf.fit(X_train, y_train)
        probs = clf.predict_proba(X_test)[:, 1]
        preds = (probs >= 0.5).astype(int)
        
        roc_auc = roc_auc_score(y_test, probs)
        precisions, recalls, _ = precision_recall_curve(y_test, probs)
        pr_auc = auc(recalls, precisions)
        
        recall = recall_score(y_test, preds, zero_division=0)
        precision = precision_score(y_test, preds, zero_division=0)
        f1 = f1_score(y_test, preds, zero_division=0)
        tn, fp, fn, tp = confusion_matrix(y_test, preds).ravel()
        
        results[name] = {
            'ROC-AUC': roc_auc,
            'PR-AUC': pr_auc,
            'Recall': recall,
            'Precision': precision,
            'F1-Score': f1,
            'CM': f"TN: {tn}, FP: {fp}, FN: {fn}, TP: {tp}"
        }
        
    print("\n" + "="*80)
    print("      CROSS-DATASET GENERALIZATION: TRAIN ON IEEE -> TEST ON SPARKOV")
    print("="*80)
    print(f"{'Model':<25} | {'ROC-AUC':<10} | {'PR-AUC':<10} | {'Recall':<10} | {'Precision':<10} | {'F1-Score':<10}")
    print("-" * 80)
    for model_name, metrics in results.items():
        print(f"{model_name:<25} | {metrics['ROC-AUC']:<10.4f} | {metrics['PR-AUC']:<10.4f} | {metrics['Recall']:<10.4f} | {metrics['Precision']:<10.4f} | {metrics['F1-Score']:<10.4f}")
    print("="*80)
    for model_name, metrics in results.items():
        print(f"[{model_name}] Confusion Matrix: {metrics['CM']}")

    
if __name__ == "__main__":
    main()
