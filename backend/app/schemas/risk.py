from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class PatientInput(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age in years")
    sex: int = Field(..., ge=0, le=1, description="0 = female, 1 = male")
    cp: int = Field(..., ge=0, le=3, description="Chest pain type")
    trestbps: float = Field(..., ge=80, le=250, description="Resting blood pressure (mm Hg)")
    chol: float = Field(..., ge=80, le=700, description="Serum cholesterol (mg/dl)")
    fbs: int = Field(..., ge=0, le=1, description="Fasting blood sugar > 120 mg/dl")
    restecg: int = Field(..., ge=0, le=2, description="Resting electrocardiographic results")
    thalach: float = Field(..., ge=60, le=250, description="Maximum heart rate achieved")
    exang: int = Field(..., ge=0, le=1, description="Exercise induced angina")
    oldpeak: float = Field(..., ge=0.0, le=10.0, description="ST depression induced by exercise")
    slope: int = Field(..., ge=0, le=2, description="Slope of peak exercise ST segment")
    ca: int = Field(..., ge=0, le=4, description="Number of major vessels colored by fluoroscopy")
    thal: int = Field(..., ge=0, le=3, description="Thalassemia")

    @field_validator("trestbps", "chol", "thalach", "oldpeak")
    @classmethod
    def round_continuous(cls, value: float) -> float:
        return round(float(value), 3)


class FeatureContribution(BaseModel):
    feature: str
    feature_value: float | int
    impact_score: float
    direction: Literal["increases", "decreases"]


class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    risk_score: int
    risk_level: str
    model_name: str
    top_factors: list[FeatureContribution]
    recommendations: list[str]


class ModelMetric(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float


class ModelsPerformanceResponse(BaseModel):
    best_model: str
    metrics: list[ModelMetric]


class TrainingSummaryResponse(BaseModel):
    dataset_source: str
    dataset_rows: int
    feature_count: int
    numeric_feature_count: int
    categorical_feature_count: int
    generated_at: datetime | None
    best_model: str
    algorithms_trained: list[str]
    train_test_split: str
    training_library: str
    training_script: str
    artifacts_dir: str


class WhatIfRequest(BaseModel):
    base_input: PatientInput
    modified_input: PatientInput


class WhatIfResponse(BaseModel):
    base_result: PredictionResponse
    modified_result: PredictionResponse
    probability_delta: float
    risk_score_delta: int
    risk_level_changed: bool


class FeatureInfoItem(BaseModel):
    name: str
    type: Literal["numeric", "categorical"]
    min: float | int
    max: float | int
    description: str


class FeaturesInfoResponse(BaseModel):
    features: list[FeatureInfoItem]


class HealthResponse(BaseModel):
    status: Literal["ok"]
    model_loaded: bool
    timestamp: datetime


class HistoryItem(BaseModel):
    id: int
    timestamp: datetime
    model_name: str
    prediction: int
    probability: float
    risk_score: int
    risk_level: str
    input_payload: dict
    top_factors: list[FeatureContribution]


class HistoryResponse(BaseModel):
    items: list[HistoryItem]
