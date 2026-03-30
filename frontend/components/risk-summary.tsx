"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatModelName, riskLevelColor } from "@/lib/utils";
import type { PredictionResponse } from "@/types/api";

interface RiskSummaryProps {
  result: PredictionResponse;
}

export function RiskSummary({ result }: RiskSummaryProps) {
  const data = [{ name: "risk", value: result.risk_score, fill: result.risk_score >= 70 ? "#ef4444" : result.risk_score >= 40 ? "#f59e0b" : "#10b981" }];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Risk Result</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="65%" outerRadius="100%" data={data} startAngle={180} endAngle={0}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar dataKey="value" background cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="-mt-24 text-center">
            <p className="text-xs uppercase text-muted-foreground">Risk score</p>
            <p className="text-4xl font-semibold">{result.risk_score}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className={riskLevelColor(result.risk_level)}>{result.risk_level}</Badge>
            <span className="text-sm text-muted-foreground">Model used: {formatModelName(result.model_name)}</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Chance of heart risk</p>
            <p className="text-2xl font-semibold">{(result.probability * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Simple result</p>
            <p className="text-lg font-medium">{result.prediction === 1 ? "Higher heart risk detected" : "No strong risk detected"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
