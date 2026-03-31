# Smart Cardiovascular Risk Analysis System: Full Project Story (A to Z)

## 1) The Story in Simple Words
This project was built to answer one practical question: if we enter a person's health details, can we estimate their heart-risk level in a clear and useful way. We designed it as a full product, not just a notebook experiment. A user opens the web app, fills a health form, and gets a real model result: chance of risk, risk score from 0 to 100, risk level (Low/Medium/High), top reasons behind the result, and practical health suggestions. Behind the screen, the frontend sends real data to a FastAPI backend, the backend loads trained machine learning artifacts, runs prediction and explanation, saves history in SQLite, and returns structured JSON that powers charts and tables in the UI. We also added model comparison and what-if simulation so users can see how risk changes if inputs change.

## 2) What Is the Goal of This Project
The goal is to turn cardiovascular risk prediction into a working decision-support system that is:
- real (no fake outputs, no mock model),
- explainable (shows why the result happened),
- testable (tracks model quality numbers),
- usable (clean interface in plain language),
- and deployable (backend can run in Docker, training can run separately).

In short: this project helps convert clinical-style feature data into understandable risk insights.

## 3) What Our Model Is (Technical + Simple)
Our core ML task is **supervised binary classification**.  
Binary classification means the model predicts one of two outcomes:
- `1` = higher cardiovascular risk
- `0` = lower/no significant risk

### Dataset
- Default source profile: OpenML `BNG(heart-statlog)` (very large source dataset)
- Source rows (profile=large): 1,000,000
- Training rows used by default: 15,000 (configurable cap for practical runtime)
- Input features: 13
- Numeric features: `age`, `trestbps`, `chol`, `thalach`, `oldpeak`
- Categorical features: `sex`, `cp`, `fbs`, `restecg`, `exang`, `slope`, `ca`, `thal`

### Models Trained
We train 5 real scikit-learn models:
1. Logistic Regression (`max_iter=1500`, `random_state=42`)
2. Decision Tree (`max_depth=6`, `random_state=42`)
3. Random Forest (`n_estimators=350`, `min_samples_split=4`, `random_state=42`)
4. KNN (`n_neighbors=11`)
5. SVM (`kernel="rbf"`, `probability=True`, `random_state=42`)

### Preprocessing Pipeline
- Numeric fields: median imputation (fill missing values), optional standard scaling
- Categorical fields: most-frequent imputation + one-hot encoding
- Split: 80% train / 20% test with stratification (keeps class balance)

### Evaluation Metrics
For every model we compute:
- Accuracy
- Precision
- Recall
- F1 score
- ROC-AUC (used to choose the best model)

Current best model in artifacts: **Logistic Regression** (best ROC-AUC in metadata).

## 4) How the Model Works at Runtime
When a user submits patient data:
1. Frontend validates inputs with Zod + React Hook Form.
2. Request goes to `POST /api/predict`.
3. Backend loads best model pipeline from `saved_models`.
4. Model returns probability (0 to 1).
5. Backend converts probability to risk score:
   - `risk_score = round(probability * 100)`
6. Backend maps score to risk level:
   - 0-39: Low Risk
   - 40-69: Medium Risk
   - 70-100: High Risk
7. Backend generates explainability factors (SHAP for tree models when possible, coefficient/importance fallback otherwise).
8. Backend generates rule-based lifestyle recommendations.
9. Result is saved to SQLite history and returned to frontend.

## 5) Full Model Code Walkthrough (Simple, File by File)

## `backend/app/ml/train.py`
This is the training engine.

- **Constants**
  - Defines required feature names and which are numeric vs categorical.
  - Includes plain-language descriptions for each feature.

- **Helper functions**
  - `_normalize_col`: removes symbols and lowers text to match messy column names.
  - `_safe_numeric`: safely converts values to numbers.
  - `_binarize_target`: converts target to 0/1.
  - `_find_target_column`: finds target even if dataset uses different column naming.

