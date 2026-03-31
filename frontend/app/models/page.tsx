"use client";

import { RefreshCw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { RefreshIndicator } from "@/components/refresh-indicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useModelPerformance, useTrainingSummary } from "@/hooks/use-risk-api";
import { getModelUseCase } from "@/lib/model-guidance";
import { formatModelName } from "@/lib/utils";
import type { ModelMetric } from "@/types/api";

type ScoreMetricKey = "accuracy" | "precision" | "recall" | "f1_score" | "roc_auc";

function bestModelByMetric(metrics: ModelMetric[], metric: ScoreMetricKey): ModelMetric {
  return metrics.reduce((best, current) => (current[metric] > best[metric] ? current : best), metrics[0]);
}

export default function ModelsPage() {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useModelPerformance();
  const trainingSummary = useTrainingSummary();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-danger">Could not load model results. Please check that the backend server is running.</p>;
  }

  const chartData = data.metrics.map((metric) => ({
    model: formatModelName(metric.model_name),
    accuracy: Number((metric.accuracy * 100).toFixed(2)),
    f1: Number((metric.f1_score * 100).toFixed(2)),
    auc: Number((metric.roc_auc * 100).toFixed(2))
  }));

  const rankedMetrics = [...data.metrics].sort((a, b) => b.roc_auc - a.roc_auc);
  const bestByMetric = {
    accuracy: bestModelByMetric(data.metrics, "accuracy").model_name,
    precision: bestModelByMetric(data.metrics, "precision").model_name,
    recall: bestModelByMetric(data.metrics, "recall").model_name,
    f1_score: bestModelByMetric(data.metrics, "f1_score").model_name,
    roc_auc: bestModelByMetric(data.metrics, "roc_auc").model_name
  };

  const bestForWhat = [
    {
      title: "Best overall quality",
      modelName: bestByMetric.roc_auc,
      detail: "Use when you want the strongest overall ranking of low vs high toxicity."
    },
    {
      title: "Best simple correctness",
      modelName: bestByMetric.accuracy,
      detail: "Use when you want the highest total percentage of correct predictions."
    },
    {
      title: "Best at reducing false alarms",
      modelName: bestByMetric.precision,
      detail: "Use when a poisonous prediction must be very trustworthy."
    },
    {
      title: "Best at catching dangerous cases",
      modelName: bestByMetric.recall,
      detail: "Use when missing a truly poisonous sample is the bigger concern."
    },
    {
      title: "Best balance",
      modelName: bestByMetric.f1_score,
      detail: "Use when you want a balanced trade-off between precision and recall."
    }
  ];
  const winLabelsByModel = bestForWhat.reduce<Record<string, string[]>>((acc, item) => {
    if (!acc[item.modelName]) acc[item.modelName] = [];
    acc[item.modelName].push(item.title);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Training Snapshot (Quick Facts)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Data source</p>
            <p className="font-medium">{trainingSummary.data?.dataset_source ?? "Not available"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Records / features</p>
            <p className="font-medium">
              {trainingSummary.data?.dataset_rows ?? "--"} / {trainingSummary.data?.feature_count ?? "--"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">How data was split</p>
            <p className="font-medium">{trainingSummary.data?.train_test_split ?? "Not available"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Best model after training</p>
            <p className="font-medium">{formatModelName(data.best_model)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Model currently used in the app</p>
            <p className="font-medium">{formatModelName(trainingSummary.data?.active_inference_model ?? data.best_model)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Best Model By Goal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {bestForWhat.map((item) => (
            <div key={item.title} className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-base font-semibold">{formatModelName(item.modelName)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Model Score Chart</CardTitle>
          <div className="flex items-center gap-2">
            <RefreshIndicator isFetching={isFetching} updatedAt={dataUpdatedAt} label="Last update" />
            <Button variant="outline" size="sm" onClick={() => void refetch()} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Badge variant="success">Top model: {formatModelName(data.best_model)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="model" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    accuracy: "Accuracy",
                    f1: "Balance score (F1)",
                    auc: "Overall quality (AUC)"
                  };
                  const metricName = String(name);
                  const numericValue = typeof value === "number" ? value : Number(value);
                  const displayValue = Number.isFinite(numericValue) ? `${numericValue}%` : String(value);
                  return [displayValue, labels[metricName] ?? metricName];
                }}
              />
              <Legend
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    accuracy: "Accuracy",
                    f1: "Balance score (F1)",
                    auc: "Overall quality (AUC)"
                  };
                  return labels[value] ?? value;
                }}
              />
              <Bar dataKey="accuracy" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="auc" fill="#0891b2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Model Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Model name</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Precision</TableHead>
                <TableHead>Recall</TableHead>
                <TableHead>Balance score (F1)</TableHead>
                <TableHead>Overall quality (AUC)</TableHead>
                <TableHead>Best use</TableHead>
                <TableHead>Wins</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedMetrics.map((metric, index) => (
                <TableRow key={metric.model_name}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{formatModelName(metric.model_name)}</TableCell>
                  <TableCell>{(metric.accuracy * 100).toFixed(2)}%</TableCell>
                  <TableCell>{(metric.precision * 100).toFixed(2)}%</TableCell>
                  <TableCell>{(metric.recall * 100).toFixed(2)}%</TableCell>
                  <TableCell>{(metric.f1_score * 100).toFixed(2)}%</TableCell>
                  <TableCell>{(metric.roc_auc * 100).toFixed(2)}%</TableCell>
                  <TableCell className="max-w-72 text-sm text-muted-foreground">{getModelUseCase(metric.model_name)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {(winLabelsByModel[metric.model_name] ?? []).map((label) => (
                        <Badge key={`${metric.model_name}-${label}`} variant="success">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Training Files (Developer Info)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Training code file:</span> {trainingSummary.data?.training_script ?? "Not available"}
          </p>
          <p>
            <span className="text-muted-foreground">Folder with saved models:</span>{" "}
            {trainingSummary.data?.artifacts_dir ?? "Not available"}
          </p>
          <p>
            <span className="text-muted-foreground">Main machine learning library:</span>{" "}
            {trainingSummary.data?.training_library ?? "Not available"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
