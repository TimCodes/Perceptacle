import React from "react";
import { cn } from "@/utils/cn";
import { Activity, AlertCircle } from "lucide-react";

import StatCard from "@/components/StatCard/StatCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const ObservabilityMetricsDisplay = ({ metrics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4">
      <Carousel className="m-7">
        <CarouselContent>
          <CarouselItem className="basis-1/2">
            <StatCard
              label="CPU Usage"
              value={`${metrics.cpu}%`}
              progressValue={metrics.cpu}
            />
          </CarouselItem>
          <CarouselItem className="basis-1/2">
            <StatCard
              label="Memory Usage"
              value={`${metrics.memory}%`}
              progressValue={metrics.memory}
            />
          </CarouselItem>
          <CarouselItem className="basis-1/2">
            <StatCard
              label="Disk Usage"
              value={`${metrics.disk}%`}
              progressValue={metrics.disk}
            />
          </CarouselItem>
          <CarouselItem className="basis-1/2">
            <StatCard
              label="Network Usage"
              value={`${metrics.network}%`}
              progressValue={metrics.network}
            />
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
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
