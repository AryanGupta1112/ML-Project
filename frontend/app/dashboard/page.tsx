"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FlaskConical, Info, RefreshCw } from "lucide-react";

import { HistoryTrendChart } from "@/components/history-trend-chart";
import { PatientForm } from "@/components/patient-form";
import { RefreshIndicator } from "@/components/refresh-indicator";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { RiskSummary } from "@/components/risk-summary";
import { TopFactorsChart } from "@/components/top-factors-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFeatureInfo, useHistory, useModelPerformance, usePredictMutation, useTrainingSummary } from "@/hooks/use-risk-api";
import { getModelUseCase } from "@/lib/model-guidance";
import { buildMushroomDescription } from "@/lib/mushroom-description";
import { defaultPatientValues, getFeatureLabel } from "@/lib/patient-config";
import { patientSchema, type PatientFormValues } from "@/lib/schemas";
import { formatModelName } from "@/lib/utils";

export default function DashboardPage() {
  const [selectedModel, setSelectedModel] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultPatientValues
  });

  const predictMutation = usePredictMutation();
  const historyQuery = useHistory(30);
  const featureInfoQuery = useFeatureInfo();
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

  const onSubmit = (values: PatientFormValues) => {
    predictMutation.mutate({ payload: values, modelName: selectedModel || undefined });
  };

  const onGenerateDescription = () => {
    const values = form.getValues();
    setGeneratedDescription(buildMushroomDescription(values));
  };

  const factorsTableData = useMemo(() => predictMutation.data?.top_factors ?? [], [predictMutation.data?.top_factors]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Mushroom Safety Check
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 text-muted-foreground hover:bg-muted">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose the options that best match what you see. The app estimates how likely the mushroom is unsafe.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <RefreshIndicator isFetching={historyQuery.isFetching} updatedAt={historyQuery.dataUpdatedAt} label="History update" />
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-3 rounded-md border border-border bg-muted/30 p-3 md:grid-cols-[280px_1fr] md:items-center">
              <div className="space-y-2">
                <Label htmlFor="model-select">AI model version</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model-select" className="bg-background">
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
              New to mushrooms? That is okay. Fill in only what you can observe clearly. Unknown options are included where needed.
            </p>
            <PatientForm form={form} />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={onGenerateDescription}>
                Generate Description
              </Button>
              <Button type="submit" size="lg" disabled={predictMutation.isPending}>
                {predictMutation.isPending ? "Checking..." : "Check Safety"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset(defaultPatientValues);
                  setGeneratedDescription("");
                }}
              >
                Clear Form
              </Button>
              {predictMutation.error ? <p className="text-sm text-danger">Could not run prediction. Please try again.</p> : null}
            </div>
            {generatedDescription ? (
              <div className="rounded-md border border-border bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Generated Mushroom Summary</p>
                <p className="mt-2 text-sm leading-6">{generatedDescription}</p>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {predictMutation.isPending ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : null}

      {predictMutation.data ? (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <RiskSummary result={predictMutation.data} />
            <RecommendationsPanel recommendations={predictMutation.data.recommendations} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <TopFactorsChart factors={predictMutation.data.top_factors} />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Why You Got This Result</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Full Details</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Main Reasons</DialogTitle>
                      <DialogDescription>These features had the strongest effect on the final result.</DialogDescription>
                    </DialogHeader>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Feature</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Effect Direction</TableHead>
                          <TableHead>Impact Strength</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {factorsTableData.map((item) => (
                          <TableRow key={item.feature}>
                            <TableCell>{getFeatureLabel(item.feature)}</TableCell>
                            <TableCell>{item.feature_value}</TableCell>
                            <TableCell>{item.direction}</TableCell>
                            <TableCell>{item.impact_score.toFixed(4)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Effect Direction</TableHead>
                      <TableHead>Impact Strength</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {factorsTableData.map((item) => (
                      <TableRow key={item.feature}>
                        <TableCell>{getFeatureLabel(item.feature)}</TableCell>
                        <TableCell>{item.direction}</TableCell>
                        <TableCell>{item.impact_score.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Feature Guide (Simple Meaning)</CardTitle>
          <div className="flex items-center gap-2">
            <RefreshIndicator isFetching={featureInfoQuery.isFetching} updatedAt={featureInfoQuery.dataUpdatedAt} label="Last update" />
            <Button variant="outline" size="sm" onClick={() => void featureInfoQuery.refetch()} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {featureInfoQuery.isLoading ? (
            <Skeleton className="h-32" />
          ) : featureInfoQuery.isError || !featureInfoQuery.data ? (
            <p className="text-sm text-danger">Could not load the feature guide.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Field type</TableHead>
                  <TableHead>Values</TableHead>
                  <TableHead>Simple Meaning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureInfoQuery.data.features.map((feature) => (
                  <TableRow key={feature.name}>
                    <TableCell className="font-medium">{getFeatureLabel(feature.name)}</TableCell>
                    <TableCell className="capitalize">{feature.type}</TableCell>
                    <TableCell>
                      {feature.allowed_values.length
                        ? `${feature.allowed_values.length} options`
                        : `${feature.min} - ${feature.max}`}
                    </TableCell>
                    <TableCell>{feature.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {historyQuery.data?.items?.length ? <HistoryTrendChart items={historyQuery.data.items} /> : null}
    </div>
  );
}
