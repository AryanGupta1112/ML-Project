export interface PatientInput {
  cap_shape: string;
  cap_surface: string;
  cap_color: string;
  bruises: string;
  odor: string;
  gill_attachment: string;
  gill_spacing: string;
  gill_size: string;
  gill_color: string;
  stalk_shape: string;
  stalk_root: string;
  stalk_surface_above_ring: string;
  stalk_surface_below_ring: string;
  stalk_color_above_ring: string;
  stalk_color_below_ring: string;
  veil_type: string;
  veil_color: string;
  ring_number: string;
  ring_type: string;
  spore_print_color: string;
  population: string;
  habitat: string;
}

export interface FeatureContribution {
  feature: string;
  feature_value: string | number;
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
  warnings: string[];
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
  active_inference_model: string;
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

export interface FeatureInfoOption {
  code: string;
  label: string;
}

export interface FeatureInfoItem {
  name: string;
  type: "numeric" | "categorical";
  min: number;
  max: number;
  description: string;
  allowed_values: FeatureInfoOption[];
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
