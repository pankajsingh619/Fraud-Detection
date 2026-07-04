import logging
import shap
import numpy as np
import pandas as pd
import plotly.graph_objects as go

logger = logging.getLogger(__name__)

class FraudExplainer:
    def __init__(self):
        self.explainer = None
        self.base_value = None

    def fit(self, model, X_background):
        """Initializes the SHAP TreeExplainer using the primary GBDT model (e.g. LightGBM)."""
        logger.info("Initializing SHAP TreeExplainer...")
        # For tree models, shap.TreeExplainer is very fast. We can pass a background dataset
        # to get expected values calibrated, or fit without it.
        # Passing a background sample ensures proper expected value computation.
        self.explainer = shap.TreeExplainer(model, X_background)
        
        # In SHAP, the expected value can be a scalar (single output) or array (multi-class)
        # For binary classification, it is often a scalar representing log-odds or probability depending on the model.
        if isinstance(self.explainer.expected_value, np.ndarray):
            self.base_value = self.explainer.expected_value[1] # standard binary index 1
        else:
            self.base_value = self.explainer.expected_value
            
        logger.info(f"SHAP Explainer initialized. Expected base value (margin/log-odds): {self.base_value:.4f}")
        return self

    def get_local_explanation(self, X_row, feature_names):
        """Calculates SHAP values for a single transaction row.
        
        Returns:
            dict containing base_value, SHAP values, feature names, actual values, and sorted impact.
        """
        if self.explainer is None:
            raise ValueError("SHAP Explainer is not initialized. Call fit() first.")
            
        # Ensure row is 2D DataFrame
        if isinstance(X_row, pd.Series):
            X_row_df = pd.DataFrame([X_row])
        else:
            X_row_df = X_row
            
        # Compute SHAP values
        shap_values = self.explainer.shap_values(X_row_df)
        
        # If output is a list (e.g. for multi-class or raw outputs), extract the positive class
        if isinstance(shap_values, list):
            # LightGBM outputs a list of two arrays in older SHAP versions [class_0, class_1]
            row_shap = shap_values[1][0]
        elif len(shap_values.shape) == 3: # (samples, features, classes)
            row_shap = shap_values[0, :, 1]
        elif len(shap_values.shape) == 2 and shap_values.shape[0] == 1:
            row_shap = shap_values[0]
        else:
            row_shap = shap_values
            
        # Create a df with feature name, shap value, and actual value
        actual_vals = X_row_df.iloc[0].values
        
        explanation_df = pd.DataFrame({
            'feature': feature_names,
            'shap_value': row_shap,
            'actual_value': actual_vals
        })
        
        # Sort by absolute SHAP value to find top drivers
        explanation_df['abs_shap'] = explanation_df['shap_value'].abs()
        explanation_df = explanation_df.sort_values(by='abs_shap', ascending=False).reset_index(drop=True)
        
        # Separate positive contributors (pushing towards fraud) and negative contributors (pushing towards legit)
        positive_drivers = explanation_df[explanation_df['shap_value'] > 0].copy()
        negative_drivers = explanation_df[explanation_df['shap_value'] < 0].copy()
        
        return {
            'base_value': self.base_value,
            'shap_values': row_shap,
            'features_df': explanation_df,
            'positive_drivers': positive_drivers.to_dict('records'),
            'negative_drivers': negative_drivers.to_dict('records')
        }

    def generate_plotly_explanation(self, local_expl_dict, top_n=10):
        """Generates a premium, interactive Plotly bar chart visualizing SHAP feature impact.
        
        Positive values (red) increase fraud probability.
        Negative values (blue) decrease fraud probability.
        """
        df = local_expl_dict['features_df'].head(top_n).copy()
        
        # Reverse order for horizontal plot layout (top features at the top)
        df = df.iloc[::-1]
        
        # Set colors based on positive/negative contribution
        colors = ['rgba(239, 68, 68, 0.85)' if val > 0 else 'rgba(59, 130, 246, 0.85)' for val in df['shap_value']]
        borders = ['rgb(220, 38, 38)' if val > 0 else 'rgb(37, 99, 235)' for val in df['shap_value']]
        
        fig = go.Figure()
        
        # Build horizontal bar chart
        fig.add_trace(go.Bar(
            y=[f"{feat} = {str(val)[:12]}" for feat, val in zip(df['feature'], df['actual_value'])],
            x=df['shap_value'],
            orientation='h',
            marker=dict(
                color=colors,
                line=dict(color=borders, width=1.5)
            ),
            hovertemplate="<b>Feature</b>: %{y}<br><b>SHAP Value</b>: %{x:+.4f}<extra></extra>"
        ))
        
        # Customize visual aesthetics
        fig.update_layout(
            title=dict(
                text=f"Top {top_n} Contributing Features to Risk Prediction",
                font=dict(size=16, family="Inter, sans-serif", color="#1e293b")
            ),
            xaxis=dict(
                title="SHAP Feature Impact (Log-Odds Contribution)",
                gridcolor="#f1f5f9",
                zerolinecolor="#cbd5e1",
                zerolinewidth=1.5
            ),
            yaxis=dict(
                autorange=True,
                showgrid=False
            ),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            margin=dict(l=20, r=20, t=50, b=40),
            height=350
        )
        
        return fig

    def generate_global_importance_plotly(self, X_sample, feature_names, top_n=15):
        """Generates global feature importance based on mean absolute SHAP values."""
        logger.info("Computing global SHAP feature importance...")
        shap_values = self.explainer.shap_values(X_sample)
        
        if isinstance(shap_values, list):
            # Take the positive class
            mean_abs_shap = np.abs(shap_values[1]).mean(axis=0)
        elif len(shap_values.shape) == 3: # (samples, features, classes)
            mean_abs_shap = np.abs(shap_values[:, :, 1]).mean(axis=0)
        else:
            mean_abs_shap = np.abs(shap_values).mean(axis=0)
            
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'mean_abs_shap': mean_abs_shap
        }).sort_values(by='mean_abs_shap', ascending=False).head(top_n).reset_index(drop=True)
        
        # Sort in reverse for Plotly horizontal bar chart
        importance_df = importance_df.iloc[::-1]
        
        fig = go.Figure()
        fig.add_trace(go.Bar(
            y=importance_df['feature'],
            x=importance_df['mean_abs_shap'],
            orientation='h',
            marker=dict(
                color='rgba(139, 92, 246, 0.85)', # violet HSL
                line=dict(color='rgb(109, 40, 217)', width=1.5)
            ),
            hovertemplate="<b>Feature</b>: %{y}<br><b>Mean |SHAP|</b>: %{x:.4f}<extra></extra>"
        ))
        
        fig.update_layout(
            title=dict(
                text=f"Global SHAP Feature Importance (Top {top_n})",
                font=dict(size=16, family="Inter, sans-serif", color="#1e293b")
            ),
            xaxis=dict(
                title="Mean Absolute SHAP Value (Average Impact Magnitude)",
                gridcolor="#f1f5f9"
            ),
            yaxis=dict(
                showgrid=False
            ),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            margin=dict(l=20, r=20, t=50, b=40),
            height=450
        )
        
        return fig, importance_df
