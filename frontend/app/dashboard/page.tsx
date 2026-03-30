"use client";

import { useMemo } from "react";
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
import { useFeatureInfo, useHistory, usePredictMutation } from "@/hooks/use-risk-api";
import { defaultPatientValues, getFeatureLabel } from "@/lib/patient-config";
import { patientSchema, type PatientFormValues } from "@/lib/schemas";

export default function DashboardPage() {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultPatientValues
  });

  const predictMutation = usePredictMutation();
  const historyQuery = useHistory(30);
  const featureInfoQuery = useFeatureInfo();

  const onSubmit = (values: PatientFormValues) => {
    predictMutation.mutate(values);
  };

  const factorsTableData = useMemo(() => predictMutation.data?.top_factors ?? [], [predictMutation.data?.top_factors]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Heart Risk Check
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="rounded-full p-1 text-muted-foreground hover:bg-muted">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fill in the health form to get a risk score, chance %, and top reasons.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <RefreshIndicator isFetching={historyQuery.isFetching} updatedAt={historyQuery.dataUpdatedAt} label="History update" />
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <PatientForm form={form} />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" size="lg" disabled={predictMutation.isPending}>
                {predictMutation.isPending ? "Checking..." : "Check Risk"}
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset(defaultPatientValues)}>
                Clear Form
              </Button>
              {predictMutation.error ? <p className="text-sm text-danger">Could not check risk. Please try again.</p> : null}
            </div>
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
                <CardTitle>Why This Result Was Given</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Full Details</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Main Reasons</DialogTitle>
                      <DialogDescription>These health fields had the strongest effect on this result.</DialogDescription>
                    </DialogHeader>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Health field</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Effect</TableHead>
                          <TableHead>Strength</TableHead>
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
                      <TableHead>Health field</TableHead>
                      <TableHead>Effect</TableHead>
                      <TableHead>Strength</TableHead>
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
          <CardTitle>Health Field Guide</CardTitle>
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
            <p className="text-sm text-danger">Could not load the health field guide.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Health field</TableHead>
                  <TableHead>Field type</TableHead>
                  <TableHead>Range</TableHead>
                  <TableHead>Meaning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureInfoQuery.data.features.map((feature) => (
                  <TableRow key={feature.name}>
                    <TableCell className="font-medium">{getFeatureLabel(feature.name)}</TableCell>
                    <TableCell className="capitalize">{feature.type}</TableCell>
                    <TableCell>
                      {feature.min} - {feature.max}
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
