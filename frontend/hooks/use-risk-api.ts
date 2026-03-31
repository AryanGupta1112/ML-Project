"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { checkHealth, getFeatureInfo, getHistory, getModelPerformance, getTrainingSummary, predictRisk, runWhatIf } from "@/services/api";
import type { PatientInput, WhatIfRequest } from "@/types/api";

export const queryKeys = {
  health: ["health"] as const,
  models: ["models-performance"] as const,
  trainingSummary: ["training-summary"] as const,
  featureInfo: ["feature-info"] as const,
  history: (limit: number) => ["history", limit] as const
};

export function useHealthStatus() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: checkHealth,
    refetchInterval: 30000
  });
}

export function useModelPerformance() {
  return useQuery({
    queryKey: queryKeys.models,
    queryFn: getModelPerformance,
    refetchInterval: 60_000
  });
}

export function useTrainingSummary() {
  return useQuery({
    queryKey: queryKeys.trainingSummary,
    queryFn: getTrainingSummary,
    refetchInterval: 60_000
  });
}

export function useFeatureInfo() {
  return useQuery({
    queryKey: queryKeys.featureInfo,
    queryFn: getFeatureInfo,
    refetchInterval: 300_000
  });
}

export function useHistory(limit = 100) {
  return useQuery({
    queryKey: queryKeys.history(limit),
    queryFn: () => getHistory(limit),
    refetchInterval: 20_000
  });
}

export function usePredictMutation() {
  return useMutation({
    mutationFn: ({ payload, modelName }: { payload: PatientInput; modelName?: string }) => predictRisk(payload, modelName)
  });
}

export function useWhatIfMutation() {
  return useMutation({
    mutationFn: ({ payload, modelName }: { payload: WhatIfRequest; modelName?: string }) => runWhatIf(payload, modelName)
  });
}
