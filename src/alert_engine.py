import logging

logger = logging.getLogger(__name__)

class AlertEngine:
    def __init__(self, high_threshold=0.70, med_threshold=0.40):
        self.high_threshold = high_threshold
        self.med_threshold = med_threshold

    def assess_risk(self, transaction_row, fraud_prob, anomaly_score):
        """Assesses risk and generates alerts by separating ML scoring from deterministic business policies.
        
        Args:
            transaction_row: pandas Series or dictionary containing transaction details.
            fraud_prob: Float, predicted fraud probability (from stacking ensemble).
            anomaly_score: Float, predicted anomaly score (from Isolation Forest).
            
        Returns:
            dict containing:
                - ml_risk_evaluation: dict of ML model metrics and risk levels
                - triggered_business_policies: list of triggered business rules
        """
        # Convert row to dict if it is a Series
        if hasattr(transaction_row, 'to_dict'):
            row_dict = transaction_row.to_dict()
        else:
            row_dict = dict(transaction_row)
            
        # 1. Machine Learning Model Risk Scoring (Model-based)
        if fraud_prob >= self.high_threshold:
            ml_risk_level = "High Risk"
            ml_color = "#ef4444" # red
            ml_message = f"Stacking Model Alert: High probability of fraud detected ({fraud_prob*100:.1f}%)"
            ml_alert_triggered = True
        elif fraud_prob >= self.med_threshold:
            ml_risk_level = "Medium Risk"
            ml_color = "#f97316" # orange
            ml_message = f"Stacking Model Alert: Elevated probability of fraud detected ({fraud_prob*100:.1f}%)"
            ml_alert_triggered = True
        else:
            ml_risk_level = "Low Risk"
            ml_color = "#10b981" # green
            ml_message = f"Stacking Model: Transaction within normal risk bounds ({fraud_prob*100:.1f}%)"
            ml_alert_triggered = False

        ml_risk_evaluation = {
            'risk_level': ml_risk_level,
            'fraud_probability': float(fraud_prob),
            'anomaly_score': float(anomaly_score),
            'color': ml_color,
            'message': ml_message,
            'alert_triggered': ml_alert_triggered
        }

        # 2. Deterministic Business Policy Rules (Rule-based / Policy compliance)
        business_policies = []
        amount = float(row_dict.get('TransactionAmt', row_dict.get('amt', 0.0)))
        
        # Rule A: Large-value transaction
        if amount > 5000:
            business_policies.append({
                'policy_name': "Large Value Transaction",
                'description': f"Transaction amount of ${amount:,.2f} exceeds high-value audit threshold of $5,000",
                'severity': "Medium"
            })
            
        # Rule B: Unsupervised anomaly detection override
        if anomaly_score > 0.70:
            business_policies.append({
                'policy_name': "Outlier Behavior",
                'description': f"Transaction matches statistical outlier profile (anomaly score: {anomaly_score*100:.1f}%)",
                'severity': "Medium"
            })
            if amount > 5000:
                business_policies.append({
                    'policy_name': "High-Value Outlier Combo",
                    'description': f"Large transaction amount (${amount:,.2f}) combined with statistical outlier profile",
                    'severity': "High"
                })

        # Rule C: Spending velocity check
        spend_ratio = float(row_dict.get('spend_ratio_avg', 1.0))
        if spend_ratio > 3.0:
            business_policies.append({
                'policy_name': "Velocity Spike",
                'description': f"Current transaction amount is {spend_ratio:.1f}x the customer's average historical transaction size",
                'severity': "Medium"
            })
            
        # Rule D: Late night temporal window audit
        hour = int(row_dict.get('hour_of_day', -1))
        if hour >= 0 and (hour <= 4 or hour >= 23) and amount > 500:
            business_policies.append({
                'policy_name': "Late Night Spend",
                'description': f"Substantial amount (${amount:,.2f}) processed during late night hours ({hour}:00)",
                'severity': "Low"
            })
            
        # Rule E: Long distance geographical mismatch (Sparkov coordination check)
        geo_distance = float(row_dict.get('geo_distance_km', 0.0))
        if geo_distance > 300.0:
            business_policies.append({
                'policy_name': "High Geographic Distance",
                'description': f"Distance between cardholder home address and merchant terminal is {geo_distance:.1f} km",
                'severity': "Medium"
            })
            
        # Rule F: Elevated Risk Domains or Merchant Rates
        email_risk = float(row_dict.get('P_emaildomain_risk', 0.0))
        if email_risk > 0.15:
            business_policies.append({
                'policy_name': "Elevated Domain Risk",
                'description': f"Transaction email domain carries elevated historical fraud rate ({email_risk*100:.1f}%)",
                'severity': "Low"
            })
            
        merchant_risk = float(row_dict.get('merchant_risk', 0.0))
        if merchant_risk > 0.15:
            business_policies.append({
                'policy_name': "High Risk Merchant",
                'description': f"Transaction merchant profile carries elevated historical fraud rate ({merchant_risk*100:.1f}%)",
                'severity': "Low"
            })
            
        return {
            'ml_risk_evaluation': ml_risk_evaluation,
            'triggered_business_policies': business_policies,
            'amount': amount,
            'timestamp': row_dict.get('TransactionDT', row_dict.get('unix_time', 'N/A'))
        }
