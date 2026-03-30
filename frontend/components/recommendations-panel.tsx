import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationsPanelProps {
  recommendations: string[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Next Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((recommendation) => (
          <div key={recommendation} className="flex gap-3 rounded-lg border border-border/60 bg-background/60 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
            <p className="text-sm leading-relaxed">{recommendation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
