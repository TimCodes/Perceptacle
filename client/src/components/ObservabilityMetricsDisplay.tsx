import React from "react";
import { cn } from "@/utils/cn";
import { Activity, AlertCircle } from "lucide-react";

import StatCard from "@/components/StatCard";

export const ObservabilityMetricsDisplay = ({ metrics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4">
      <StatCard
        label="CPU Usage"
        value={`${metrics.cpu}%`}
        progressValue={metrics.cpu}
      />
      <StatCard
        label="Memory Usage"
        value={`${metrics.memory}%`}
        progressValue={metrics.memory}
      />
      <StatCard
        label="Disk Usage"
        value={`${metrics.disk}%`}
        progressValue={metrics.disk}
      />
      <StatCard
        label="Network Usage"
        value={`${metrics.network}%`}
        progressValue={metrics.network}
      />
    </div>

    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="h-4 w-4" />
        <span>
          Last Updated: {new Date(metrics.lastUpdated).toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <AlertCircle
          className={cn(
            "h-4 w-4",
            metrics.activeAlerts > 0 ? "text-destructive" : "text-success",
          )}
        />
        <span>Active Alerts: {metrics.activeAlerts}</span>
      </div>
    </div>
  </div>
);

export default ObservabilityMetricsDisplay;
