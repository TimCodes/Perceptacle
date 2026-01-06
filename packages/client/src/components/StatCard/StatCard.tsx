import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  progressValue: number;
}

export const StatCard = ({ label, value, progressValue }: StatCardProps) => (
  <div className="p-4 rounded-lg border bg-card">
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <Progress
        value={progressValue}
        className={cn(
          "h-2",
          progressValue > 80 ? "text-destructive" : "text-primary",
        )}
      />
    </div>
  </div>
);

export default StatCard;
