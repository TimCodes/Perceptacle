import React from "react";
import { AlertCircle, Activity, AlertTriangle, Info } from "lucide-react";
import ObservabilityMetricsDisplay from "@/components/ObservabilityMetricsDisplay";
import NodeLogs from "@/components/NodeLogs";

export const ObservabilityTab = ({ editedNode }) => (
  <div className="space-y-4">
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-4">Live Metrics</h3>
      <ObservabilityMetricsDisplay metrics={editedNode.data.metrics} />
    </div>

    <NodeLogs logs={editedNode.data.logs || []} />
  </div>
);

export default ObservabilityTab;
