import os
import zipfile
import logging
import pandas as pd
import numpy as np
from sklearn.preprocessing import OrdinalEncoder

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataPipeline:
    def __init__(self, workspace_dir="e:/fraud detection", sample_size=None, random_state=42):
        self.workspace_dir = workspace_dir
        self.sample_size = sample_size
        self.random_state = random_state
        self.ieee_zip_path = os.path.join(workspace_dir, "ieee-fraud-detection.zip")
        self.sparkov_zip_path = os.path.join(workspace_dir, "fraudTest.csv.zip")
        self.categorical_encoders = {}
        self.numerical_imputations = {}
        
    def load_ieee_raw(self, train_only=False):
        """Loads IEEE transaction and identity datasets from the zip file and merges them."""
        logger.info("Loading IEEE-CIS Fraud Detection dataset...")
        
        if not os.path.exists(self.ieee_zip_path):
            raise FileNotFoundError(f"IEEE zip file not found at: {self.ieee_zip_path}")
            
        with zipfile.ZipFile(self.ieee_zip_path) as z:
            # Load train files
            logger.info("Reading train_transaction.csv...")
            train_trans = pd.read_csv(z.open("train_transaction.csv"))
            logger.info(f"Loaded train transactions: {train_trans.shape}")
            
            logger.info("Reading train_identity.csv...")
            train_ident = pd.read_csv(z.open("train_identity.csv"))
            logger.info(f"Loaded train identities: {train_ident.shape}")
            
            # Merge train on TransactionID
            logger.info("Merging train transactions and identities...")
            train_df = pd.merge(train_trans, train_ident, on="TransactionID", how="left")
            logger.info(f"Merged train shape: {train_df.shape}")
            
            if train_only:
                return train_df, None
                
            # Load test files
            logger.info("Reading test_transaction.csv...")
            test_trans = pd.read_csv(z.open("test_transaction.csv"))
            logger.info(f"Loaded test transactions: {test_trans.shape}")
            
            logger.info("Reading test_identity.csv...")
            test_ident = pd.read_csv(z.open("test_identity.csv"))
            logger.info(f"Loaded test identities: {test_ident.shape}")
            
            # Align test identity columns (replace hyphens with underscores, e.g. id-01 -> id_01)
            test_ident.columns = [col.replace("-", "_") if col.startswith("id-") else col for col in test_ident.columns]
            
            # Merge test on TransactionID
            logger.info("Merging test transactions and identities...")
            test_df = pd.merge(test_trans, test_ident, on="TransactionID", how="left")
            logger.info(f"Merged test shape: {test_df.shape}")
            
            return train_df, test_df

    def load_sparkov_raw(self):
        """Loads the Sparkov dataset from its zip file."""
        logger.info("Loading Sparkov Fraud dataset...")
        
        if not os.path.exists(self.sparkov_zip_path):
            raise FileNotFoundError(f"Sparkov zip file not found at: {self.sparkov_zip_path}")
            
        with zipfile.ZipFile(self.sparkov_zip_path) as z:
            logger.info("Reading fraudTest.csv...")
            df = pd.read_csv(z.open("fraudTest.csv"))
            # Drop the index column if it exists
            if "Unnamed: 0" in df.columns:
                df = df.drop(columns=["Unnamed: 0"])
            logger.info(f"Loaded Sparkov shape: {df.shape}")
            return df

    def downsample_data(self, df, label_col, sample_size=None):
        """Samples the dataset ensuring representation of both classes (stratified sampling)."""
        target_size = sample_size or self.sample_size
        if target_size is None or len(df) <= target_size:
            return df
            
        logger.info(f"Downsampling dataset to {target_size} rows (stratifying on {label_col})...")
        
        # Calculate target proportions
        fraud_ratio = df[label_col].mean()
        # Ensure we have at least some fraud cases in the sample
        if fraud_ratio == 0:
            return df.sample(n=target_size, random_state=self.random_state)
            
        # Stratified split using pandas groupby/sample
        # We handle edge case where classes might be extremely imbalanced
        n_fraud = int(np.round(target_size * fraud_ratio))
        # Ensure we get at least some minimum number of fraud samples (e.g., 5% minimum or actual ratio if higher)
        n_fraud = max(n_fraud, min(1000, df[label_col].sum()))
        n_fraud = min(n_fraud, df[label_col].sum())
        n_legit = target_size - n_fraud
        
        df_fraud = df[df[label_col] == 1].sample(n=n_fraud, random_state=self.random_state, replace=False)
        df_legit = df[df[label_col] == 0].sample(n=n_legit, random_state=self.random_state, replace=False)
        
        sampled_df = pd.concat([df_fraud, df_legit]).sample(frac=1.0, random_state=self.random_state).reset_index(drop=True)
        logger.info(f"Sampled shape: {sampled_df.shape}, fraud rate: {sampled_df[label_col].mean():.4f}")
        return sampled_df

    def get_categorical_and_numerical_columns(self, df, target_col="isFraud", id_col="TransactionID"):
        """Identifies categorical and numerical features from data types."""
        feature_cols = [c for c in df.columns if c not in [target_col, id_col]]
        cat_cols = df[feature_cols].select_dtypes(include=["object", "category"]).columns.tolist()
        # Also treat card4, card6, ProductCD, DeviceType, DeviceInfo as categorical explicitly if they are numerical-like
        # but in IEEE they are already objects or categorical.
        num_cols = df[feature_cols].select_dtypes(exclude=["object", "category"]).columns.tolist()
        return cat_cols, num_cols

    def handle_missing_values(self, df, cat_cols, num_cols, is_train=True):
        """Imputes missing values.
        
        Categorical: filled with 'missing'
        Numerical: filled with median (computed on training set)
        """
        df = df.copy()
        
        # Categorical missing
        for col in cat_cols:
            if col in df.columns:
                df[col] = df[col].astype(str).fillna("missing").replace("nan", "missing")
                
        # Numerical missing
        for col in num_cols:
            if col in df.columns:
                if is_train:
                    median_val = df[col].median()
                    # If all values are NaN, default to 0
                    if pd.isna(median_val):
                        median_val = 0.0
                    self.numerical_imputations[col] = median_val
                
                fill_val = self.numerical_imputations.get(col, 0.0)
                df[col] = df[col].fillna(fill_val)
                
        return df

    def encode_categorical_features(self, train_df, test_df, cat_cols):
        """Encodes categorical features using OrdinalEncoder (label encoding) suitable for trees.
        
        Learns mapping from train_df and applies to test_df.
        """
        train_df = train_df.copy()
        if test_df is not None:
            test_df = test_df.copy()
            
        logger.info(f"Encoding {len(cat_cols)} categorical columns...")
        
        for col in cat_cols:
            if col not in train_df.columns:
                continue
                
            # Create encoder
            encoder = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
            
            # Reshape values
            train_vals = train_df[col].values.reshape(-1, 1)
            train_df[col] = encoder.fit_transform(train_vals)
            
            if test_df is not None and col in test_df.columns:
                test_vals = test_df[col].values.reshape(-1, 1)
                test_df[col] = encoder.transform(test_vals)
                
            self.categorical_encoders[col] = encoder
            
        return train_df, test_df
