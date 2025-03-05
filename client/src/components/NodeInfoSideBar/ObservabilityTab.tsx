import React from "react";
import ObservabilityMetricsDisplay from "@/components/NodeInfoSideBar/ObservabilityMetricsDisplay";
import NodeLogs from "@/components/NodeInfoSideBar/NodeLogs";

export const ObservabilityTab = ({ editedNode }) => (
  <div className="space-y-4">
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-4">Live Metrics</h3>
      <ObservabilityMetricsDisplay metrics={editedNode.data.metrics} />
    </div>
    <div className="space-y-4">
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-4">Logs</h3>
        <NodeLogs logs={editedNode.data.logs || []} />
      </div>
    </div>
  </div>
);

export default ObservabilityTab;
