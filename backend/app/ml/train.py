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
from app.ml.feature_catalog import CATEGORICAL_FEATURES, EXPECTED_FEATURES, FEATURE_DEFINITIONS, NUMERIC_FEATURES

RAW_TO_CANONICAL = {
    "cap-shape": "cap_shape",
    "cap-surface": "cap_surface",
    "cap-color": "cap_color",
    "bruises%3F": "bruises",
    "odor": "odor",
    "gill-attachment": "gill_attachment",
    "gill-spacing": "gill_spacing",
    "gill-size": "gill_size",
    "gill-color": "gill_color",
    "stalk-shape": "stalk_shape",
    "stalk-root": "stalk_root",
    "stalk-surface-above-ring": "stalk_surface_above_ring",
    "stalk-surface-below-ring": "stalk_surface_below_ring",
    "stalk-color-above-ring": "stalk_color_above_ring",
    "stalk-color-below-ring": "stalk_color_below_ring",
    "veil-type": "veil_type",
    "veil-color": "veil_color",
    "ring-number": "ring_number",
    "ring-type": "ring_type",
    "spore-print-color": "spore_print_color",
    "population": "population",
    "habitat": "habitat",
}


@dataclass
class DatasetBundle:
    x: pd.DataFrame
    y: pd.Series
    source_name: str
    source_rows: int


def _safe_str(series: pd.Series) -> pd.Series:
    return series.astype(str).str.strip()


def load_mushroom_dataset() -> DatasetBundle:
    bundle = fetch_openml(name="mushroom", version=1, as_frame=True, parser="auto")
    frame = bundle.frame.copy()
    if frame is None or frame.empty:
        raise RuntimeError("OpenML mushroom dataset is empty")

    frame = frame.rename(columns=RAW_TO_CANONICAL)
    missing = [feature for feature in EXPECTED_FEATURES if feature not in frame.columns]
    if missing:
        raise RuntimeError("Mushroom dataset missing required features: " + ", ".join(missing))

    x = frame[EXPECTED_FEATURES].copy()
    for feature in EXPECTED_FEATURES:
        x[feature] = _safe_str(x[feature])

    target_raw = _safe_str(frame["class"])
    y = (target_raw == "p").astype(int)

    source_rows = int(x.shape[0])
    max_rows = int(settings.training_max_rows)
    if max_rows > 0 and source_rows > max_rows:
        x, _, y, _ = train_test_split(
            x,
            y,
            train_size=max_rows,
            random_state=42,
            stratify=y,
        )

    return DatasetBundle(x=x, y=y, source_name="OpenML Mushroom (UCI)", source_rows=source_rows)


def _build_preprocessor(scale_numeric: bool) -> ColumnTransformer:
    transformers: list[tuple[str, Any, list[str]]] = []

    if NUMERIC_FEATURES:
        numeric_steps: list[tuple[str, Any]] = [("imputer", SimpleImputer(strategy="median"))]
        if scale_numeric:
            numeric_steps.append(("scaler", StandardScaler()))
        numeric_transformer = Pipeline(steps=numeric_steps)
        transformers.append(("num", numeric_transformer, NUMERIC_FEATURES))

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    transformers.append(("cat", categorical_transformer, CATEGORICAL_FEATURES))

    return ColumnTransformer(transformers=transformers)


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

    dataset = load_mushroom_dataset()
    x_train, x_test, y_train, y_test = train_test_split(
        dataset.x,
        dataset.y,
        test_size=0.2,
        random_state=42,
        stratify=dataset.y,
    )

    model_configs: dict[str, tuple[Any, bool]] = {
        "logistic_regression": (LogisticRegression(max_iter=2500, C=2.0, random_state=42), True),
        "decision_tree": (DecisionTreeClassifier(max_depth=22, min_samples_leaf=1, random_state=42), False),
        "random_forest": (
            RandomForestClassifier(n_estimators=450, max_depth=40, min_samples_split=2, random_state=42),
            False,
        ),
        "knn": (KNeighborsClassifier(n_neighbors=5, weights="distance"), True),
        "svm": (SVC(kernel="rbf", C=3.0, gamma="scale", probability=True, random_state=42), True),
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

    best_model = max(metrics_by_model, key=lambda name: metrics_by_model[name]["accuracy"])
    positive_rate = float(dataset.y.mean())

    feature_stats: dict[str, dict[str, Any]] = {}
    feature_value_target_rate: dict[str, dict[str, float]] = {}
    feature_value_frequencies: dict[str, dict[str, float]] = {}
    for feature in EXPECTED_FEATURES:
        options = FEATURE_DEFINITIONS[feature]["options"]
        feature_stats[feature] = {
            "min": 0,
            "max": len(options) - 1,
            "type": "categorical",
            "description": str(FEATURE_DEFINITIONS[feature]["description"]),
            "allowed_values": [{"code": code, "label": label} for code, label in options.items()],
        }

        rates: dict[str, float] = {}
        frequencies: dict[str, float] = {}
        grouped_target = dataset.y.groupby(dataset.x[feature]).mean()
        grouped_count = dataset.x[feature].value_counts(normalize=True)
        for code in options.keys():
            rates[code] = float(grouped_target.get(code, positive_rate))
            frequencies[code] = float(grouped_count.get(code, 0.0))
        feature_value_target_rate[feature] = rates
        feature_value_frequencies[feature] = frequencies

    metadata = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset_source": dataset.source_name,
        "dataset_rows_raw": dataset.source_rows,
        "dataset_rows": int(dataset.x.shape[0]),
        "feature_columns": EXPECTED_FEATURES,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "best_model": best_model,
        "metrics": metrics_by_model,
        "target_positive_rate": positive_rate,
        "feature_stats": feature_stats,
        "feature_value_target_rate": feature_value_target_rate,
        "feature_value_frequencies": feature_value_frequencies,
    }

    with (output_path / "metadata.json").open("w", encoding="utf-8") as fp:
        json.dump(metadata, fp, indent=2)

    return metadata


if __name__ == "__main__":
    result = train_and_save_models()
    print(json.dumps(result, indent=2))