- **`load_heart_dataset()`**
  - Tries multiple OpenML names for robustness.
  - Renames aliases (for example `restingbp` -> `trestbps`).
  - Verifies all 13 required features exist.
  - Returns clean `X` and `y`.

- **`_build_preprocessor(scale_numeric)`**
  - Builds a `ColumnTransformer`:
    - numeric pipeline
    - categorical pipeline

- **`_compute_metrics(...)`**
  - Returns accuracy, precision, recall, F1, ROC-AUC in one dictionary.

- **`train_and_save_models(...)`**
  - Splits data train/test.
  - Trains all 5 model pipelines.
  - Stores each pipeline as `.joblib`.
  - Selects best model by ROC-AUC.
  - Builds `metadata.json` with:
    - generated timestamp,
    - feature lists,
    - metrics,
    - feature min/max/mean/type/description.

## `backend/app/services/model_service.py`
This file is the serving engine for prediction.

- **`ensure_ready()`**
  - Loads `metadata.json` and all model files.
  - If auto-train is enabled and files are missing, it can train.
  - If auto-train is disabled (Docker mode), it fails with a clear message (train separately first).

- **`available_model_metrics()`**
  - Returns model score list for API response.

- **Explainability methods**
  - `_explain_with_shap`: tree explanation path.
  - `_explain_with_coefficients`: linear/importances path.
  - Fallback: distance-from-mean heuristic if needed.
  - Output: top 5 factors with direction (`increases` / `decreases`) and impact score.

- **`predict(...)`**
  - Runs probability prediction.
  - Converts to class, risk score, risk level.
  - Adds top factors and recommendations.
  - Returns `PredictionResponse`.

## `backend/app/utils/risk.py`
Small pure logic file:
- `probability_to_risk_score(probability)` -> 0 to 100
- `risk_level_from_score(score)` -> Low / Medium / High

## `backend/app/services/recommendation_service.py`
Rule-based recommendations based on input values (blood pressure, cholesterol, blood sugar, exercise chest pain, etc.).  
The text is intentionally written in user-friendly language.

## `backend/app/api/routes.py`
Public API surface:
- `GET /api/health`
- `POST /api/predict`
- `GET /api/models/performance`
- `GET /api/models/training-summary`
- `POST /api/what-if`
- `GET /api/features/info`
- `GET /api/history`

## 6) Frontend and Product Work Done So Far
We built a complete frontend with Vite + React + TypeScript and a clean dashboard structure:
- Home (system overview and training summary)
- Check Risk (prediction form + explanation + recommendations)
- How Accurate (model comparison charts/tables)
- Try Changes (what-if simulation)
- Past Results (history + trend chart)
- How It Works (training and feature reference)

What we improved recently:
- copy rewritten to be readable for non-developers,
- feature codes mapped to friendly labels,
- light/dark theme only,
- layout simplified to professional, clean, non-flashy style,
- routing fixed and stable in Vite setup.

## 7) Docker and Model Separation (Important)
Originally, backend could auto-train on startup.  
Now we separated model training from Docker runtime:

- Docker backend runs with `AUTO_TRAIN_MODELS=false`.
- So Docker expects pre-trained files in `backend/saved_models`.
- Training is run separately (local command):

```bat
cd backend
.venv\Scripts\activate
set PYTHONPATH=.
python -m app.ml.train
```

Then backend container can start normally:

```bat
docker compose up --build backend
```

This separation is cleaner for production-style workflows because training and serving are independent.

## 8) End-to-End Data Flow
`Frontend Form -> FastAPI Endpoint -> Model Pipeline -> Explanation + Recommendations -> JSON Response -> Charts/Tables + History Save`

No placeholders. No fake model response. Real pipeline, real API, real saved artifacts.

## 9) Final Note
This system is a strong ML engineering + full-stack product project.  
It is built for technical correctness and practical usability.  
It provides useful risk insights, but it is still a support tool and not a replacement for professional medical diagnosis.
