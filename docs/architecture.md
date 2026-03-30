# System Architecture

## High-Level Components
- **Frontend (Vite + React Router)**: UI workflows for prediction, model comparison, what-if simulation, history, and platform details.
- **Backend (FastAPI)**: API layer, model inference, explainability, recommendation engine, and persistence.
- **ML Pipeline (scikit-learn + SHAP)**: Dataset ingestion, preprocessing, model training, evaluation, artifact management.
- **Persistence (SQLite)**: Prediction history and audit trail for dashboard trend views.

## Data Flow
1. User submits patient features on the dashboard.
2. Frontend validates with Zod + React Hook Form.
3. Request is sent to FastAPI `/api/predict`.
4. Backend runs selected model inference and explainability.
5. Backend returns probability, risk score, risk level, top factors, recommendations.
6. Response is rendered in charts/tables and saved into SQLite history.

## Model Lifecycle
1. `app/ml/train.py` downloads real cardiovascular data from OpenML.
2. Trains 5 classifiers: Logistic Regression, Decision Tree, Random Forest, KNN, SVM.
3. Evaluates on holdout test data.
4. Stores `.joblib` models and `metadata.json`.
5. API loads artifacts on startup.
6. Local runs can auto-train if artifacts are missing; Docker runs are configured to require pre-trained artifacts.

## Explainability Strategy
- Tree models use SHAP values from transformed feature space.
- Contributions are aggregated back to original clinical features.
- Non-tree models use coefficient/importance-based impact fallback.

## Risk Logic
- `risk_score = round(probability * 100)`
- Risk buckets:
  - 0-39: Low Risk
  - 40-69: Medium Risk
  - 70-100: High Risk
