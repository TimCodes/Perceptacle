import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { getLogIcon } from "@/utils/helpers";

export const Nodelogs = ({ logs }) => (
  <div className="mt-8 space-y-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-medium">Component Logs</h3>
      <Badge variant="secondary">{logs.length} entries</Badge>
    </div>

    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="space-y-2">
        {logs
          .slice()
          .reverse()
          .map((log, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3 p-2 rounded-md",
                log.level === "error"
                  ? "bg-destructive/10"
                  : log.level === "warning"
                    ? "bg-warning/10"
                    : "bg-primary/10",
              )}
            >
              {getLogIcon(log.level)}
              <div className="flex flex-col gap-0.5 flex-1">
                <p className="text-sm font-medium">{log.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
      </div>
    </ScrollArea>
  </div>
);
