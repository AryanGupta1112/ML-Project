"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistoryItem } from "@/types/api";

interface HistoryTrendChartProps {
  items: HistoryItem[];
}

export function HistoryTrendChart({ items }: HistoryTrendChartProps) {
  const chartData = [...items]
    .reverse()
    .slice(-30)
    .map((item) => ({
      timestamp: new Date(item.timestamp).toLocaleDateString(),
      risk_score: item.risk_score,
      probability: Number((item.probability * 100).toFixed(2))
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Trend (Last 30 Checks)</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="timestamp" minTickGap={22} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="risk_score" name="Risk score" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="probability" name="Chance (%)" stroke="#14b8a6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
