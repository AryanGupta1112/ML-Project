"use client";

import { BookOpen, Database, FlaskConical, GitBranch, Settings2 } from "lucide-react";

import { RefreshIndicator } from "@/components/refresh-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFeatureInfo, useTrainingSummary } from "@/hooks/use-risk-api";
import { getFeatureLabel } from "@/lib/patient-config";

const pipelineBlocks = [
  {
    icon: Database,
    title: "Step 1: Load Data",
    detail: "We download a public mushroom dataset and rename fields to readable names."
  },
  {
    icon: Settings2,
    title: "Step 2: Prepare Data",
    detail: "We clean category values and convert them into model-friendly numbers."
  },
  {
    icon: FlaskConical,
    title: "Step 3: Train and Test",
    detail: "We train five models and test them on unseen data for a fair score."
  },
  {
    icon: GitBranch,
    title: "Step 4: Use In App",
    detail: "The best model is used in the app to predict safety and explain why."
  }
];

export default function AboutPage() {
  const trainingSummary = useTrainingSummary();
  const featureInfo = useFeatureInfo();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            How This Model Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            This page explains where the data comes from, how the model is trained, and how predictions are made.
          </p>
          <p>
            For technical users: training code is in <span className="font-mono">backend/app/ml/train.py</span>. Saved models and details are in{" "}
            <span className="font-mono">backend/saved_models</span>.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {pipelineBlocks.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="rounded-md bg-muted p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Live Training Details</CardTitle>
          <RefreshIndicator isFetching={trainingSummary.isFetching} updatedAt={trainingSummary.dataUpdatedAt} label="Last update" />
        </CardHeader>
        <CardContent>
          {trainingSummary.isLoading ? (
            <Skeleton className="h-36 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Data source</TableCell>
                  <TableCell>{trainingSummary.data?.dataset_source ?? "Not available"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Records in dataset</TableCell>
                  <TableCell>{trainingSummary.data?.dataset_rows ?? "--"} mushroom records</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Input features used</TableCell>
                  <TableCell>{trainingSummary.data?.feature_count ?? "--"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Training/testing split</TableCell>
                  <TableCell>{trainingSummary.data?.train_test_split ?? "Not available"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Training time</TableCell>
                  <TableCell>
                    {trainingSummary.data?.generated_at
                      ? new Date(trainingSummary.data.generated_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })
                      : "Not available"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Reference</CardTitle>
        </CardHeader>
        <CardContent>
          {featureInfo.isLoading ? (
            <Skeleton className="h-36 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>What it means</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureInfo.data?.features.map((feature) => (
                  <TableRow key={feature.name}>
                    <TableCell className="font-medium">{getFeatureLabel(feature.name)}</TableCell>
                    <TableCell>{feature.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
