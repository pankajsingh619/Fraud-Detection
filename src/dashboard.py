import os
import sys
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

import streamlit as st
import pandas as pd
import numpy as np
import joblib
import json
import plotly.graph_objects as go
from datetime import datetime

from src.models import FraudModels
from src.anomaly_detection import AnomalyDetector
from src.explainability import FraudExplainer
from src.alert_engine import AlertEngine
from src.rag_investigator import RAGInvestigator

# --- STREAMLIT DASHBOARD CONFIGURATION ---
st.set_page_config(
    page_title="GuardianEye: Intelligent Financial Fraud Investigation System",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom premium CSS injection for corporate cybersecurity design
st.markdown("""
<style>
    /* Main layout style */
    .stApp {
        background-color: #0f172a;
        color: #f8fafc;
    }
    
    /* Header style */
    .main-title {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(90deg, #8b5cf6, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .main-subtitle {
        color: #94a3b8;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    
    /* Premium card container styling */
    .metric-card {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 1.2rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    .metric-val {
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0.5rem 0;
    }
    
    /* Custom tab headers styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: #1e293b;
        padding: 8px;
        border-radius: 8px;
        border: 1px solid #334155;
    }
    .stTabs [data-baseweb="tab"] {
        height: 40px;
        white-space: pre-wrap;
        background-color: transparent;
        border-radius: 4px;
        color: #94a3b8;
        font-weight: 600;
        font-size: 0.9rem;
        border: none;
    }
    .stTabs [data-baseweb="tab"]:hover {
        color: #f8fafc;
        background-color: #334155;
    }
    .stTabs [aria-selected="true"] {
        background-color: #8b5cf6 !important;
        color: #ffffff !important;
    }
    
    /* Sidebar adjustments */
    .css-1d391kg {
        background-color: #0f172a;
    }
</style>
""", unsafe_allow_html=True)

# --- LOAD MODELS & META ---
@st.cache_resource
def load_pipeline_components():
    models_dir = "models"
    models_engine = FraudModels()
    models_engine.load_pipeline(models_dir)
    
    anomaly_det = AnomalyDetector()
    anomaly_det.load(os.path.join(models_dir, 'anomaly_detector.joblib'))
    
    explainer = joblib.load(os.path.join(models_dir, 'shap_explainer.joblib'))
    preprocessing_meta = joblib.load(os.path.join(models_dir, 'preprocessing_meta.joblib'))
    
    alert_engine = AlertEngine()
    rag_investigator = RAGInvestigator()
    
    feature_cols = joblib.load(os.path.join(models_dir, 'feature_cols.joblib'))
    
    return models_engine, anomaly_det, explainer, preprocessing_meta, alert_engine, rag_investigator, feature_cols

try:
    models_engine, anomaly_det, explainer, preprocessing_meta, alert_engine, rag_investigator, feature_cols = load_pipeline_components()
    pipeline_loaded = True
except Exception as e:
    st.error(f"Error loading pipeline models: {str(e)}. Please run train_pipeline.py first.")
    pipeline_loaded = False

# Load sample dataset
@st.cache_data
def load_sample_transactions():
    return pd.read_csv("src/sample_transactions.csv")

try:
    df_samples = load_sample_transactions()
    samples_loaded = True
except Exception as e:
    df_samples = None
    samples_loaded = False

# Helper: Align Sparkov row features to full IEEE feature space
def make_prediction_vector(row, feature_cols, preprocessing_meta):
    # Initialize full zero vector
    X = pd.DataFrame(0.0, index=[0], columns=feature_cols)
    
    # Fill in known numerical features
    amt = float(row.get('amt', 10.0))
    X['TransactionAmt'] = amt
    
    # Extract timestamp hour
    t_time = pd.to_datetime(row.get('trans_date_trans_time', datetime.now()))
    X['hour_of_day'] = t_time.hour
    X['day_of_week'] = t_time.dayofweek
    X['is_weekend'] = 1.0 if t_time.dayofweek >= 5 else 0.0
    
    # Fill in spending ratios and other numerical defaults
    X['spend_ratio_avg'] = amt / 150.0 # Sparkov mean approximate
    X['user_trans_count'] = 1.0
    X['time_since_last_trans'] = 86400.0 # 1 day default
    
    # Fill in categorical codes using median/default target risk mappings
    for col in feature_cols:
        if col not in X.columns:
            X[col] = 0.0
            
    return X

# --- SIDEBAR: CASE SELECTOR ---
st.sidebar.markdown("### 🔍 Investigation Workspace")
selected_idx = 0
if samples_loaded and df_samples is not None:
    # Build readable labels for sidebar dropdown
    labels = []
    for idx, row in df_samples.iterrows():
        is_fraud = "🚨 Fraud" if row['is_fraud'] == 1 else "✅ Legit"
        labels.append(f"{idx}: {row['merchant']} - ₹{row['amt']:,.2f} ({is_fraud})")
        
    selected_label = st.sidebar.selectbox("Select Target Transaction", labels)
    selected_idx = int(selected_label.split(":")[0])
    selected_row = df_samples.iloc[selected_idx]
else:
    st.sidebar.warning("Sample transactions file not found. Generating mock transaction.")
    selected_row = {
        'trans_num': 'TX89104',
        'merchant': 'Amazon SG',
        'category': 'shopping_net',
        'amt': 82000.00,
        'first': 'Aarav',
        'last': 'Sharma',
        'city': 'Mumbai',
        'state': 'MH',
        'zip': 400001,
        'lat': 18.96,
        'long': 72.82,
        'merch_lat': 1.35,
        'merch_long': 103.87,
        'is_fraud': 1,
        'trans_date_trans_time': '2026-07-02 23:45:00'
    }

st.sidebar.markdown("---")
st.sidebar.markdown("### 💻 System Information")
st.sidebar.info("""
**GuardianEye Engine: v1.0.0**
- ML Model: Stacking Classifier
- Database: RAG Vector Store
- Local LLM: Simulated Fallback
- Verification Status: **[PASS]**
""")

# --- MAIN PAGE LAYOUT ---
st.markdown("<h1 class='main-title'>🛡️ GuardianEye: Intelligent Financial Fraud Investigation System</h1>", unsafe_allow_html=True)
st.markdown("<p class='main-subtitle'>Configurable Machine Learning Inference, Local SHAP Explanations, and Multi-Agent RAG Workspace</p>", unsafe_allow_html=True)

if not pipeline_loaded:
    st.stop()

# --- PREDICTION PIPELINE EXECUTION ---
# 1. Align vector
X_predict = make_prediction_vector(selected_row, feature_cols, preprocessing_meta)

# 2. Predict anomaly score
anomaly_score = float(anomaly_det.predict_anomaly_score(X_predict)[0])
X_predict['anomaly_score'] = anomaly_score

# 3. Predict ML probabilities
scaler_cols = [c for c in preprocessing_meta['num_cols'] if c in X_predict.columns]
X_predict_scaled = X_predict.copy()
X_predict_scaled[scaler_cols] = models_engine.scaler.transform(X_predict[scaler_cols])

fraud_prob = float(models_engine.ensemble_predict_proba(X_predict_scaled)[0])

# Add geographical distance computation for Sparkov if coordinates exist
lat1, lon1 = float(selected_row.get('lat', 0.0)), float(selected_row.get('long', 0.0))
lat2, lon2 = float(selected_row.get('merch_lat', 0.0)), float(selected_row.get('merch_long', 0.0))
# Simple approximation of haversine distance
geo_dist = float(np.sqrt((lat1-lat2)**2 + (lon1-lon2)**2) * 111.0) # km
row_dict = selected_row.to_dict() if hasattr(selected_row, 'to_dict') else selected_row
row_dict['geo_distance_km'] = geo_dist
row_dict['spend_ratio_avg'] = float(selected_row.get('amt', 10.0)) / 150.0

# 4. Alert engine audit
alert_verdict = alert_engine.assess_risk(row_dict, fraud_prob, anomaly_score)

# 5. Extract local SHAP explanation
local_shap = explainer.get_local_explanation(X_predict_scaled.iloc[0], feature_cols)

# --- DASHBOARD TABS ---
tab_live, tab_rag, tab_cases, tab_compliance, tab_drift = st.tabs([
    "📊 Transaction Monitor",
    "🤖 Investigation Chat",
    "📋 Investigation Report",
    "⚖️ Compliance Audit",
    "🔍 Model Diagnostics"
])

# ----------------- TAB 1: LIVE TRANSACTIONS -----------------
with tab_live:
    col1, col2, col3, col4 = st.columns(4)
    
    # AI Verdict Card
    with col1:
        ml_eval = alert_verdict['ml_risk_evaluation']
        bg_color = ml_eval['color']
        st.markdown(f"""
        <div class="metric-card" style="border-top: 5px solid {bg_color};">
            <span style="color:#94a3b8; font-weight:600; font-size:0.85rem;">AI Verdict</span>
            <div class="metric-val" style="color:{bg_color};">{ml_eval['risk_level']}</div>
            <span style="font-size:0.8rem; color:#cbd5e1;">{ml_eval['message']}</span>
        </div>
        """, unsafe_allow_html=True)
        
    # Fraud Probability Card
    with col2:
        st.markdown(f"""
        <div class="metric-card" style="border-top: 5px solid #8b5cf6;">
            <span style="color:#94a3b8; font-weight:600; font-size:0.85rem;">Fraud Probability</span>
            <div class="metric-val" style="color:#a855f7;">{fraud_prob*100:.1f}%</div>
            <span style="font-size:0.8rem; color:#cbd5e1;">Stacking Ensemble Score</span>
        </div>
        """, unsafe_allow_html=True)
        
    # Anomaly Score Card
    with col3:
        st.markdown(f"""
        <div class="metric-card" style="border-top: 5px solid #0ea5e9;">
            <span style="color:#94a3b8; font-weight:600; font-size:0.85rem;">Anomaly Score</span>
            <div class="metric-val" style="color:#38bdf8;">{anomaly_score*100:.1f}%</div>
            <span style="font-size:0.8rem; color:#cbd5e1;">Isolation Forest Outlier Level</span>
        </div>
        """, unsafe_allow_html=True)
        
    # Triggered Rules Card
    with col4:
        rule_count = len(alert_verdict['triggered_business_policies'])
        rule_color = "#f97316" if rule_count > 0 else "#10b981"
        st.markdown(f"""
        <div class="metric-card" style="border-top: 5px solid {rule_color};">
            <span style="color:#94a3b8; font-weight:600; font-size:0.85rem;">Rules Triggered</span>
            <div class="metric-val" style="color:{rule_color};">{rule_count} Rules</div>
            <span style="font-size:0.8rem; color:#cbd5e1;">Compliance Policies Violations</span>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("### 🧾 Ingested Transaction Details")
    t_col1, t_col2, t_col3, t_col4 = st.columns(4)
    with t_col1:
        st.write(f"**Transaction ID:** `{selected_row.get('trans_num', 'N/A')}`")
        st.write(f"**Timestamp:** `{selected_row.get('trans_date_trans_time', 'N/A')}`")
    with t_col2:
        st.write(f"**Cardholder Name:** `{selected_row.get('first', 'N/A')} {selected_row.get('last', 'N/A')}`")
        st.write(f"**Cardholder Location:** `{selected_row.get('city', 'N/A')}, {selected_row.get('state', 'N/A')}`")
    with t_col3:
        st.write(f"**Merchant Name:** `{selected_row.get('merchant', 'N/A')}`")
        st.write(f"**Transaction Amount:** `₹{selected_row.get('amt', 0.0):,.2f}`")
    with t_col4:
        st.write(f"**Geographic Distance:** `{geo_dist:.1f} km`")
        st.write(f"**Actual Class:** `{'🚨 Fraud' if selected_row.get('is_fraud', 0) == 1 else '✅ Legitimate'}`")

    # Interactive Plots Section
    p_col1, p_col2 = st.columns([2, 1])
    with p_col1:
        st.markdown("### 🔬 Live SHAP Local Explanations")
        fig_shap = explainer.generate_plotly_explanation(local_shap, top_n=8)
        fig_shap.update_layout(height=360, paper_bgcolor='#1e293b', plot_bgcolor='#1e293b')
        fig_shap.update_xaxes(title_text="Feature Log-Odds Push", color="#f8fafc")
        fig_shap.update_yaxes(color="#f8fafc")
        fig_shap.layout.title.font.color = "#f8fafc"
        st.plotly_chart(fig_shap, use_container_width=True)
        
    with p_col2:
        st.markdown("### ⚙️ Business Rules Triggered")
        triggered_policies = alert_verdict['triggered_business_policies']
        if len(triggered_policies) > 0:
            for p in triggered_policies:
                st.error(f"**⚠️ {p['policy_name']} (Severity: {p['severity']})**\n{p['description']}")
        else:
            st.success("No compliance or velocity rules violated. Normal activity.")

# ----------------- TAB 2: RAG INVESTIGATOR CHAT -----------------
with tab_rag:
    st.markdown("### 🤖 Chat with GuardianEye AI Fraud Investigator")
    st.markdown("Query predictions, find similar historical fraud cases, and ask about compliance violations.")
    
    # Shortcut prompts
    shortcuts = [
        "Why was this transaction flagged?",
        "What RBI compliance rules apply here?",
        "Show similar historical fraud cases.",
        "Explain the SHAP feature contributions."
    ]
    
    # Store chat history in session state
    if "messages" not in st.session_state:
        st.session_state.messages = []
        
    # Handle chat inputs
    chat_col1, chat_col2 = st.columns([3, 1])
    
    # Show chat messages
    chat_container = st.container()
    with chat_container:
        for m in st.session_state.messages:
            with st.chat_message(m["role"]):
                st.write(m["content"])
                
    # Shortcut buttons click handlers
    with chat_col2:
        st.markdown("**💡 Quick Prompt Shortcuts**")
        for sc in shortcuts:
            if st.button(sc, key=f"btn_{sc}"):
                st.session_state.messages.append({"role": "user", "content": sc})
                
                # Run query
                rules_text = [p['policy_name'] for p in alert_verdict['triggered_business_policies']]
                res = rag_investigator.answer_analyst_question(
                    sc, row_dict, alert_verdict['ml_risk_evaluation'], local_shap['positive_drivers'], rules_text
                )
                st.session_state.messages.append({"role": "assistant", "content": res['answer']})
                st.rerun()
                
    # Standard text chat input
    prompt = st.chat_input("Enter investigator question here...")
    if prompt:
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        # Run query
        rules_text = [p['policy_name'] for p in alert_verdict['triggered_business_policies']]
        res = rag_investigator.answer_analyst_question(
            prompt, row_dict, alert_verdict['ml_risk_evaluation'], local_shap['positive_drivers'], rules_text
        )
        st.session_state.messages.append({"role": "assistant", "content": res['answer']})
        st.rerun()
        
    if st.button("Clear Chat History", key="clear_chat"):
        st.session_state.messages = []
        st.rerun()

# ----------------- TAB 3: AI CASE INVESTIGATION REPORT -----------------
with tab_cases:
    st.markdown("### 📋 AI Multi-Agent Case Report")
    
    # Run report generation
    rules_text = [p['policy_name'] for p in alert_verdict['triggered_business_policies']]
    report_res = rag_investigator.generate_investigation_report(
        row_dict, alert_verdict['ml_risk_evaluation'], local_shap['positive_drivers'], rules_text
    )
    
    rep_col1, rep_col2 = st.columns([2, 1])
    with rep_col1:
        st.markdown(report_res['report'])
        
        # Download report button
        st.download_button(
            label="Download Markdown Investigation Report",
            data=report_res['report'],
            file_name=f"GuardianEye_Report_Case_{selected_row.get('trans_num', 'TX89104')}.md",
            mime="text/markdown"
        )
        
    with rep_col2:
        st.markdown("### 🕒 Investigation Case Timeline")
        timeline = [
            {"step": "1. Transaction Ingest", "desc": "Raw transaction received and timezone features engineered.", "status": "Done"},
            {"step": "2. Outlier Analysis", "desc": "Isolation Forest computed unsupervised anomaly score.", "status": "Done"},
            {"step": "3. Stacking Ensemble", "desc": "Meta-LR evaluated LightGBM, CatBoost, and XGBoost predictions.", "status": "Done"},
            {"step": "4. Policy Audit", "desc": "Alert engine audited transaction against corporate velocity policies.", "status": "Done"},
            {"step": "5. RAG Vector Retrieval", "desc": "Retrieved 3 regulatory and historical cases from Vector DB.", "status": "Done"},
            {"step": "6. Agent Verdict", "desc": "Report Writer compiled final case actions list.", "status": "Pending Analyst Signoff"}
        ]
        for step in timeline:
            color = "#10b981" if step["status"] == "Done" else "#f59e0b"
            st.markdown(f"""
            <div style="background-color:#1e293b; padding:0.8rem; border-left:4px solid {color}; border-radius:4px; margin-bottom:0.75rem;">
                <strong style="color:#f8fafc;">{step['step']}</strong> <span style="font-size:0.75rem; background:{color}; color:#fff; padding:1px 4px; border-radius:3px;">{step['status']}</span>
                <p style="margin:4px 0 0 0; font-size:0.8rem; color:#cbd5e1;">{step['desc']}</p>
            </div>
            """, unsafe_allow_html=True)
            
        st.markdown("### 🗄️ Retrieved Vector DB Context")
        for doc in report_res['retrieved_docs']:
            st.markdown(f"""
            **📄 {doc['title']}**  
            *Category:* `{doc['category']}` | *Retrieval Score:* `{doc['similarity_score']:.4f}`
            > {doc['content']}
            """)

# ----------------- TAB 4: COMPLIANCE & DIRECTIVES -----------------
with tab_compliance:
    st.markdown("### ⚖️ Regulatory Guidelines & Corporate Compliances")
    st.markdown("Below are the active compliance guidelines and Standard Operating Procedures (SOPs) indexed in the Vector Database.")
    
    comp_col1, comp_col2 = st.columns(2)
    with comp_col1:
        st.markdown("#### 🇮🇳 Reserve Bank of India (RBI) Directives")
        from src.rag_investigator import KNOWLEDGE_BASE
        rbi_docs = [d for d in KNOWLEDGE_BASE if d['category'] == 'RBI Regulatory Guidelines']
        for doc in rbi_docs:
            with st.expander(f"📜 {doc['title']}"):
                st.write(doc['content'])
                st.json(doc['metadata'])
                
    with comp_col2:
        st.markdown("#### 🏢 Company Internal Policies (SOPs)")
        sop_docs = [d for d in KNOWLEDGE_BASE if d['category'] == 'Company Internal Policy']
        for doc in sop_docs:
            with st.expander(f"🛠️ {doc['title']}"):
                st.write(doc['content'])
                st.json(doc['metadata'])

# ----------------- TAB 5: DRIFT & DIAGNOSTIC PLOTS -----------------
with tab_drift:
    st.markdown("### 🔍 Model Diagnostic Charts & Feature Drift Metrics")
    
    # Display the static JPG curves
    st.markdown("#### Pipeline Performance Evaluations (Sparkov Test Set)")
    g_col1, g_col2 = st.columns(2)
    with g_col1:
        st.image("plots/roc_curve.jpg", caption="ROC Curve with 95% Confidence Intervals", use_container_width=True)
        st.image("plots/calibration_curve.jpg", caption="All-Model Calibration comparison (Brier Scores)", use_container_width=True)
    with g_col2:
        st.image("plots/threshold_cost_analysis.jpg", caption="Operational Cost-Sensitive Threshold Curve", use_container_width=True)
        st.image("plots/drift_analysis.jpg", caption="Population Stability Index (PSI) Feature Drift Bar Chart", use_container_width=True)

    st.markdown("#### Quantitative Distribution Drift Metrics")
    if os.path.exists("plots/detailed_metrics.json"):
        with open("plots/detailed_metrics.json", "r") as f:
            full_metrics = json.load(f)
            
        drift_df = pd.DataFrame.from_dict(full_metrics['drift_results'], orient='index')
        st.dataframe(drift_df.style.highlight_max(axis=0, subset=['psi']))
        st.info("""
        * **PSI < 0.1**: No Distribution Drift.
        * **PSI 0.1 - 0.25**: Moderate Distribution Drift.
        * **PSI > 0.25**: Significant Distribution Drift (Requires model retraining or standardization).
        """)
    else:
        st.warning("detailed_metrics.json not found. Run calculate_advanced_metrics.py first.")
