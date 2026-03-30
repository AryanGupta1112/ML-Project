"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRightLeft } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PatientForm } from "@/components/patient-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWhatIfMutation } from "@/hooks/use-risk-api";
import { defaultPatientValues } from "@/lib/patient-config";
import { patientSchema, type PatientFormValues } from "@/lib/schemas";

export default function WhatIfPage() {
  const baseForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultPatientValues
  });

  const modifiedForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      ...defaultPatientValues,
      trestbps: 150,
      chol: 260
    }
  });

  const whatIfMutation = useWhatIfMutation();

  const submitBoth = async () => {
    const baseValid = await baseForm.trigger();
    const modifiedValid = await modifiedForm.trigger();
    if (!baseValid || !modifiedValid) return;

    whatIfMutation.mutate({
      base_input: baseForm.getValues(),
      modified_input: modifiedForm.getValues()
    });
  };

  const chartData = whatIfMutation.data
    ? [
        {
          metric: "Risk score",
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
            Compare Two Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold">Current Profile</h3>
              <PatientForm form={baseForm} />
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Changed Profile</h3>
              <PatientForm form={modifiedForm} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={submitBoth} size="lg" disabled={whatIfMutation.isPending}>
              {whatIfMutation.isPending ? "Comparing..." : "Compare Risk"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                baseForm.reset(defaultPatientValues);
                modifiedForm.reset({ ...defaultPatientValues, trestbps: 150, chol: 260 });
              }}
            >
              Reset
            </Button>
            {whatIfMutation.error ? <p className="text-sm text-danger">Could not compare these two profiles.</p> : null}
          </div>
        </CardContent>
      </Card>

      {whatIfMutation.data ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Difference Summary</CardTitle>
              <Badge variant={whatIfMutation.data.risk_score_delta >= 0 ? "danger" : "success"}>
                Score change: {whatIfMutation.data.risk_score_delta > 0 ? "+" : ""}
                {whatIfMutation.data.risk_score_delta}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Current result: <strong>{whatIfMutation.data.base_result.risk_level}</strong>
              </p>
              <p>
                Changed result: <strong>{whatIfMutation.data.modified_result.risk_level}</strong>
              </p>
              <p>
                Chance change: <strong>{(whatIfMutation.data.probability_delta * 100).toFixed(2)}%</strong>
              </p>
              <p>
                Risk level changed: <strong>{whatIfMutation.data.risk_level_changed ? "Yes" : "No"}</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current vs Changed</CardTitle>
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
