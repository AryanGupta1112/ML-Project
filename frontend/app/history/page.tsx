"use client";

import { RefreshCw } from "lucide-react";

import { HistoryTrendChart } from "@/components/history-trend-chart";
import { RefreshIndicator } from "@/components/refresh-indicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHistory } from "@/hooks/use-risk-api";
import { formatModelName, riskLevelColor } from "@/lib/utils";

export default function HistoryPage() {
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useHistory(100);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-danger">Could not load past results.</p>;
  }

  return (
    <div className="space-y-6">
      {data.items.length ? <HistoryTrendChart items={data.items} /> : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Past Risk Checks ({data.items.length})</CardTitle>
          <div className="flex items-center gap-2">
            <RefreshIndicator isFetching={isFetching} updatedAt={dataUpdatedAt} label="Last update" />
            <Button variant="outline" size="sm" onClick={() => void refetch()} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved results yet. Run a risk check first.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Model used</TableHead>
                  <TableHead>Chance</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</TableCell>
                    <TableCell>{formatModelName(item.model_name)}</TableCell>
                    <TableCell>{(item.probability * 100).toFixed(2)}%</TableCell>
                    <TableCell>{item.risk_score}</TableCell>
                    <TableCell>
                      <Badge className={riskLevelColor(item.risk_level)}>{item.risk_level}</Badge>
                    </TableCell>
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
