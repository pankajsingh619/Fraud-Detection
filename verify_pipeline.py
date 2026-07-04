import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
import joblib
import pandas as pd
import numpy as np
from src.models import FraudModels
from src.anomaly_detection import AnomalyDetector

def verify():
    print("=== GuardianEye Verification Script ===")
    
    models_dir = "models"
    shared_dir = os.path.join(models_dir, "shared_models")
    
    # 1. Check folder existence
    if not os.path.exists(models_dir):
        print(f"[ERROR] Models directory '{models_dir}' not found.")
        return False
    print("[OK] Models directory exists.")
    
    # 2. Check model artifacts
    required_files = [
        'scaler.joblib', 'feature_cols.joblib', 
        'lightgbm.joblib', 'xgboost.joblib', 'catboost.joblib', 'logistic_regression.joblib',
        'anomaly_detector.joblib', 'preprocessing_meta.joblib', 'shap_explainer.joblib'
    ]
    
    missing_files = []
    for f in required_files:
        path = os.path.join(models_dir, f)
        if not os.path.exists(path):
            missing_files.append(f)
            
    if missing_files:
        print(f"[ERROR] Missing primary model files: {missing_files}")
        return False
    print("[OK] All primary model files exist.")
    
    # Check shared model artifacts
    required_shared = [
        'scaler.joblib', 'feature_cols.joblib', 
        'lightgbm.joblib', 'xgboost.joblib', 'catboost.joblib', 'logistic_regression.joblib',
        'shared_anomaly_detector.joblib'
    ]
    missing_shared = []
    for f in required_shared:
        path = os.path.join(shared_dir, f)
        if not os.path.exists(path):
            missing_shared.append(f)
            
    if missing_shared:
        print(f"[ERROR] Missing shared model files: {missing_shared}")
        return False
    print("[OK] All shared model files exist.")
    
    # 3. Check reports
    reports = ['evaluation_report.md', 'evaluation_report.json', 'cross_dataset_validation_report.md', 'cross_dataset_validation.json']
    missing_reports = [r for r in reports if not os.path.exists(os.path.join(models_dir, r))]
    if missing_reports:
        print(f"[ERROR] Missing reports: {missing_reports}")
        return False
    print("[OK] All reports generated successfully.")
    
    # 4. Load Models and test predictions
    try:
        print("\nTesting Model Loading and Predictions...")
        models_engine = FraudModels().load_pipeline(models_dir)
        anomaly_det = AnomalyDetector().load(os.path.join(models_dir, "anomaly_detector.joblib"))
        
        # Build dummy transaction row
        features = models_engine.feature_cols
        dummy_data = {feat: 0.0 for feat in features}
        dummy_df = pd.DataFrame([dummy_data])
        
        # Test anomaly prediction
        anomaly_score = anomaly_det.predict_anomaly_score(dummy_df)[0]
        print(f"[OK] Anomaly score prediction test: {anomaly_score:.4f}")
        
        # Test ensemble probability prediction
        prob = models_engine.ensemble_predict_proba(dummy_df)[0]
        print(f"[OK] Ensemble fraud probability prediction test: {prob*100:.2f}%")
        
    except Exception as e:
        print(f"[ERROR] Error during model prediction test: {e}")
        return False
        
    print("\nALL PIPELINE VALIDATIONS PASSED SUCCESSFULLY!")
    return True

if __name__ == "__main__":
    success = verify()
    exit(0 if success else 1)
