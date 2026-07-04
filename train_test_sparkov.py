import os
import zipfile
import logging
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OrdinalEncoder, StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    precision_score, recall_score, f1_score, 
    roc_auc_score, precision_recall_curve, auc, confusion_matrix
)
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier
from xgboost import XGBClassifier

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Vectorized Haversine distance
def haversine_distance(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(np.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = np.sin(dlat/2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2.0)**2
    c = 2 * np.arcsin(np.sqrt(a))
    km = 6367 * c
    return km

def main():
    workspace_dir = "e:/fraud detection"
    zip_path = os.path.join(workspace_dir, "fraudTest.csv.zip")
    random_state = 42
    
    logger.info("=== Loading Sparkov Dataset from Zip ===")
    if not os.path.exists(zip_path):
        raise FileNotFoundError(f"Sparkov dataset zip file not found at: {zip_path}")
        
    with zipfile.ZipFile(zip_path) as z:
        df = pd.read_csv(z.open("fraudTest.csv"))
        if "Unnamed: 0" in df.columns:
            df = df.drop(columns=["Unnamed: 0"])
            
    logger.info(f"Loaded Sparkov shape: {df.shape}")
    
    # Sort temporally
    logger.info("Parsing dates and sorting temporally...")
    df['trans_date_trans_time'] = pd.to_datetime(df['trans_date_trans_time'])
    df = df.sort_values(by='trans_date_trans_time').reset_index(drop=True)
    
    # Split into 80% train and 20% test temporally
    split_idx = int(len(df) * 0.8)
    train_raw = df.iloc[:split_idx].copy()
    test_raw = df.iloc[split_idx:].copy()
    
    logger.info(f"Train raw shape: {train_raw.shape}, Test raw shape: {test_raw.shape}")
    
    # Downsample train and test to run quickly and avoid memory/CPU limits
    # We sample 50,000 train transactions and 50,000 test transactions, keeping a high representation of fraud
    def downsample(data, sample_size=50000):
        fraud_df = data[data['is_fraud'] == 1]
        legit_df = data[data['is_fraud'] == 0]
        
        n_fraud = min(len(fraud_df), sample_size // 10) # cap fraud at 10% of sample or actual if smaller
        n_legit = sample_size - n_fraud
        
        sampled_fraud = fraud_df.sample(n=n_fraud, random_state=random_state, replace=False) if len(fraud_df) >= n_fraud else fraud_df
        sampled_legit = legit_df.sample(n=n_legit, random_state=random_state, replace=False)
        
        return pd.concat([sampled_fraud, sampled_legit]).sample(frac=1.0, random_state=random_state).reset_index(drop=True)

    logger.info("Applying downsampling to train and test sets for fast execution...")
    train_df = downsample(train_raw, 50000)
    test_df = downsample(test_raw, 50000)
    
    logger.info(f"Train sampled: {train_df.shape} (Fraud rate: {train_df['is_fraud'].mean()*100:.2f}%)")
    logger.info(f"Test sampled: {test_df.shape} (Fraud rate: {test_df['is_fraud'].mean()*100:.2f}%)")
    
    # Clean memory
    del df, train_raw, test_raw
    
    # --- Feature Engineering ---
    logger.info("Engineering features...")
    
    def engineer_features(data, is_train, fit_encoders=None):
        data = data.copy()
        
        # 1. Temporal
        data['hour_of_day'] = data['trans_date_trans_time'].dt.hour
        data['day_of_week'] = data['trans_date_trans_time'].dt.dayofweek
        data['is_weekend'] = data['day_of_week'].isin([5, 6]).astype(int)
        
        data['dob'] = pd.to_datetime(data['dob'])
        data['age'] = (data['trans_date_trans_time'] - data['dob']).dt.days // 365
        
        # 2. Geospatial distance
        data['geo_distance_km'] = haversine_distance(
            data['long'], data['lat'], 
            data['merch_long'], data['merch_lat']
        )
        
        # 3. Velocity / History
        data['user_trans_count'] = data.groupby('cc_num').cumcount() + 1
        data['user_trans_sum'] = data.groupby('cc_num')['amt'].cumsum()
        data['user_trans_avg'] = data['user_trans_sum'] / data['user_trans_count']
        data['spend_ratio_avg'] = data['amt'] / (data['user_trans_avg'] + 1e-5)
        
        data['time_since_last_trans'] = data.groupby('cc_num')['unix_time'].diff().fillna(-1)
        
        # 4. Categorical Encodings
        cat_cols = ['merchant', 'category', 'gender', 'state', 'job']
        encoders = fit_encoders or {}
        
        for col in cat_cols:
            # Handle NaNs
            data[col] = data[col].astype(str).fillna("missing")
            if is_train:
                encoder = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
                data[col] = encoder.fit_transform(data[col].values.reshape(-1, 1))
                encoders[col] = encoder
            else:
                encoder = encoders.get(col)
                if encoder is not None:
                    data[col] = encoder.transform(data[col].values.reshape(-1, 1))
                else:
                    data[col] = -1
                    
        return data, encoders

    train_eng, encoders = engineer_features(train_df, is_train=True)
    test_eng, _ = engineer_features(test_df, is_train=False, fit_encoders=encoders)
    
    # Numerical features for Anomaly Detection
    num_cols = [
        'amt', 'hour_of_day', 'day_of_week', 'is_weekend', 'age',
        'geo_distance_km', 'user_trans_count', 'spend_ratio_avg', 'time_since_last_trans'
    ]
    
    # 5. Isolation Forest (Anomaly Score)
    logger.info("Training Isolation Forest Anomaly Detector...")
    normal_train = train_eng[train_eng['is_fraud'] == 0]
    
    anomaly_detector = IsolationForest(contamination=0.03, random_state=random_state, n_jobs=-1)
    anomaly_detector.fit(normal_train[num_cols])
    
    # Predict anomaly score
    train_eng['anomaly_score'] = (-anomaly_detector.decision_function(train_eng[num_cols]) + 0.5).clip(0.0, 1.0)
    test_eng['anomaly_score'] = (-anomaly_detector.decision_function(test_eng[num_cols]) + 0.5).clip(0.0, 1.0)
    
    # Include anomaly score in numerical columns
    num_cols.append('anomaly_score')
    
    # --- Prepare feature matrices ---
    features = num_cols + ['merchant', 'category', 'gender', 'state', 'job']
    X_train = train_eng[features]
    y_train = train_eng['is_fraud'].values
    X_test = test_eng[features]
    y_test = test_eng['is_fraud'].values
    
    logger.info(f"Features list: {features}")
    logger.info(f"X_train shape: {X_train.shape}, X_test shape: {X_test.shape}")
    
    # Scale features specifically for Logistic Regression baseline
    scaler = StandardScaler()
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    
    X_train_scaled[num_cols] = scaler.fit_transform(X_train[num_cols])
    X_test_scaled[num_cols] = scaler.transform(X_test[num_cols])
    
    # --- Model Training ---
    models = {}
    
    # A. Logistic Regression Baseline
    logger.info("Training Logistic Regression...")
    lr = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=random_state, n_jobs=-1)
    lr.fit(X_train_scaled, y_train)
    models['Logistic Regression'] = lr
    
    # B. LightGBM
    logger.info("Training LightGBM...")
    lgb = LGBMClassifier(class_weight='balanced', n_estimators=100, learning_rate=0.05, random_state=random_state, n_jobs=-1, verbose=-1)
    lgb.fit(X_train, y_train)
    models['LightGBM'] = lgb
    
    # C. CatBoost
    logger.info("Training CatBoost...")
    cat = CatBoostClassifier(iterations=150, learning_rate=0.08, depth=6, auto_class_weights='Balanced', random_seed=random_state, verbose=0, thread_count=-1)
    cat.fit(X_train, y_train)
    models['CatBoost'] = cat
    
    # D. XGBoost
    logger.info("Training XGBoost...")
    # Calculate scale_pos_weight
    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    xgb = XGBClassifier(scale_pos_weight=scale_pos_weight, n_estimators=100, max_depth=6, learning_rate=0.05, eval_metric='logloss', random_state=random_state, n_jobs=-1)
    xgb.fit(X_train, y_train)
    models['XGBoost'] = xgb
    
    # --- Predictions and Evaluation ---
    logger.info("Evaluating models...")
    scores = {}
    
    def evaluate(y_true, y_prob):
        y_pred = (y_prob >= 0.5).astype(int)
        precision = precision_score(y_true, y_pred, zero_division=0)
        recall = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_true, y_prob)
        
        precisions, recalls, _ = precision_recall_curve(y_true, y_prob)
        pr_auc = auc(recalls, precisions)
        
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
        
        return {
            'ROC-AUC': roc_auc,
            'PR-AUC': pr_auc,
            'Precision': precision,
            'Recall': recall,
            'F1-Score': f1,
            'Confusion Matrix': f"TN: {tn}, FP: {fp}, FN: {fn}, TP: {tp}"
        }

    # Logistic Regression
    lr_probs = models['Logistic Regression'].predict_proba(X_test_scaled)[:, 1]
    scores['Logistic Regression'] = evaluate(y_test, lr_probs)
    
    # LightGBM
    lgb_probs = models['LightGBM'].predict_proba(X_test)[:, 1]
    scores['LightGBM'] = evaluate(y_test, lgb_probs)
    
    # CatBoost
    cat_probs = models['CatBoost'].predict_proba(X_test)[:, 1]
    scores['CatBoost'] = evaluate(y_test, cat_probs)
    
    # XGBoost
    xgb_probs = models['XGBoost'].predict_proba(X_test)[:, 1]
    scores['XGBoost'] = evaluate(y_test, xgb_probs)
    
    # Ensemble (Soft-Voting)
    ensemble_probs = (lgb_probs + cat_probs + xgb_probs) / 3.0
    scores['Ensemble (Soft-Voting)'] = evaluate(y_test, ensemble_probs)
    
    # --- Display Scores ---
    print("\n" + "="*50)
    print("           MODEL TEST EVALUATION SCORES")
    print("="*50)
    print(f"{'Model':<25} | {'ROC-AUC':<10} | {'PR-AUC':<10} | {'Recall':<10} | {'Precision':<10} | {'F1-Score':<10}")
    print("-" * 80)
    for model_name, metrics in scores.items():
        print(f"{model_name:<25} | {metrics['ROC-AUC']:<10.4f} | {metrics['PR-AUC']:<10.4f} | {metrics['Recall']:<10.4f} | {metrics['Precision']:<10.4f} | {metrics['F1-Score']:<10.4f}")
    print("="*80)
    
    for model_name, metrics in scores.items():
        print(f"[{model_name}] Confusion Matrix: {metrics['Confusion Matrix']}")
        
    # Save scores to JSON
    with open(os.path.join(workspace_dir, "sparkov_scores.json"), "w") as f:
        json.dump(scores, f, indent=4)

if __name__ == "__main__":
    main()
