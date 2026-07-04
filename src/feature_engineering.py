import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

def haversine_distance(lon1, lat1, lon2, lat2):
    """Computes vectorized Haversine distance between coordinate points in kilometers."""
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(np.radians, [lon1, lat1, lon2, lat2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = np.sin(dlat/2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2.0)**2
    c = 2 * np.arcsin(np.sqrt(a))
    km = 6367 * c # Radius of earth in kilometers
    return km

class FeatureEngineer:
    def __init__(self):
        self.risk_mappings = {}

    def fit_risk_scores(self, df, cat_cols, label_col):
        """Fits historical fraud risk scores for categorical columns using target encoding on train data.
        
        To prevent leakage, adds a small smoothing factor.
        """
        global_mean = df[label_col].mean()
        self.risk_mappings['global_mean'] = global_mean
        
        for col in cat_cols:
            if col not in df.columns:
                continue
            
            # Group by category and compute stats
            stats = df.groupby(col)[label_col].agg(['count', 'mean'])
            
            # Apply additive smoothing (Bayesian target encoding)
            # smooth_val = (count * mean + m * global_mean) / (count + m)
            m = 10 # smoothing parameter
            smoothed = (stats['count'] * stats['mean'] + m * global_mean) / (stats['count'] + m)
            
            self.risk_mappings[col] = smoothed.to_dict()
            logger.debug(f"Computed risk scores for {col}: {len(self.risk_mappings[col])} categories")

    def transform_risk_scores(self, df, cat_cols):
        """Maps previously computed risk scores to a dataframe."""
        df = df.copy()
        global_mean = self.risk_mappings.get('global_mean', 0.0)
        
        for col in cat_cols:
            if col not in df.columns:
                continue
            
            mapping = self.risk_mappings.get(col, {})
            risk_col_name = f"{col}_risk"
            
            # Map values, fill missing/unknown categories with global mean
            df[risk_col_name] = df[col].map(mapping).fillna(global_mean)
            
        return df

    def engineer_ieee_features(self, df, is_train=True):
        """Engineers advanced features for the IEEE dataset."""
        logger.info("Engineering features for IEEE dataset...")
        df = df.copy()
        
        # 1. Temporal features
        # TransactionDT represents seconds from a reference point.
        # Let's extract hour of day and day of week (assuming reference is Monday 00:00:00)
        df['hour_of_day'] = (df['TransactionDT'] / 3600) % 24
        df['day_of_week'] = (df['TransactionDT'] / (3600 * 24)) % 7
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # 2. Card User Proxy (Standard practice in IEEE dataset to identify a credit card user)
        # We combine card1, card2, card3, card5, card6, addr1, addr2
        df['card_user_id'] = (
            df['card1'].astype(str) + "_" + 
            df['card2'].astype(str) + "_" + 
            df['card3'].astype(str) + "_" + 
            df['card5'].astype(str) + "_" + 
            df['card6'].astype(str) + "_" + 
            df['addr1'].astype(str) + "_" + 
            df['addr2'].astype(str)
        )
        
        # Sort by TransactionDT to ensure temporal order for velocity computation
        df = df.sort_values(by='TransactionDT').reset_index(drop=True)
        
        # 3. Transaction Velocity & Spending Behavior
        # Velocity in terms of transaction counts in rolling windows of TransactionDT
        # Since rolling on millions of rows is slow, we use grouped shifts and cumulative counts/means
        # Compute user's historical transaction count and average amount up to this point
        logger.info("Computing velocity and historical spending statistics...")
        
        # Cumulative count of transactions per card user
        df['user_trans_count'] = df.groupby('card_user_id').cumcount() + 1
        
        # Cumulative sum of transaction amounts per card user
        df['user_trans_sum'] = df.groupby('card_user_id')['TransactionAmt'].cumsum()
        
        # Average transaction amount for this user
        df['user_trans_avg'] = df['user_trans_sum'] / df['user_trans_count']
        
        # Spending deviation: ratio of current transaction amount to the user's historical average amount
        # Add 1e-5 to prevent division by zero
        df['spend_ratio_avg'] = df['TransactionAmt'] / (df['user_trans_avg'] + 1e-5)
        
        # Time delta between consecutive transactions for the same user (velocity proxy)
        df['time_since_last_trans'] = df.groupby('card_user_id')['TransactionDT'].diff().fillna(-1)
        
        # 4. Risk Scores
        # Fit risk scores if training, otherwise apply mappings
        risk_cols = ['P_emaildomain', 'R_emaildomain', 'ProductCD', 'card4', 'card6', 'DeviceType']
        risk_cols = [c for c in risk_cols if c in df.columns]
        
        if is_train:
            self.fit_risk_scores(df, risk_cols, 'isFraud')
            
        df = self.transform_risk_scores(df, risk_cols)
        
        # Clean up temporary columns
        df = df.drop(columns=['card_user_id'])
        
        return df

    def engineer_sparkov_features(self, df, is_train=True):
        """Engineers advanced features for the Sparkov dataset."""
        logger.info("Engineering features for Sparkov dataset...")
        df = df.copy()
        
        # Ensure timestamp is parsed
        if not pd.api.types.is_datetime64_any_dtype(df['trans_date_trans_time']):
            df['trans_date_trans_time'] = pd.to_datetime(df['trans_date_trans_time'])
            
        # Sort by time
        df = df.sort_values(by='trans_date_trans_time').reset_index(drop=True)
        
        # 1. Temporal features
        df['hour_of_day'] = df['trans_date_trans_time'].dt.hour
        df['day_of_week'] = df['trans_date_trans_time'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Calculate age of customer from date of birth (dob)
        df['dob'] = pd.to_datetime(df['dob'])
        df['age'] = (df['trans_date_trans_time'] - df['dob']).dt.days // 365
        
        # 2. Geographic Distance
        logger.info("Computing geographic distance between customer and merchant...")
        df['geo_distance_km'] = haversine_distance(
            df['long'], df['lat'], 
            df['merch_long'], df['merch_lat']
        )
        
        # 3. Transaction Velocity & Spending Behavior
        logger.info("Computing velocity and spending statistics...")
        # Cumulative count and spending averages per credit card number (cc_num)
        df['user_trans_count'] = df.groupby('cc_num').cumcount() + 1
        df['user_trans_sum'] = df.groupby('cc_num')['amt'].cumsum()
        df['user_trans_avg'] = df['user_trans_sum'] / df['user_trans_count']
        
        df['spend_ratio_avg'] = df['amt'] / (df['user_trans_avg'] + 1e-5)
        
        # Time since last transaction
        if 'unix_time' in df.columns:
            df['time_since_last_trans'] = df.groupby('cc_num')['unix_time'].diff().fillna(-1)
        else:
            df['time_since_last_trans'] = df.groupby('cc_num')['trans_date_trans_time'].diff().dt.total_seconds().fillna(-1)
            
        # 4. Risk Scores
        risk_cols = ['merchant', 'category', 'gender', 'state', 'job']
        risk_cols = [c for c in risk_cols if c in df.columns]
        
        if is_train:
            self.fit_risk_scores(df, risk_cols, 'is_fraud')
            
        df = self.transform_risk_scores(df, risk_cols)
        
        return df
