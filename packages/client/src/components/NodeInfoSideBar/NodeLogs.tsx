import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

const getLogIcon = (level) => {
  switch (level) {
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    default:
      return <Info className="h-4 w-4 text-primary" />;
  }
};

export const Nodelogs = ({ logs }) => (
  <div className="w-full">
    <ScrollArea className="h-[250px] rounded-md border p-4">
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

export default Nodelogs;
