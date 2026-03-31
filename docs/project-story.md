# Smart Mushroom Toxicity Analysis System: Project Story

This project was reworked into a high-accuracy, large-dataset machine-learning system focused on mushroom toxicity prediction.

## Why We Rebranded
The previous domain did not give confidence in day-to-day prediction behavior.  
So we shifted to a dataset where:
- data size is strong (`8,124` rows),
- feature quality is consistent,
- model separability is high.

## What The System Predicts
Given 22 mushroom traits (cap shape, odor, gill size, ring type, habitat, etc.), the system predicts:
- toxicity probability (`0.00 - 1.00`)
- score (`0 - 100`)
- level (`Low Risk`, `Medium Risk`, `High Risk`)

## Training Pipeline
1. Download OpenML Mushroom dataset.
2. Normalize feature names.
3. One-hot encode all categorical features.
4. Train and test 5 models:
   - Logistic Regression
   - Decision Tree
   - Random Forest
   - KNN
   - SVM
5. Save models + metrics + feature metadata.

## Inference Flow
Frontend form -> FastAPI `/predict` -> selected model -> probability + explainability + recommendations -> dashboard cards/charts.

## Explainability
The app shows top factors for each prediction:
- SHAP for tree-based models.
- Coefficient/importance fallback for others.
- Value-rate fallback for non-linear models with no direct coefficients.

## Recommendations
The system adds practical safety guidance (for example odor-based danger patterns, spore-print warnings, and uncertainty advice).

## Outcome
The rebranded project is now:
- dataset-rich (5,000+ satisfied),
- technically consistent end-to-end,
- built around strong ML performance and transparent results.
