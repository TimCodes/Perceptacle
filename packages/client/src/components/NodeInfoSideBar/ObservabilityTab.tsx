import ObservabilityMetricsDisplay from "@/components/NodeInfoSideBar/ObservabilityMetricsDisplay";
import NodeLogs from "@/components/NodeInfoSideBar/NodeLogs";
import { SendMessageDialog } from "@/components/ui/SendMessageDialog";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface ObservabilityTabProps {
  editedNode: any;
}

export const ObservabilityTab = ({ editedNode }: ObservabilityTabProps) => {
  const [logs, setLogs] = useState(editedNode.data.logs || []);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  console.log('[ObservabilityTab] editedNode.data:', editedNode.data);

  // Extract namespace and serviceName from customFields if they exist there
  const namespaceField = editedNode.data.customFields?.find((f: any) => f.name === 'namespace');
  const serviceNameField = editedNode.data.customFields?.find((f: any) => f.name === 'serviceName');
  
  const namespace = editedNode.data.namespace || namespaceField?.value;
  const serviceName = editedNode.data.serviceName || serviceNameField?.value;

  const isServiceBusNode =
    editedNode.data.type?.includes('service-bus') ||
    editedNode.data.type === 'azure-service-bus';

  const isKubernetesService = editedNode.data.type === 'kubernetes-service' || 
    editedNode.data.type?.startsWith('k8s-') || 
    (namespace && serviceName);

  console.log('[ObservabilityTab] isKubernetesService check:', {
    type: editedNode.data.type,
    namespace,
    serviceName,
    namespaceField,
    serviceNameField,
    isKubernetesService
  });

  const resourceName = editedNode.data.resourceName || editedNode.data.label;

  // Fetch Kubernetes service logs
  const fetchKubernetesLogs = async () => {
    console.log('[ObservabilityTab] Checking if should fetch logs:', {
      isKubernetesService,
      namespace,
      serviceName,
      type: editedNode.data.type
    });

    if (!isKubernetesService || !namespace || !serviceName) {
      console.log('[ObservabilityTab] Not fetching logs - missing requirements');
      return;
    }

    const url = `/api/kubernetes/services/${encodeURIComponent(namespace)}/${encodeURIComponent(serviceName)}/logs?tailLines=100`;
    console.log('[ObservabilityTab] Fetching from URL:', url);

    setIsLoadingLogs(true);
    setLogError(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convert Kubernetes logs to the expected format
      const formattedLogs: any[] = [];
      
      if (data.logs) {
        Object.entries(data.logs).forEach(([podName, logContent]: [string, any]) => {
          if (typeof logContent === 'string' && !podName.startsWith('_')) {
            // Parse log lines
            const lines = logContent.split('\n').filter(line => line.trim());
            lines.forEach(line => {
              // Try to parse timestamp and level from log line
              const match = line.match(/^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}[^\s]*)\s+(INFO|WARN|ERROR|DEBUG)?\s*(.*)$/i);
              
              if (match) {
                formattedLogs.push({
                  timestamp: match[1],
                  level: match[2]?.toLowerCase() || 'info',
                  message: `[${podName}] ${match[3]}`,
                });
              } else {
                formattedLogs.push({
                  timestamp: new Date().toISOString(),
                  level: 'info',
                  message: `[${podName}] ${line}`,
                });
              }
            });
          }
        });
      }

      // If no logs were formatted, add a message
      if (formattedLogs.length === 0) {
        formattedLogs.push({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: data.metadata?.source === 'live' 
            ? 'No logs available from pods' 
            : 'Using mock data - set USE_MOCK_SERVICES=false for live logs',
        });
      }

      setLogs(formattedLogs);
    } catch (error: any) {
      console.error('Error fetching Kubernetes logs:', error);
      setLogError(error.message);
      setLogs([{
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `Failed to fetch logs: ${error.message}`,
      }]);
    } finally {
      setIsLoadingLogs(false);
    }
  };
    }
  };

  // Fetch logs on mount and when node changes
  useEffect(() => {
    console.log('[ObservabilityTab] useEffect triggered', {
      isKubernetesService,
      nodeId: editedNode.id,
      namespace,
      serviceName
    });

    if (isKubernetesService) {
      fetchKubernetesLogs();
    } else {
      setLogs(editedNode.data.logs || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedNode.id, namespace, serviceName, isKubernetesService]);

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Logs</h3>
            {isKubernetesService && (
              <Button
                size="sm"
                variant="outline"
                onClick={fetchKubernetesLogs}
                disabled={isLoadingLogs}
              >
                <RefreshCw className={`h-3 w-3 mr-2 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
          {logError && (
            <div className="text-sm text-destructive mb-2 p-2 border border-destructive rounded">
              {logError}
            </div>
          )}
          <NodeLogs logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default ObservabilityTab;
