"use client";

import { Activity, AlertTriangle } from "lucide-react";

import { useHealthStatus } from "@/hooks/use-risk-api";
import { Badge } from "@/components/ui/badge";

export function HealthIndicator() {
  const { data, isLoading, isError, isFetching } = useHealthStatus();

  if (isLoading) {
    return <Badge variant="secondary">Server: checking...</Badge>;
  }

  if (isError || !data) {
    return (
      <Badge variant="danger" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Server is offline
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="gap-1">
      <Activity className="h-3 w-3" />
      {isFetching ? "Server updating" : "Server is healthy"}
    </Badge>
  );
}
