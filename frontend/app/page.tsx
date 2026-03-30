"use client";

import { Database, FlaskConical, Server, ShieldCheck, Workflow } from "lucide-react";

import { RefreshIndicator } from "@/components/refresh-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFeatureInfo, useHealthStatus, useModelPerformance, useTrainingSummary } from "@/hooks/use-risk-api";
import { getFeatureLabel } from "@/lib/patient-config";
import { formatModelName } from "@/lib/utils";

export default function LandingPage() {
  const health = useHealthStatus();
  const models = useModelPerformance();
  const featureInfo = useFeatureInfo();
  const trainingSummary = useTrainingSummary();

  const bestMetric = models.data?.metrics.find((metric) => metric.model_name === models.data?.best_model);
  const generatedAt = trainingSummary.data?.generated_at
    ? new Date(trainingSummary.data.generated_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Not available";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>What This System Does</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This tool estimates heart disease risk from health details. It also explains the result and shows how the model was trained.
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {health.isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-lg font-semibold">{health.data?.status === "ok" ? "Online" : "Unavailable"}</p>
                <p className="text-sm text-muted-foreground">Model ready: {health.data?.model_loaded ? "Yes" : "No"}</p>
              </>
            )}
            <RefreshIndicator isFetching={health.isFetching} updatedAt={health.dataUpdatedAt} label="Last check" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-primary" />
              Dataset Size
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {trainingSummary.isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-lg font-semibold">{trainingSummary.data?.dataset_rows ?? "--"} people</p>
                <p className="text-sm text-muted-foreground">
                  {trainingSummary.data?.feature_count ?? "--"} health fields ({trainingSummary.data?.numeric_feature_count ?? "--"} number
                  fields, {trainingSummary.data?.categorical_feature_count ?? "--"} category fields)
                </p>
              </>
            )}
            <RefreshIndicator isFetching={trainingSummary.isFetching} updatedAt={trainingSummary.dataUpdatedAt} label="Last update" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" />
              Most Accurate Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {models.isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-lg font-semibold">
                  {models.data?.best_model ? formatModelName(models.data.best_model) : "Not available"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Model quality score: {bestMetric ? (bestMetric.roc_auc * 100).toFixed(2) : "--"}%
                </p>
              </>
            )}
            <RefreshIndicator isFetching={models.isFetching} updatedAt={models.dataUpdatedAt} label="Last update" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Last Training Run
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {trainingSummary.isLoading ? <Skeleton className="h-12 w-full" /> : <p className="text-sm">{generatedAt}</p>}
            <p className="text-sm text-muted-foreground">Data source: {trainingSummary.data?.dataset_source ?? "Not available"}</p>
            <RefreshIndicator isFetching={trainingSummary.isFetching} updatedAt={trainingSummary.dataUpdatedAt} label="Last update" />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Workflow className="h-4 w-4 text-primary" />
            How Training Happens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Load heart-health data from OpenML.</p>
          <p>2. Clean missing values and prepare the health fields for model training.</p>
          <p>3. Split the data into training and testing sets.</p>
          <p>4. Train five different model types and compare results.</p>
          <p>5. Save the best model and all training details for later use.</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Model Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {models.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model name</TableHead>
                    <TableHead>Balanced success score</TableHead>
                    <TableHead>Model quality score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.data?.metrics.map((metric) => (
                    <TableRow key={metric.model_name}>
                      <TableCell className="font-medium">{formatModelName(metric.model_name)}</TableCell>
                      <TableCell>{(metric.f1_score * 100).toFixed(2)}%</TableCell>
                      <TableCell>{(metric.roc_auc * 100).toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Fields Used By The Model</CardTitle>
          </CardHeader>
          <CardContent>
            {featureInfo.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Health field</TableHead>
                    <TableHead>Field type</TableHead>
                    <TableHead>Typical range</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureInfo.data?.features.map((feature) => (
                    <TableRow key={feature.name}>
                      <TableCell className="font-medium">{getFeatureLabel(feature.name)}</TableCell>
                      <TableCell className="capitalize">{feature.type}</TableCell>
                      <TableCell>
                        {feature.min} to {feature.max}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
