"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFeatureLabel } from "@/lib/patient-config";
import type { FeatureContribution } from "@/types/api";

interface TopFactorsChartProps {
  factors: FeatureContribution[];
}

export function TopFactorsChart({ factors }: TopFactorsChartProps) {
  const chartData = factors.map((factor) => ({
    feature: getFeatureLabel(factor.feature),
    impact: Number(factor.impact_score.toFixed(4)),
    direction: factor.direction
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Main Reasons For This Result</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis type="number" />
            <YAxis dataKey="feature" type="category" width={90} />
            <Tooltip formatter={(value: number) => [`${value}`, "How strongly it affected the result"]} />
            <Bar dataKey="impact" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
