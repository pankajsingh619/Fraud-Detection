import logging
import joblib
from sklearn.ensemble import IsolationForest

logger = logging.getLogger(__name__)

class AnomalyDetector:
    def __init__(self, contamination=0.03, random_state=42):
        self.contamination = contamination
        self.random_state = random_state
        self.model = None
        self.features = None

    def select_features(self, df, num_cols):
        """Selects a subset of numerical columns for the anomaly detector to run efficiently."""
        # We focus on key behavior and transaction columns to avoid noise and high dimensionality issues
        target_features = [
            'TransactionAmt', 'amt', 'hour_of_day', 'day_of_week', 
            'is_weekend', 'user_trans_count', 'spend_ratio_avg', 
            'time_since_last_trans', 'geo_distance_km', 'dist1', 'dist2'
        ]
        # Include V-columns or C-columns from IEEE if they are present
        c_cols = [c for c in df.columns if c.startswith('C') and c[1:].isdigit()]
        target_features.extend(c_cols[:5]) # limit to first 5 C columns
        
        # Filter features that are actually in df and num_cols
        selected = [col for col in target_features if col in df.columns and col in num_cols]
        
        # Fallback to standard numerical columns if none of the target features exist
        if len(selected) == 0:
            selected = num_cols[:10]
            
        logger.info(f"Selected {len(selected)} numerical features for anomaly detection: {selected}")
        return selected

    def fit(self, df, num_cols, label_col):
        """Trains the Isolation Forest on legitimate (non-fraudulent) transactions only."""
        logger.info("Training Isolation Forest anomaly detector on normal transactions...")
        
        # 1. Select features
        self.features = self.select_features(df, num_cols)
        
        # 2. Extract normal transactions
        normal_df = df[df[label_col] == 0]
        if len(normal_df) == 0:
            logger.warning("No normal transactions found in training set. Fitting on all data.")
            normal_df = df
            
        X_train = normal_df[self.features]
        
        # 3. Fit model
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=self.random_state,
            n_jobs=-1
        )
        self.model.fit(X_train)
        logger.info("Anomaly detector training complete.")
        return self

    def predict_anomaly_score(self, df):
        """Generates anomaly score for each transaction.
        
        Score is computed as -decision_function(X), so that higher score represents higher anomaly.
        """
        if self.model is None or self.features is None:
            raise ValueError("Anomaly detector model is not trained yet. Call fit() first.")
            
        X = df[self.features]
        # decision_function returns negative values for anomalies, positive for normal.
        # We invert it: -decision_function so higher is more anomalous.
        # Shift it so that it is roughly non-negative and scaled.
        raw_scores = -self.model.decision_function(X)
        
        # Scale between 0 and 1 using min-max mapping (approximate for visualization/alerts)
        # Isolation Forest decision scores generally fall between -0.5 and 0.5.
        # -decision_function ranges from -0.5 (normal) to 0.5 (very anomalous).
        # We map it to [0, 1] using simple clipping/offsetting for a user-friendly score.
        anomaly_scores = (raw_scores + 0.5) / 1.0
        anomaly_scores = anomaly_scores.clip(0.0, 1.0)
        
        return anomaly_scores

    def save(self, filepath):
        """Saves the anomaly detector state to disk."""
        logger.info(f"Saving anomaly detector to {filepath}...")
        joblib.dump({
            'model': self.model,
            'features': self.features,
            'contamination': self.contamination
        }, filepath)

    def load(self, filepath):
        """Loads the anomaly detector state from disk."""
        logger.info(f"Loading anomaly detector from {filepath}...")
        data = joblib.load(filepath)
        self.model = data['model']
        self.features = data['features']
        self.contamination = data['contamination']
        return self
