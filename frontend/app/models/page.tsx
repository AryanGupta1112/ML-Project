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
import { formatModelName } from "@/lib/utils";

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
    return <p className="text-danger">Could not load model scores. Please check that the server is running.</p>;
  }

  const chartData = data.metrics.map((metric) => ({
    model: formatModelName(metric.model_name),
    accuracy: Number((metric.accuracy * 100).toFixed(2)),
    f1: Number((metric.f1_score * 100).toFixed(2)),
    auc: Number((metric.roc_auc * 100).toFixed(2))
  }));

  const rankedMetrics = [...data.metrics].sort((a, b) => b.roc_auc - a.roc_auc);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Training Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Data source</p>
            <p className="font-medium">{trainingSummary.data?.dataset_source ?? "Not available"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">People / health fields</p>
            <p className="font-medium">
              {trainingSummary.data?.dataset_rows ?? "--"} / {trainingSummary.data?.feature_count ?? "--"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">How data was split</p>
            <p className="font-medium">{trainingSummary.data?.train_test_split ?? "Not available"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Most accurate model</p>
            <p className="font-medium">{formatModelName(data.best_model)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Model Score Comparison</CardTitle>
          <div className="flex items-center gap-2">
            <RefreshIndicator isFetching={isFetching} updatedAt={dataUpdatedAt} label="Last update" />
            <Button variant="outline" size="sm" onClick={() => void refetch()} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Badge variant="success">Best: {formatModelName(data.best_model)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="model" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    accuracy: "Accuracy",
                    f1: "Balanced success score",
                    auc: "Model quality score"
                  };
                  return [`${value}%`, labels[name] ?? name];
                }}
              />
              <Legend
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    accuracy: "Accuracy",
                    f1: "Balanced success score",
                    auc: "Model quality score"
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
          <CardTitle>Detailed Scores</CardTitle>
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
                <TableHead>Balanced success score</TableHead>
                <TableHead>Model quality score</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Training Files</CardTitle>
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
