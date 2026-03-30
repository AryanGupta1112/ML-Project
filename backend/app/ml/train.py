from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.datasets import fetch_openml
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

from app.core.config import settings

EXPECTED_FEATURES = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
]

NUMERIC_FEATURES = ["age", "trestbps", "chol", "thalach", "oldpeak"]
CATEGORICAL_FEATURES = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]

FEATURE_DESCRIPTIONS = {
    "age": "Age in years",
    "sex": "Sex (0 = female, 1 = male)",
    "cp": "Chest pain type (0-3)",
    "trestbps": "Resting blood pressure in mm Hg",
    "chol": "Serum cholesterol in mg/dl",
    "fbs": "Fasting blood sugar > 120 mg/dl (1 = true)",
    "restecg": "Resting electrocardiographic result (0-2)",
    "thalach": "Maximum heart rate achieved",
    "exang": "Exercise induced angina (1 = yes)",
    "oldpeak": "ST depression induced by exercise",
    "slope": "Slope of peak exercise ST segment (0-2)",
    "ca": "Major vessels colored by fluoroscopy (0-4)",
    "thal": "Thalassemia category (0-3)",
}


@dataclass
class DatasetBundle:
    x: pd.DataFrame
    y: pd.Series


def _normalize_col(col: str) -> str:
    return "".join(ch for ch in col.lower() if ch.isalnum())


def _safe_numeric(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce")


def _binarize_target(target: pd.Series) -> pd.Series:
    numeric = pd.to_numeric(target, errors="coerce")
    if numeric.notna().sum() >= int(0.8 * len(target)):
        return (numeric.fillna(0) > 0).astype(int)

    lowered = target.astype(str).str.lower().str.strip()
    positive_markers = {"1", "yes", "true", "present", "positive", "disease"}
    return lowered.isin(positive_markers).astype(int)


def _find_target_column(frame: pd.DataFrame) -> str:
    candidates = ["target", "class", "num", "output", "cardio"]
    normalized = {_normalize_col(c): c for c in frame.columns}
    for candidate in candidates:
        if candidate in frame.columns:
            return candidate
        key = _normalize_col(candidate)
        if key in normalized:
            return normalized[key]
    raise ValueError("Unable to identify target column from downloaded dataset")


def load_heart_dataset() -> DatasetBundle:
    fetch_attempts = [
        {"name": "heart-disease", "version": 1},
        {"name": "heart-statlog", "version": 1},
        {"name": "HeartDisease", "version": 1},
    ]

    last_error: Exception | None = None
    bundle = None
    for kwargs in fetch_attempts:
        try:
            bundle = fetch_openml(as_frame=True, parser="auto", **kwargs)
            break
        except Exception as exc:
            last_error = exc

    if bundle is None:
        raise RuntimeError(f"Failed to download dataset from OpenML: {last_error}")

    frame = bundle.frame.copy()
    if frame is None or frame.empty:
        frame = bundle.data.copy()
        target = bundle.target.copy()
        frame["target"] = target

    target_col = _find_target_column(frame)
    y = _binarize_target(frame[target_col])

    rename_map_alias = {
        "age": "age",
        "sex": "sex",
        "gender": "sex",
        "cp": "cp",
        "chestpaintype": "cp",
        "trestbps": "trestbps",
        "restingbp": "trestbps",
        "restingbloodpressure": "trestbps",
        "chol": "chol",
        "cholesterol": "chol",
        "fbs": "fbs",
        "fastingbs": "fbs",
        "restecg": "restecg",
        "thalach": "thalach",
        "maxhr": "thalach",
        "exang": "exang",
        "exerciseangina": "exang",
        "oldpeak": "oldpeak",
        "stdepression": "oldpeak",
        "slope": "slope",
        "stslope": "slope",
        "ca": "ca",
        "majorvessels": "ca",
        "thal": "thal",
    }

    renamed = {}
    for col in frame.columns:
        norm = _normalize_col(col)
        if norm in rename_map_alias:
            renamed[col] = rename_map_alias[norm]

    x = frame.rename(columns=renamed)

    missing = [feature for feature in EXPECTED_FEATURES if feature not in x.columns]
    if missing:
        raise RuntimeError(
            "Dataset does not contain required cardiovascular features: " + ", ".join(missing)
        )

    x = x[EXPECTED_FEATURES].copy()
    for feature in EXPECTED_FEATURES:
        x[feature] = _safe_numeric(x[feature])

    valid_rows = y.notna()
    x = x[valid_rows]
    y = y[valid_rows]

    return DatasetBundle(x=x, y=y)


def _build_preprocessor(scale_numeric: bool) -> ColumnTransformer:
    numeric_steps: list[tuple[str, Any]] = [("imputer", SimpleImputer(strategy="median"))]
    if scale_numeric:
        numeric_steps.append(("scaler", StandardScaler()))

    numeric_transformer = Pipeline(steps=numeric_steps)
    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERIC_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ]
    )


def _compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> dict[str, float]:
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1_score": float(f1_score(y_true, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
    }


def train_and_save_models(output_dir: Path | None = None) -> dict[str, Any]:
    output_path = output_dir or settings.model_artifacts_dir
    output_path.mkdir(parents=True, exist_ok=True)

    dataset = load_heart_dataset()
    x_train, x_test, y_train, y_test = train_test_split(
        dataset.x,
        dataset.y,
        test_size=0.2,
        random_state=42,
        stratify=dataset.y,
    )

    model_configs: dict[str, tuple[Any, bool]] = {
        "logistic_regression": (LogisticRegression(max_iter=1500, random_state=42), True),
        "decision_tree": (DecisionTreeClassifier(max_depth=6, random_state=42), False),
        "random_forest": (
            RandomForestClassifier(n_estimators=350, min_samples_split=4, random_state=42),
            False,
        ),
        "knn": (KNeighborsClassifier(n_neighbors=11), True),
        "svm": (SVC(kernel="rbf", probability=True, random_state=42), True),
    }

    metrics_by_model: dict[str, dict[str, float]] = {}

    for model_name, (estimator, scale_numeric) in model_configs.items():
        preprocessor = _build_preprocessor(scale_numeric=scale_numeric)
        pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", estimator)])
        pipeline.fit(x_train, y_train)

        y_pred = pipeline.predict(x_test)
        y_prob = pipeline.predict_proba(x_test)[:, 1]

        metrics = _compute_metrics(y_test.to_numpy(), y_pred, y_prob)
        metrics_by_model[model_name] = metrics

        model_file = output_path / f"{model_name}.joblib"
        joblib.dump(pipeline, model_file)

    best_model = max(metrics_by_model, key=lambda name: metrics_by_model[name]["roc_auc"])

    feature_stats = {}
    for feature in EXPECTED_FEATURES:
        non_null = dataset.x[feature].dropna()
        feature_stats[feature] = {
            "min": float(non_null.min()),
            "max": float(non_null.max()),
            "mean": float(non_null.mean()),
            "type": "numeric" if feature in NUMERIC_FEATURES else "categorical",
            "description": FEATURE_DESCRIPTIONS[feature],
        }

    metadata = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset_rows": int(dataset.x.shape[0]),
        "feature_columns": EXPECTED_FEATURES,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "best_model": best_model,
        "metrics": metrics_by_model,
        "feature_stats": feature_stats,
    }

    with (output_path / "metadata.json").open("w", encoding="utf-8") as fp:
        json.dump(metadata, fp, indent=2)

    return metadata


if __name__ == "__main__":
    result = train_and_save_models()
    print(json.dumps(result, indent=2))
