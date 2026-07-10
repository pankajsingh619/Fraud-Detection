# GuardianEye: Explainable AI & Lexical Retrieval-Augmented Investigation Workspace

GuardianEye is an end-to-end financial intelligence platform combining base gradient boosted tree classifiers, ensembled stacking models, local explainability frameworks (SHAP, LIME, counterfactuals), compliance auditing, and multi-agent lexical retrieval-augmented reasoning.

---

## 1. System & Deployment Architecture

GuardianEye decouples transactional API ingestion from the frontend auditor workspace.

```
       Browser Traffic (SSL - Port 443)
                  │
                  ▼
          ┌───────────────┐
          │ Nginx Reverse │ (SSL Termination, CORS headers, rate limiting)
          │     Proxy     │
          └───────┬───────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ Next.js Node  │   │ FastAPI App   │ (Model Inferences, API Sandbox)
│ (Port 3000)   │   │ (Port 8000)   │
└───────────────┘   └───────┬───────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
     ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
     │ PostgreSQL  │ │ Redis Cache │ │ Qdrant DB   │
     │ (Audit/Cases)│ │ (SHAP/Limit)│ │ (Catalog)   │
     └─────────────┘ └─────────────┘ └─────────────┘
```

- **Reverse Proxy**: NGINX handles traffic rate limiting, CORS headers, and SSL termination.
- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 provides the Auditor dashboard.
- **Backend API**: FastAPI hosts REST endpoints, executing ML pipeline scoring and database sessions.
- **Cache Layer**: Redis buffers calculated SHAP explainability arrays and rate limiter keys.
- **Database**: PostgreSQL persists user profiles, RBAC configurations, cases, and SAR reports.
- **Vector DB / Catalog**: Houses compliance manuals (RBI guidelines, NPCI rules) to feed the lexical retrieval chain.

---

## 2. API Contract Specification (v1)

All endpoints require asymmetric RS256 JWT authorization tokens.

### Ingestion & Inference Contracts

#### `POST /api/v1/predict`
- **Goal**: Evaluate transaction attributes and return ensembled risk probabilities.
- **Request Body**:
```json
{
  "amount": 82000.00,
  "country": "Singapore",
  "merchant": "Amazon SG",
  "device_fingerprint": "MacOS_Safari_19.2",
  "ip_address": "194.22.10.45"
}
```
- **Response (200 OK)**:
```json
{
  "transaction_id": "tx_8390b1c93a",
  "verdict": "HOLD",
  "fraud_probability": 0.968,
  "confidence_interval": [0.8340, 0.8458],
  "anomaly_score": 0.785,
  "timestamp": "2026-07-04T11:45:00Z"
}
```

#### `POST /api/v1/investigate`
- **Goal**: Extract explainability vectors (SHAP attributions, LIME coefficients, counterfactual directions) for a transaction.
- **Response (200 OK)**:
```json
{
  "transaction_id": "tx_8390b1c93a",
  "explainability": {
    "shap_attributions": { "amount": 0.38, "country_shift": 0.28 },
    "lime_coefficients": { "amount_slope": 0.42, "location_slope": 0.31 },
    "counterfactuals": [
      "Reduce amount below ₹50,000 to flip verdict to APPROVE"
    ]
  }
}
```

#### `POST /api/v1/chat`
- **Goal**: Chat with the RAG Investigator agent using internal policy document retrieval.
- **Request Body**:
```json
{
  "case_id": "case_1432",
  "query": "Is this transaction compliant with RBI Sec 7.2 digital step-up rules?"
}
```
- **Response (200 OK)**:
```json
{
  "response": "Under RBI Section 7.2 guidelines, high-value digital transfers exceeding ₹50,000 processed from unverified location routes require step-up multi-factor check steps.",
  "citations": [
    { "doc_title": "RBI digital security circular v2", "section": "7.2.1" }
  ]
}
```

---

## 3. Database Persistence Schemas

GuardianEye employs a relational schema in PostgreSQL to manage cases and auditor signatures.

```sql
-- Role Based Enums
CREATE TYPE user_role AS ENUM ('Administrator', 'Fraud Analyst', 'Compliance Officer', 'Auditor', 'Viewer');
CREATE TYPE case_status AS ENUM ('Open', 'In Review', 'Escalated', 'Closed', 'Archived');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cases Table
CREATE TABLE cases (
    case_id VARCHAR(50) PRIMARY KEY,
    transaction_amt NUMERIC(15, 2) NOT NULL,
    merchant VARCHAR(255) NOT NULL,
    country VARCHAR(3) NOT NULL,
    risk risk_level NOT NULL,
    anomaly_score INTEGER NOT NULL,
    status case_status NOT NULL DEFAULT 'Open',
    assigned_to UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Report Version Tree Table (Version Control)
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR(50) REFERENCES cases(case_id) ON DELETE CASCADE,
    version_num INTEGER NOT NULL,
    markdown_content TEXT NOT NULL,
    analyst_notes TEXT,
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(case_id, version_num)
);

-- Immutable Security Audit Trail Table
CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES users(user_id),
    action VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    payload_snapshot JSONB
);
```

---

## 4. Role-Based Access Control (RBAC) Settings

We configure active access scopes across five user categories:

| Target Action | Viewer | Fraud Analyst | Auditor | Compliance Officer | Administrator |
| :--- | :---: | :---: | :---: | :---: | :---: |
| View Cases | Read | Read | Read | Read | Read |
| Status Transition | ✗ | Write | Write | Write | Write |
| Generate SAR Files | ✗ | Write | Write | Write | Write |
| Edit Config / Key Gen | ✗ | ✗ | ✗ | ✗ | Admin |

---

## 5. Development & Running Directives

### 1. Prerequisites (Python dependencies)
Install standard pipeline libraries:
```bash
pip install -r requirements.txt
```

### 2. Run Pipeline Training (IEEE-CIS data)
Trains GBDT base classifiers, fits Isolation Forest models, and serializes the meta Stacking ensemble classifier:
```bash
python run_pipeline.py
```

### 3. Generate Diagnostic Plots & JSON Stats
Bootstraps temporal splits, calculates confidence intervals, McNemar statistics, and population stability indices:
```bash
python calculate_advanced_metrics.py
```

### 4. Running the Frontend Dashboard
Navigate to `landing-page/` and run the development compiler:
```bash
cd landing-page
npm install
npm run dev
```

---

## 6. Testing Strategy

GuardianEye validates builds using a structured test harness run on CI pipelines:

1.  **Unit Tests (`pytest`)**: Verifies feature engineering aggregations and haversine geospatial calculations. Located in `tests/test_feature_engineering.py`.
2.  **API Routing Tests**: Validates input JSON schemas and JWT authentication filters. Located in `tests/test_api_endpoints.py`.
3.  **Integration Harness**: Audits database rollbacks, cached SHAP evaluations, and vector database similarity score matching.
4.  **Performance Benchmarking (`Locust`)**: Load tests endpoints to verify response latency remains under 50ms at 1,000 concurrent requests/sec.
