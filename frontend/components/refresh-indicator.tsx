"use client";

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface RefreshIndicatorProps {
  isFetching: boolean;
  updatedAt?: number;
  label?: string;
}

export function RefreshIndicator({ isFetching, updatedAt, label = "Last update" }: RefreshIndicatorProps) {
  if (isFetching) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Updating
      </Badge>
    );
  }

  if (!updatedAt) {
    return <Badge variant="secondary">{label}: waiting</Badge>;
  }

  return <Badge variant="secondary">{label}: {new Date(updatedAt).toLocaleTimeString()}</Badge>;
}
