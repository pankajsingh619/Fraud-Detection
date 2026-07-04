import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import json
import logging
import zipfile
import numpy as np
import pandas as pd
import joblib
import scipy.stats
import scipy.spatial.distance
from sklearn.metrics import roc_auc_score, brier_score_loss, precision_score, recall_score, f1_score
from sklearn.calibration import calibration_curve
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LogisticRegression
from lightgbm import LGBMClassifier

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- DRIFT CALCULATION HELPERS ---

def calculate_psi(expected, actual, num_bins=10):
    """Calculates the Population Stability Index (PSI) between expected (train) and actual (test) features."""
    percentiles = np.linspace(0, 100, num_bins + 1)
    bins = np.percentile(expected, percentiles)
    bins = np.unique(bins)
    
    if len(bins) < 2:
        bins = np.linspace(expected.min(), expected.max(), num_bins + 1)
        
    bins[0] = min(bins[0], expected.min(), actual.min()) - 1e-5
    bins[-1] = max(bins[-1], expected.max(), actual.max()) + 1e-5
    
    expected_counts, _ = np.histogram(expected, bins=bins)
    actual_counts, _ = np.histogram(actual, bins=bins)
    
    expected_pct = expected_counts / len(expected)
    actual_pct = actual_counts / len(actual)
    
    eps = 1e-4
    expected_pct = np.where(expected_pct == 0, eps, expected_pct)
    actual_pct = np.where(actual_pct == 0, eps, actual_pct)
    
    expected_pct /= expected_pct.sum()
    actual_pct /= actual_pct.sum()
    
    psi_value = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))
    return float(psi_value)

def calculate_js_divergence(expected, actual, num_bins=20):
    """Calculates the Jensen-Shannon (JS) Divergence between expected (train) and actual (test) distributions."""
    min_val = min(expected.min(), actual.min())
    max_val = max(expected.max(), actual.max())
    bins = np.linspace(min_val, max_val, num_bins + 1)
    
    expected_counts, _ = np.histogram(expected, bins=bins)
    actual_counts, _ = np.histogram(actual, bins=bins)
    
    p = expected_counts / len(expected)
    q = actual_counts / len(actual)
    
    # Square the JS distance to get JS divergence
    js_distance = scipy.spatial.distance.jensenshannon(p, q)
    js_div = js_distance ** 2
    return float(js_div) if not np.isnan(js_div) else 0.0

def calculate_ks_statistic(expected, actual):
    """Calculates the Kolmogorov-Smirnov (KS) statistic and p-value between two distributions."""
    ks_res = scipy.stats.ks_2samp(expected, actual)
    return {
        'ks_statistic': float(ks_res.statistic),
        'p_value': float(ks_res.pvalue)
    }

# --- STATISTICAL SIGNIFICANCE HELPERS ---

def compute_mcnemar_test(y_true, y_prob_a, y_prob_b, threshold=0.5):
    """Computes McNemar's test for binary predictions comparison of model A vs model B."""
    y_pred_a = (y_prob_a >= threshold).astype(int)
    y_pred_b = (y_prob_b >= threshold).astype(int)
    
    correct_a = (y_pred_a == y_true)
    correct_b = (y_pred_b == y_true)
    
    b = np.sum(correct_a & ~correct_b)
    c = np.sum(~correct_a & correct_b)
    
    if b + c > 0:
        chi2_stat = ((abs(b - c) - 1.0) ** 2) / (b + c)
        p_val = scipy.stats.chi2.sf(chi2_stat, df=1)
    else:
        chi2_stat = 0.0
        p_val = 1.0
        
    return {
        'b': int(b),
        'c': int(c),
        'chi2_statistic': float(chi2_stat),
        'p_value': float(p_val),
        'significant_diff': bool(p_val < 0.05)
    }

# --- BOOTSTRAPPING FOR CONFIDENCE INTERVALS ---

