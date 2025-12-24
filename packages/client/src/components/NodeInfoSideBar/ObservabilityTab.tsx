import ObservabilityMetricsDisplay from "@/components/NodeInfoSideBar/ObservabilityMetricsDisplay";
import NodeLogs from "@/components/NodeInfoSideBar/NodeLogs";
import { SendMessageDialog } from "@/components/ui/SendMessageDialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface ObservabilityTabProps {
  editedNode: any;
}

export const ObservabilityTab = ({ editedNode }: ObservabilityTabProps) => {
  const isServiceBusNode =
    editedNode.data.type?.includes('service-bus') ||
    editedNode.data.type === 'azure-service-bus';

  const resourceName = editedNode.data.resourceName || editedNode.data.label;

  return (
    <div className="space-y-4">
      {isServiceBusNode && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-4">Actions</h3>
          <div className="p-4 border rounded-md bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm">Send Message to {resourceName}</span>
              <SendMessageDialog queueOrTopicName={resourceName} />
            </div>
          </div>
        </div>
      )}

      {/* Render Custom Defined Actions */}
      {editedNode.data.customActions && editedNode.data.customActions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-4">Custom Actions</h3>
          <div className="space-y-2">
            {editedNode.data.customActions.map((action: any, index: number) => (
              <div key={index} className="p-3 border rounded-md bg-card flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{action.name}</span>
                  <span className="text-xs text-muted-foreground">{action.method} {action.url}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/actions/http/execute', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          url: action.url,
                          method: action.method,
                          body: typeof action.body === 'string' ? JSON.parse(action.body || '{}') : action.body
                        })
                      });

                      if (response.ok) {
                        // Simple success feedback could be added here (e.g. toast)
                        console.log('Action executed successfully');
                      } else {
                        console.error('Action failed');
                      }
                    } catch (e) {
                      console.error('Error executing action', e);
                    }
                  }}
                >
                  <Play className="h-3 w-3 mr-2" />
                  Run
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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
};

export default ObservabilityTab;
