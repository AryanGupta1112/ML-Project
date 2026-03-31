# Smart Cardiovascular Risk Analysis System

Production-grade full-stack ML platform for cardiovascular risk prediction, explainable factors, model benchmarking, what-if simulation, and longitudinal history analytics.

## Tech Stack

### Frontend
- Vite + React + TypeScript
- React Router
- Tailwind CSS
- shadcn/ui (Radix-based)
- Lucide React icons
- Recharts
- Framer Motion
- React Hook Form + Zod
- TanStack Query

### Backend
- FastAPI + Pydantic
- scikit-learn
- pandas + numpy
- SHAP
- joblib
- SQLAlchemy + SQLite
- uvicorn

## Folder Structure

```text
project-root/
  backend/
    app/
      api/
      core/
      models/
      schemas/
      services/
      ml/
      utils/
      main.py
    data/
    notebooks/
    saved_models/
    requirements.txt
    README.md
    Dockerfile

  frontend/
    app/
    components/
    components/ui/
    lib/
    hooks/
    services/
    types/
    public/
    styles/
    README.md
    package.json
    Dockerfile

  docs/
  docker-compose.yml
  README.md
```

## System Capabilities
- Real patient-input risk prediction endpoint.
- Multi-model training and performance comparison (5 ML algorithms).
- Risk probability + normalized risk score + categorical risk level.
- Explainability factors (SHAP/impact-based).
- Rule-based lifestyle recommendations.
- What-if simulation with delta analysis.
- Prediction history persistence and trend charts.

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
```

### Train Models
```bash
cd backend
set PYTHONPATH=.
python -m app.ml.train
```

Default training profile is larger now:
- `DATASET_PROFILE=large` -> OpenML `BNG(heart-statlog)` source
- `TRAINING_MAX_ROWS=15000` -> practical cap for training runtime

You can edit these in `backend/.env`.

### Run API
```bash
cd backend
set PYTHONPATH=.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API base: `http://localhost:8000/api`

## Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

Run app:
```bash
cd frontend
npm run dev
```

Production preview:
```bash
cd frontend
npm run build
npm run start
```

Frontend URL: `http://localhost:3000`

## Docker (Backend Services Only)

Train models locally first:
```bash
cd backend
set PYTHONPATH=.
python -m app.ml.train
```

Run backend API in Docker:
```bash
docker compose up --build backend
```

Note:
- Docker backend does not train models automatically.
- It reads pre-trained artifacts from `backend/saved_models`.
- This keeps model training separate from Docker execution.

Optional: run frontend in Docker too:
```bash
docker compose --profile frontend up --build frontend
```

## API Endpoints
- `GET /api/health`
- `POST /api/predict`
- `GET /api/models/performance`
- `POST /api/what-if`
- `GET /api/features/info`
- `GET /api/history?limit=100`

## Sample Predict Request

```json
{
  "age": 58,
  "sex": 1,
  "cp": 0,
  "trestbps": 145,
  "chol": 250,
  "fbs": 0,
  "restecg": 1,
  "thalach": 130,
  "exang": 1,
  "oldpeak": 2.3,
  "slope": 1,
  "ca": 1,
  "thal": 2
}
```

## API Response Format

```json
{
  "prediction": 1,
  "probability": 0.82,
  "risk_score": 82,
  "risk_level": "High Risk",
  "model_name": "random_forest",
  "top_factors": [
    {
      "feature": "oldpeak",
      "feature_value": 2.3,
      "impact_score": 0.1431,
      "direction": "increases"
    }
  ],
  "recommendations": [
    "Your resting blood pressure is high. Cut down salt, stay active, and check blood pressure every week."
  ]
}
```

## Architecture Notes
See [docs/architecture.md](docs/architecture.md) for component-level flow, model lifecycle, and explainability strategy.
