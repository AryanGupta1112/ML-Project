export interface PatientInput {
  age: number;
  sex: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
}

export interface FeatureContribution {
  feature: string;
  feature_value: number;
  impact_score: number;
  direction: "increases" | "decreases";
}

export interface PredictionResponse {
  prediction: number;
  probability: number;
  risk_score: number;
  risk_level: string;
  model_name: string;
  top_factors: FeatureContribution[];
  recommendations: string[];
}

export interface ModelMetric {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
}

export interface ModelsPerformanceResponse {
  best_model: string;
  metrics: ModelMetric[];
}

export interface TrainingSummaryResponse {
  dataset_source: string;
  dataset_rows: number;
  feature_count: number;
  numeric_feature_count: number;
  categorical_feature_count: number;
  generated_at: string | null;
  best_model: string;
  algorithms_trained: string[];
  train_test_split: string;
  training_library: string;
  training_script: string;
  artifacts_dir: string;
}

export interface WhatIfRequest {
  base_input: PatientInput;
  modified_input: PatientInput;
}

export interface WhatIfResponse {
  base_result: PredictionResponse;
  modified_result: PredictionResponse;
  probability_delta: number;
  risk_score_delta: number;
  risk_level_changed: boolean;
}

export interface FeatureInfoItem {
  name: string;
  type: "numeric" | "categorical";
  min: number;
  max: number;
  description: string;
}

export interface FeaturesInfoResponse {
  features: FeatureInfoItem[];
}

export interface HistoryItem {
  id: number;
  timestamp: string;
  model_name: string;
  prediction: number;
  probability: number;
  risk_score: number;
  risk_level: string;
  input_payload: PatientInput;
  top_factors: FeatureContribution[];
}

export interface HistoryResponse {
  items: HistoryItem[];
}
