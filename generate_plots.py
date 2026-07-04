import os
import zipfile
import logging
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.preprocessing import OrdinalEncoder, StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_curve, precision_recall_curve, auc, 
    confusion_matrix, ConfusionMatrixDisplay
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
    return 6367 * c

def main():
    workspace_dir = "e:/fraud detection"
    zip_path = os.path.join(workspace_dir, "fraudTest.csv.zip")
    plots_dir = os.path.join(workspace_dir, "plots")
    os.makedirs(plots_dir, exist_ok=True)
    random_state = 42
    
    logger.info("=== Loading Dataset for Plot Generation ===")
    if not os.path.exists(zip_path):
        raise FileNotFoundError(f"Sparkov dataset zip file not found at: {zip_path}")
        
    with zipfile.ZipFile(zip_path) as z:
        df = pd.read_csv(z.open("fraudTest.csv"))
        if "Unnamed: 0" in df.columns:
            df = df.drop(columns=["Unnamed: 0"])
            
    # Sort temporally
    df['trans_date_trans_time'] = pd.to_datetime(df['trans_date_trans_time'])
    df = df.sort_values(by='trans_date_trans_time').reset_index(drop=True)
    
    # Split into 80% train and 20% test temporally
    split_idx = int(len(df) * 0.8)
    train_raw = df.iloc[:split_idx].copy()
    test_raw = df.iloc[split_idx:].copy()
    
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

    logger.info("Downsampling data for visualization runs...")
    train_df = downsample(train_raw, 50000)
    test_df = downsample(test_raw, 50000)
    
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
    
    num_cols = [
        'amt', 'hour_of_day', 'day_of_week', 'is_weekend', 'age',
        'geo_distance_km', 'user_trans_count', 'spend_ratio_avg', 'time_since_last_trans'
    ]
    
    # 5. Isolation Forest (Anomaly Score)
    logger.info("Training Isolation Forest Anomaly Detector...")
    normal_train = train_eng[train_eng['is_fraud'] == 0]
    
    anomaly_detector = IsolationForest(contamination=0.03, random_state=random_state, n_jobs=-1)
    anomaly_detector.fit(normal_train[num_cols])
    
    train_eng['anomaly_score'] = (-anomaly_detector.decision_function(train_eng[num_cols]) + 0.5).clip(0.0, 1.0)
    test_eng['anomaly_score'] = (-anomaly_detector.decision_function(test_eng[num_cols]) + 0.5).clip(0.0, 1.0)
    
    num_cols.append('anomaly_score')
    
    features = num_cols + ['merchant', 'category', 'gender', 'state', 'job']
    X_train = train_eng[features]
    y_train = train_eng['is_fraud'].values
    X_test = test_eng[features]
    y_test = test_eng['is_fraud'].values
    
    # Scale features specifically for Logistic Regression baseline
    scaler = StandardScaler()
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    X_train_scaled[num_cols] = scaler.fit_transform(X_train[num_cols])
    X_test_scaled[num_cols] = scaler.transform(X_test[num_cols])
    
    # --- Model Training ---
    models = {}
    
    logger.info("Training models...")
    # A. Logistic Regression
    lr = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=random_state, n_jobs=-1)
    lr.fit(X_train_scaled, y_train)
    models['Logistic Regression'] = lr
    
    # B. LightGBM
    lgb = LGBMClassifier(class_weight='balanced', n_estimators=100, learning_rate=0.05, random_state=random_state, n_jobs=-1, verbose=-1)
    lgb.fit(X_train, y_train)
    models['LightGBM'] = lgb
    
    # C. CatBoost
    cat = CatBoostClassifier(iterations=150, learning_rate=0.08, depth=6, auto_class_weights='Balanced', random_seed=random_state, verbose=0, thread_count=-1)
    cat.fit(X_train, y_train)
    models['CatBoost'] = cat
    
    # D. XGBoost
    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    xgb = XGBClassifier(scale_pos_weight=scale_pos_weight, n_estimators=100, max_depth=6, learning_rate=0.05, eval_metric='logloss', random_state=random_state, n_jobs=-1)
    xgb.fit(X_train, y_train)
    models['XGBoost'] = xgb
    
    # --- Predictions ---
    logger.info("Generating predictions and plotting curves...")
    
    probs = {}
    probs['Logistic Regression'] = models['Logistic Regression'].predict_proba(X_test_scaled)[:, 1]
    probs['LightGBM'] = models['LightGBM'].predict_proba(X_test)[:, 1]
    probs['CatBoost'] = models['CatBoost'].predict_proba(X_test)[:, 1]
    probs['XGBoost'] = models['XGBoost'].predict_proba(X_test)[:, 1]
    probs['Ensemble (Soft-Voting)'] = (probs['LightGBM'] + probs['CatBoost'] + probs['XGBoost']) / 3.0
    
    # Setup premium plotting styles
    plt.rcParams['font.family'] = 'sans-serif'
    plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']
    plt.rcParams['axes.edgecolor'] = '#cbd5e1'
    plt.rcParams['axes.linewidth'] = 1.2
    
    colors = {
        'Logistic Regression': '#64748b', # Slate
        'LightGBM': '#0ea5e9',            # Sky blue
        'CatBoost': '#ec4899',            # Pink
        'XGBoost': '#f59e0b',             # Amber
        'Ensemble (Soft-Voting)': '#8b5cf6' # Violet
    }
    
    # --- 1. ROC Curve ---
    logger.info("Plotting ROC Curve...")
    plt.figure(figsize=(8, 6), dpi=300)
    plt.plot([0, 1], [0, 1], linestyle='--', color='#94a3b8', alpha=0.7, label='Random Guess')
    
    for name, prob in probs.items():
        fpr, tpr, _ = roc_curve(y_test, prob)
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, label=f'{name} (AUC = {roc_auc:.4f})', color=colors[name], linewidth=2)
        
    plt.title('Receiver Operating Characteristic (ROC) Curve Comparison', fontsize=12, fontweight='bold', pad=15)
    plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=10, labelpad=8)
    plt.ylabel('True Positive Rate (Sensitivity / Recall)', fontsize=10, labelpad=8)
    plt.grid(color='#f1f5f9', linestyle='-', linewidth=0.8)
    plt.legend(frameon=True, facecolor='white', edgecolor='#e2e8f0', loc='lower right')
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, 'roc_curve.png'))
    plt.close()
    
    # --- 2. Precision-Recall Curve ---
    logger.info("Plotting Precision-Recall Curve...")
    plt.figure(figsize=(8, 6), dpi=300)
    
    for name, prob in probs.items():
        p, r, _ = precision_recall_curve(y_test, prob)
        pr_auc = auc(r, p)
        plt.plot(r, p, label=f'{name} (PR-AUC = {pr_auc:.4f})', color=colors[name], linewidth=2)
        
    plt.title('Precision-Recall (PR) Curve Comparison', fontsize=12, fontweight='bold', pad=15)
    plt.xlabel('Recall (Sensitivity)', fontsize=10, labelpad=8)
    plt.ylabel('Precision (Positive Predictive Value)', fontsize=10, labelpad=8)
    plt.grid(color='#f1f5f9', linestyle='-', linewidth=0.8)
    plt.legend(frameon=True, facecolor='white', edgecolor='#e2e8f0', loc='lower left')
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, 'precision_recall_curve.png'))
    plt.close()
    
    # --- 3. Confusion Matrix Heatmap for Ensemble ---
    logger.info("Plotting Confusion Matrix Heatmap...")
    ens_preds = (probs['Ensemble (Soft-Voting)'] >= 0.5).astype(int)
    cm = confusion_matrix(y_test, ens_preds)
    
    fig, ax = plt.subplots(figsize=(6, 5), dpi=300)
    im = ax.imshow(cm, cmap='Blues', interpolation='nearest')
    
    # Heatmap colorbar
    cbar = ax.figure.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.ax.tick_params(labelsize=9)
    
    # Axis ticks
    ax.set_xticks(np.arange(2))
    ax.set_yticks(np.arange(2))
    ax.set_xticklabels(['Legit', 'Fraud'], fontsize=10)
    ax.set_yticklabels(['Legit', 'Fraud'], fontsize=10)
    
    # Text annotations in boxes
    thresh = cm.max() / 2.
    for i in range(2):
        for j in range(2):
            ax.text(j, i, f"{cm[i, j]:,}",
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black",
                    fontsize=12, fontweight='semibold')
            
    plt.title('Soft-Voting Ensemble Confusion Matrix', fontsize=12, fontweight='bold', pad=15)
    plt.xlabel('Predicted Label', fontsize=10, labelpad=8)
    plt.ylabel('True Label', fontsize=10, labelpad=8)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, 'confusion_matrix_ensemble.png'))
    plt.close()
    
    # --- 4. LightGBM Feature Importance ---
    logger.info("Plotting Feature Importance...")
    lgb_model = models['LightGBM']
    importances = lgb_model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    plt.figure(figsize=(9, 6), dpi=300)
    plt.bar([features[i] for i in indices], importances[indices], color='#6366f1', edgecolor='#4f46e5', linewidth=1)
    plt.title('LightGBM Feature Importance (Split Gain Count)', fontsize=12, fontweight='bold', pad=15)
    plt.xticks(rotation=45, ha='right', fontsize=9)
    plt.ylabel('Splits Count Feature Used', fontsize=10, labelpad=8)
    plt.grid(axis='y', color='#f1f5f9', linestyle='-', linewidth=0.8)
    plt.tight_layout()
    plt.savefig(os.path.join(plots_dir, 'feature_importance.png'))
    plt.close()
    
    logger.info(f"All graphs successfully generated and saved to: {plots_dir}")

if __name__ == "__main__":
    main()
