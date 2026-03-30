# Backend: Smart Cardiovascular Risk Analysis System

## Stack
- FastAPI
- scikit-learn
- SHAP
- SQLAlchemy + SQLite

## What it does
- Trains 5 ML models on a real cardiovascular dataset from OpenML.
- Selects best model by ROC-AUC.
- Serves prediction, model-performance, explainability, what-if analysis, feature metadata, and history APIs.
- Stores prediction history in SQLite.

## Setup
```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
```

## Train Models (Local)
```bash
cd backend
set PYTHONPATH=.
python -m app.ml.train
```

Artifacts are written to `backend/saved_models`:
- `logistic_regression.joblib`
- `decision_tree.joblib`
- `random_forest.joblib`
- `knn.joblib`
- `svm.joblib`
- `metadata.json`

## Run API (Local)
```bash
cd backend
set PYTHONPATH=.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Run API (Docker)
```bash
cd ..
docker compose up --build backend
```

Important:
- Docker backend now expects model artifacts to already exist in `backend/saved_models`.
- Train models locally first with `python -m app.ml.train`.
- In Docker mode, automatic training is disabled (`AUTO_TRAIN_MODELS=false`) so model training stays separate from containers.

## API Endpoints
- `GET /api/health`
- `POST /api/predict`
- `GET /api/models/performance`
- `POST /api/what-if`
- `GET /api/features/info`
- `GET /api/history?limit=100`

## Notes
- By default (local runs), backend can auto-train if artifacts are missing.
- In Docker mode, auto-training is disabled to keep training separate from container startup.
- SQLite DB path: `backend/data/prediction_history.db`.
