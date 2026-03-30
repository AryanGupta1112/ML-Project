import axios from "axios";

import type {
  FeaturesInfoResponse,
  HistoryResponse,
  ModelsPerformanceResponse,
  PatientInput,
  PredictionResponse,
  TrainingSummaryResponse,
  WhatIfRequest,
  WhatIfResponse
} from "@/types/api";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export async function predictRisk(payload: PatientInput): Promise<PredictionResponse> {
  const { data } = await apiClient.post<PredictionResponse>("/predict", payload);
  return data;
}

export async function getModelPerformance(): Promise<ModelsPerformanceResponse> {
  const { data } = await apiClient.get<ModelsPerformanceResponse>("/models/performance");
  return data;
}

export async function getTrainingSummary(): Promise<TrainingSummaryResponse> {
  const { data } = await apiClient.get<TrainingSummaryResponse>("/models/training-summary");
  return data;
}

export async function getFeatureInfo(): Promise<FeaturesInfoResponse> {
  const { data } = await apiClient.get<FeaturesInfoResponse>("/features/info");
  return data;
}

export async function runWhatIf(payload: WhatIfRequest): Promise<WhatIfResponse> {
  const { data } = await apiClient.post<WhatIfResponse>("/what-if", payload);
  return data;
}

export async function getHistory(limit = 100): Promise<HistoryResponse> {
  const { data } = await apiClient.get<HistoryResponse>(`/history?limit=${limit}`);
  return data;
}

export async function checkHealth(): Promise<{ status: string; model_loaded: boolean; timestamp: string }> {
  const { data } = await apiClient.get<{ status: string; model_loaded: boolean; timestamp: string }>("/health");
  return data;
}