def bootstrap_roc_auc(y_true, y_prob, n_bootstraps=500, random_state=42):
    """Computes the 95% Confidence Interval for ROC-AUC using bootstrapping."""
    rng = np.random.default_rng(random_state)
    bootstrapped_scores = []
    
    indices = np.arange(len(y_true))
    for _ in range(n_bootstraps):
        boot_idx = rng.choice(indices, size=len(indices), replace=True)
        # In case the bootstrap sample contains only one class
        if len(np.unique(y_true[boot_idx])) < 2:
            continue
        score = roc_auc_score(y_true[boot_idx], y_prob[boot_idx])
        bootstrapped_scores.append(score)
        
    sorted_scores = np.sort(bootstrapped_scores)
    lower_bound = np.percentile(sorted_scores, 2.5)
    upper_bound = np.percentile(sorted_scores, 97.5)
    
    return float(lower_bound), float(upper_bound)

def main():
    workspace_dir = "e:/fraud detection"
    models_dir = os.path.join(workspace_dir, "models")
    ieee_zip = os.path.join(workspace_dir, "ieee-fraud-detection.zip")
    sparkov_zip = os.path.join(workspace_dir, "fraudTest.csv.zip")
    
    # 1. Load trained models
    logger.info("Loading pipeline and models...")
    from src.models import FraudModels
    models_engine = FraudModels()
    models_engine.load_pipeline(models_dir)
    
    preprocessing_meta_path = os.path.join(models_dir, 'preprocessing_meta.joblib')
    if os.path.exists(preprocessing_meta_path):
        preprocessing_meta = joblib.load(preprocessing_meta_path)
        num_cols = preprocessing_meta['num_cols']
    else:
        logger.error("preprocessing_meta.joblib not found!")
        sys.exit(1)
        
    # 2. Ingest IEEE-CIS and Sparkov datasets for Drift Analysis
    logger.info("Loading datasets for drift calculation...")
    with zipfile.ZipFile(ieee_zip) as z:
        ieee_raw = pd.read_csv(z.open("train_transaction.csv"), nrows=20000)
    with zipfile.ZipFile(sparkov_zip) as z:
        sparkov_raw = pd.read_csv(z.open("fraudTest.csv"), nrows=20000)
        
    # Preprocess drift features
    ieee_raw['hour_of_day'] = (ieee_raw['TransactionDT'] / 3600) % 24
    ieee_raw['day_of_week'] = (ieee_raw['TransactionDT'] / (3600 * 24)) % 7
    ieee_raw['spend_ratio_avg'] = ieee_raw['TransactionAmt'] / ieee_raw['TransactionAmt'].mean()
    
    sparkov_raw['trans_date_trans_time'] = pd.to_datetime(sparkov_raw['trans_date_trans_time'])
    sparkov_raw['hour_of_day'] = sparkov_raw['trans_date_trans_time'].dt.hour
    sparkov_raw['day_of_week'] = sparkov_raw['trans_date_trans_time'].dt.dayofweek
    sparkov_raw['spend_ratio_avg'] = sparkov_raw['amt'] / sparkov_raw['amt'].mean()
    sparkov_raw = sparkov_raw.rename(columns={'amt': 'TransactionAmt', 'is_fraud': 'isFraud'})
    
    shared_cols = ['TransactionAmt', 'hour_of_day', 'day_of_week', 'spend_ratio_avg']
    
    # Anomaly Scores (Isolation Forest) calculated per domain
    logger.info("Computing anomaly scores for drift check...")
    anomaly_detector_ieee = IsolationForest(contamination=0.03, random_state=42)
    anomaly_detector_ieee.fit(ieee_raw[ieee_raw['isFraud'] == 0][shared_cols])
    ieee_raw['anomaly_score'] = -anomaly_detector_ieee.decision_function(ieee_raw[shared_cols])
    
    anomaly_detector_sp = IsolationForest(contamination=0.03, random_state=42)
    anomaly_detector_sp.fit(sparkov_raw[sparkov_raw['isFraud'] == 0][shared_cols])
    sparkov_raw['anomaly_score'] = -anomaly_detector_sp.decision_function(sparkov_raw[shared_cols])
    
    drift_features = shared_cols + ['anomaly_score']
    
    # 3. Calculate Drift Metrics
    logger.info("Calculating Feature Drift metrics...")
    drift_results = {}
    for col in drift_features:
        expected = ieee_raw[col].values
        actual = sparkov_raw[col].values
        
        psi = calculate_psi(expected, actual)
        js_div = calculate_js_divergence(expected, actual)
        ks_stats = calculate_ks_statistic(expected, actual)
        
        # Determine drift status
        if psi >= 0.25:
            status = "Significant Drift"
        elif psi >= 0.1:
            status = "Moderate Drift"
        else:
            status = "No Drift"
            
        drift_results[col] = {
            'psi': psi,
            'js_divergence': js_div,
            'ks_statistic': ks_stats['ks_statistic'],
            'ks_p_value': ks_stats['p_value'],
            'status': status
        }
        logger.info(f"Drift Feature '{col}': PSI={psi:.4f}, JS Div={js_div:.4f}, KS={ks_stats['ks_statistic']:.4f} (Status: {status})")

    # 4. Compute Test Set predictions on Sparkov for advanced metrics
    logger.info("Evaluating models on Sparkov test split...")
    scaler = StandardScaler()
    X_train_drift = scaler.fit_transform(ieee_raw[drift_features])
    X_test_drift = scaler.transform(sparkov_raw[drift_features])
    
    y_test = sparkov_raw['isFraud'].values
    
    # Fit aligned classifiers on training domain to evaluate performance
    logger.info("Training aligned classifiers on common feature space for generalization report...")
    clf_lr = LogisticRegression(class_weight='balanced', random_state=42, n_jobs=-1)
    clf_lr.fit(X_train_drift, ieee_raw['isFraud'].values)
    
    clf_lgb = LGBMClassifier(objective='binary', class_weight='balanced', n_estimators=100, random_state=42, n_jobs=-1, verbose=-1)
    clf_lgb.fit(X_train_drift, ieee_raw['isFraud'].values)
    
    from catboost import CatBoostClassifier
    clf_cb = CatBoostClassifier(iterations=100, random_seed=42, auto_class_weights='Balanced', verbose=0, thread_count=-1)
    clf_cb.fit(X_train_drift, ieee_raw['isFraud'].values)
    
    from xgboost import XGBClassifier
    clf_xgb = XGBClassifier(use_label_encoder=False, eval_metric='logloss', scale_pos_weight=10.0, n_estimators=100, random_state=42, n_jobs=-1)
    clf_xgb.fit(X_train_drift, ieee_raw['isFraud'].values)
    
    from sklearn.ensemble import StackingClassifier
    clf_stack = StackingClassifier(
        estimators=[('lgb', clf_lgb), ('cb', clf_cb), ('xgb', clf_xgb)],
        final_estimator=LogisticRegression(class_weight='balanced', random_state=42, n_jobs=-1),
        cv=3,
        n_jobs=-1
    )
    clf_stack.fit(X_train_drift, ieee_raw['isFraud'].values)
    
    # Store aligned classifiers for prediction
    eval_models = {
        'Logistic Regression': clf_lr,
        'LightGBM': clf_lgb,
        'CatBoost': clf_cb,
        'XGBoost': clf_xgb,
        'Stacking Ensemble': clf_stack
    }
    
    # Get predictions
    y_probs = {}
    for name, clf in eval_models.items():
        y_probs[name] = clf.predict_proba(X_test_drift)[:, 1]
        
    # 5. Bootstrapping & Brier Score
    logger.info("Computing bootstrapped ROC-AUC CIs and Brier Scores...")
    metric_results = {}
    for name, probs in y_probs.items():
        roc_auc = roc_auc_score(y_test, probs)
        brier = brier_score_loss(y_test, probs)
        lower_ci, upper_ci = bootstrap_roc_auc(y_test, probs)
        
        metric_results[name] = {
            'roc_auc': float(roc_auc),
            'roc_auc_ci_lower': lower_ci,
            'roc_auc_ci_upper': upper_ci,
            'brier_score': float(brier)
        }
        logger.info(f"{name}: ROC-AUC={roc_auc:.4f} (95% CI: [{lower_ci:.4f}, {upper_ci:.4f}]), Brier={brier:.4f}")

    # 6. Statistical Significance (McNemar Tests)
    logger.info("Computing McNemar significance tests...")
    significance_results = {}
    
    # Compare LightGBM vs CatBoost
    significance_results['lgb_vs_cb'] = compute_mcnemar_test(y_test, y_probs['LightGBM'], y_probs['CatBoost'])
    # Compare Stacking Ensemble vs LightGBM
    significance_results['stack_vs_lgb'] = compute_mcnemar_test(y_test, y_probs['Stacking Ensemble'], y_probs['LightGBM'])
    
    logger.info(f"McNemar LightGBM vs CatBoost p-value: {significance_results['lgb_vs_cb']['p_value']:.4e} (Significant: {significance_results['lgb_vs_cb']['significant_diff']})")
    logger.info(f"McNemar Stacking vs LightGBM p-value: {significance_results['stack_vs_lgb']['p_value']:.4e} (Significant: {significance_results['stack_vs_lgb']['significant_diff']})")

    # 7. Calibration Curve comparison
    logger.info("Computing multi-model calibration curves...")
    calibration_results = {}
    for name, probs in y_probs.items():
        fraction_of_positives, mean_predicted_value = calibration_curve(y_test, probs, n_bins=10)
        calibration_results[name] = {
            'fraction_of_positives': fraction_of_positives.tolist(),
            'mean_predicted_values': mean_predicted_value.tolist()
        }

    # 8. Threshold & Cost-Sensitive Analysis
    logger.info("Evaluating business cost-sensitive optimization...")
    thresholds = np.linspace(0, 1.0, 51)
    cost_results = []
    
    # Cost parameters
    cost_fp = 10.0 # Customer friction / phone call verification cost
    cost_tp = 5.0  # Verification cost
    transaction_amts = sparkov_raw['TransactionAmt'].values
    
    stack_probs = y_probs['Stacking Ensemble']
    
    for t in thresholds:
        preds = (stack_probs >= t).astype(int)
        
        # Compute metrics
        prec = precision_score(y_test, preds, zero_division=0)
        rec = recall_score(y_test, preds, zero_division=0)
        f1 = f1_score(y_test, preds, zero_division=0)
        
        fp_mask = (y_test == 0) & (preds == 1)
        tp_mask = (y_test == 1) & (preds == 1)
        fn_mask = (y_test == 1) & (preds == 0)
        
        n_fp = int(fp_mask.sum())
        n_tp = int(tp_mask.sum())
        n_fn = int(fn_mask.sum())
        
        fp_cost = n_fp * cost_fp
        tp_cost = n_tp * cost_tp
        fn_cost = float(np.sum(transaction_amts[fn_mask]))
        
        total_cost = fp_cost + tp_cost + fn_cost
        
        cost_results.append({
            'threshold': float(t),
            'precision': float(prec),
            'recall': float(rec),
            'f1_score': float(f1),
            'fp_count': n_fp,
            'tp_count': n_tp,
            'fn_count': n_fn,
            'total_cost': total_cost
        })
        
    optimal_idx = np.argmin([c['total_cost'] for c in cost_results])
    optimal_threshold = cost_results[optimal_idx]['threshold']
    optimal_cost = cost_results[optimal_idx]['total_cost']
    logger.info(f"Optimal threshold for Stacking Ensemble is {optimal_threshold:.2f} with total cost of ${optimal_cost:,.2f}")

    # 9. Save all results to plots/detailed_metrics.json
    output_path = os.path.join(workspace_dir, "plots", "detailed_metrics.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    payload = {
        'drift_results': drift_results,
        'metric_results': metric_results,
        'significance_results': significance_results,
        'calibration_results': calibration_results,
        'cost_analysis': cost_results,
        'optimal_threshold': float(optimal_threshold),
        'optimal_cost': float(optimal_cost)
    }
    
    with open(output_path, 'w') as f:
        json.dump(payload, f, indent=4)
    logger.info(f"Saved all advanced metrics to {output_path}")

if __name__ == '__main__':
    main()
