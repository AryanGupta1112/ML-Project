"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRightLeft } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PatientForm } from "@/components/patient-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModelPerformance, useTrainingSummary, useWhatIfMutation } from "@/hooks/use-risk-api";
import { getModelUseCase } from "@/lib/model-guidance";
import { buildMushroomDescription } from "@/lib/mushroom-description";
import { defaultPatientValues, highRiskMushroomValues } from "@/lib/patient-config";
import { patientSchema, type PatientFormValues } from "@/lib/schemas";
import { formatModelName } from "@/lib/utils";

export default function WhatIfPage() {
  const [selectedModel, setSelectedModel] = useState("");
  const [baseDescription, setBaseDescription] = useState("");
  const [modifiedDescription, setModifiedDescription] = useState("");

  const baseForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultPatientValues
  });

  const modifiedForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: highRiskMushroomValues
  });

  const whatIfMutation = useWhatIfMutation();
  const modelsQuery = useModelPerformance();
  const trainingSummaryQuery = useTrainingSummary();

  const availableModels = useMemo(() => {
    if (trainingSummaryQuery.data?.algorithms_trained?.length) {
      return trainingSummaryQuery.data.algorithms_trained;
    }
    return modelsQuery.data?.metrics.map((item) => item.model_name) ?? [];
  }, [modelsQuery.data?.metrics, trainingSummaryQuery.data?.algorithms_trained]);

  useEffect(() => {
    if (!availableModels.length) return;
    if (selectedModel && availableModels.includes(selectedModel)) return;

    const preferredModel = trainingSummaryQuery.data?.active_inference_model;
    setSelectedModel(preferredModel && availableModels.includes(preferredModel) ? preferredModel : availableModels[0]);
  }, [availableModels, selectedModel, trainingSummaryQuery.data?.active_inference_model]);

  const submitBoth = async () => {
    const baseValid = await baseForm.trigger();
    const modifiedValid = await modifiedForm.trigger();
    if (!baseValid || !modifiedValid) return;

    whatIfMutation.mutate({
      payload: {
        base_input: baseForm.getValues(),
        modified_input: modifiedForm.getValues()
      },
      modelName: selectedModel || undefined
    });
  };

  const chartData = whatIfMutation.data
    ? [
        {
          metric: "Toxicity score",
          baseline: whatIfMutation.data.base_result.risk_score,
          modified: whatIfMutation.data.modified_result.risk_score
        },
        {
          metric: "Chance (%)",
          baseline: Number((whatIfMutation.data.base_result.probability * 100).toFixed(2)),
          modified: Number((whatIfMutation.data.modified_result.probability * 100).toFixed(2))
        }
      ]
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Compare Two Mushroom Cases
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 rounded-md border border-border bg-muted/30 p-3 md:grid-cols-[280px_1fr] md:items-center">
            <div className="space-y-2">
              <Label htmlFor="what-if-model-select">AI model version</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="what-if-model-select" className="bg-background">
                  <SelectValue placeholder="Choose model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((modelName) => (
                    <SelectItem key={modelName} value={modelName}>
                      {formatModelName(modelName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedModel ? getModelUseCase(selectedModel) : "Model list is loading from the backend."}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Use this page to see how the result changes when you change a few features from Mushroom A to Mushroom B.
          </p>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold">Mushroom A</h3>
              <PatientForm form={baseForm} />
              <Button type="button" variant="secondary" onClick={() => setBaseDescription(buildMushroomDescription(baseForm.getValues()))}>
                Generate Mushroom A Description
              </Button>
              {baseDescription ? (
                <div className="rounded-md border border-border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mushroom A Summary</p>
                  <p className="mt-2 text-sm leading-6">{baseDescription}</p>
                </div>
              ) : null}
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Mushroom B</h3>
              <PatientForm form={modifiedForm} />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModifiedDescription(buildMushroomDescription(modifiedForm.getValues()))}
              >
                Generate Mushroom B Description
              </Button>
              {modifiedDescription ? (
                <div className="rounded-md border border-border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mushroom B Summary</p>
                  <p className="mt-2 text-sm leading-6">{modifiedDescription}</p>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={submitBoth} size="lg" disabled={whatIfMutation.isPending}>
              {whatIfMutation.isPending ? "Comparing..." : "Compare Toxicity"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                baseForm.reset(defaultPatientValues);
                modifiedForm.reset(highRiskMushroomValues);
                setBaseDescription("");
                setModifiedDescription("");
              }}
            >
              Reset
            </Button>
            {whatIfMutation.error ? <p className="text-sm text-danger">Could not compare these two cases.</p> : null}
          </div>
        </CardContent>
      </Card>

      {whatIfMutation.data ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>What Changed</CardTitle>
              <Badge variant={whatIfMutation.data.risk_score_delta >= 0 ? "danger" : "success"}>
                Safety score change: {whatIfMutation.data.risk_score_delta > 0 ? "+" : ""}
                {whatIfMutation.data.risk_score_delta}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Mushroom A result: <strong>{whatIfMutation.data.base_result.risk_level}</strong>
              </p>
              <p>
                Mushroom B result: <strong>{whatIfMutation.data.modified_result.risk_level}</strong>
              </p>
              <p>
                Chance change: <strong>{(whatIfMutation.data.probability_delta * 100).toFixed(2)}%</strong>
              </p>
              <p>
                Safety level changed: <strong>{whatIfMutation.data.risk_level_changed ? "Yes" : "No"}</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mushroom A vs Mushroom B</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="metric" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="baseline" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="modified" fill="#b45309" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
