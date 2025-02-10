import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  Save,
  Settings,
  GitBranch,
  BarChart,
  Activity,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug
} from "lucide-react";
import { useDiagramStore } from "@/lib/diagram-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ConfigPanel() {
  const { selectedNode, updateSelectedNode } = useDiagramStore();
  const [editedNode, setEditedNode] = useState(selectedNode);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Reset edited node when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setEditedNode({
        ...selectedNode,
        data: {
          ...selectedNode.data,
          customFields: selectedNode.data.customFields || [],
          metrics: selectedNode.data.metrics || {
            cpu: 45,
            memory: 60,
            disk: 30,
            network: 25,
            lastUpdated: new Date().toISOString(),
            activeAlerts: 2,
          },
          issues: selectedNode.data.issues || [
            {
              title: "Memory leak in production environment",
              url: "https://github.com/org/repo/issues/1",
              state: "open"
            },
            {
              title: "Update dependencies to latest versions",
              url: "https://github.com/org/repo/issues/2",
              state: "closed"
            },
            {
              title: "Add error handling for API failures",
              url: "https://github.com/org/repo/issues/3",
              state: "open"
            }
          ]
        },
      });
      setHasChanges(false);
    } else {
      setEditedNode(null);
    }
  }, [selectedNode]);

  if (!editedNode || !selectedNode) {
    return (
      <div className="w-[585px] p-4 border-l">
        <p className="text-muted-foreground">
          Select a node to configure its properties
        </p>
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    setEditedNode((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          [field]: value,
        },
        style:
          field === "status"
            ? {
                ...prev.style,
                border: `2px solid ${getStatusColor(value)}`,
              }
            : prev.style,
      };
    });
    setHasChanges(true);
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setEditedNode((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          customFields: prev.data.customFields.map((field: any) =>
            field.name === fieldName ? { ...field, value } : field,
          ),
        },
      };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (editedNode) {
      updateSelectedNode(editedNode);
      setHasChanges(false);
      toast({
        title: "Changes saved",
        description: "Node configuration has been updated",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "hsl(var(--success))";
      case "warning":
        return "hsl(var(--warning))";
      case "error":
        return "hsl(var(--destructive))";
      case "inactive":
        return "hsl(var(--muted))";
      default:
        return "hsl(var(--border))";
    }
  };

  const renderObservabilityMetrics = () => {
    const metrics = editedNode.data.metrics;

    const StatCard = ({
      label,
      value,
      progressValue,
    }: {
      label: string;
      value: string;
      progressValue: number;
    }) => (
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

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
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
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const renderComponentLogs = () => {
    const logs = editedNode?.data.logs || [];

    return (
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
              .map((log: any, index: number) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 p-2 rounded-md",
                    log.level === "error"
                      ? "bg-destructive/10"
                      : log.level === "warning"
                      ? "bg-warning/10"
                      : "bg-primary/10"
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
  };

  const renderGitHubIssues = () => {
    const issues = editedNode?.data.issues || [];

    if (!issues || issues.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No issues found yet
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {issues.map((issue, index) => (
          <div
            key={index}
            className="p-2 bg-muted rounded-md"
          >
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              <div className="flex flex-col gap-1">
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm text-left"
                  onClick={() => window.open(issue.url, '_blank')}
                >
                  {issue.title}
                </Button>
                <Badge
                  variant={issue.state === "open" ? "destructive" : "success"}
                >
                  {issue.state}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="w-[585px] p-4 border-l">
      <h2 className="text-lg font-semibold mb-4">Node Configuration</h2>

      <div className="space-y-4">
        <Tabs defaultValue="configuration" className="space-y-4 w-[50%]">
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="configuration" className="px-0 w-[40%]">
                    <Settings className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configuration</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="cicd" className="px-0 w-[40%]">
                    <GitBranch className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>CI/CD</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="observability" className="px-0 w-[40%]">
                    <BarChart className="h-4 w-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Observability</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsList>

          <TabsContent value="configuration" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={editedNode.data.label || ""}
                  onChange={(e) => handleChange("label", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="w-full p-2 rounded-md border"
                  value={editedNode.data.status || "active"}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editedNode.data.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              {editedNode.data.customFields &&
                editedNode.data.customFields.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Custom Fields</h3>
                    <div className="space-y-4">
                      {editedNode.data.customFields.map(
                        (field: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <Label>{field.name}</Label>
                            {field.type === "select" ? (
                              <Select
                                value={field.value || ""}
                                onValueChange={(value) =>
                                  handleCustomFieldChange(field.name, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={field.placeholder}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((option: string) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type={
                                  field.type === "number" ? "number" : "text"
                                }
                                value={field.value || ""}
                                onChange={(e) =>
                                  handleCustomFieldChange(
                                    field.name,
                                    e.target.value,
                                  )
                                }
                                placeholder={field.placeholder}
                              />
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          </TabsContent>

          <TabsContent value="cicd" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Repository URL</Label>
                <Input
                  value={editedNode?.data.repositoryUrl || ""}
                  onChange={(e) =>
                    handleChange("repositoryUrl", e.target.value)
                  }
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="space-y-2">
                <Label>Branch</Label>
                <Input
                  value={editedNode?.data.branch || ""}
                  onChange={(e) => handleChange("branch", e.target.value)}
                  placeholder="main"
                />
              </div>

              <div className="space-y-2">
                <Label>Build Command</Label>
                <Input
                  value={editedNode?.data.buildCommand || ""}
                  onChange={(e) => handleChange("buildCommand", e.target.value)}
                  placeholder="npm run build"
                />
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-4">GitHub Issues</h3>
                {renderGitHubIssues()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="observability" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Monitoring URL</Label>
                <Input
                  value={editedNode?.data.monitoringUrl || ""}
                  onChange={(e) =>
                    handleChange("monitoringUrl", e.target.value)
                  }
                  placeholder="https://monitoring.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Logging System</Label>
                <Select
                  value={editedNode?.data.loggingSystem || ""}
                  onValueChange={(value) =>
                    handleChange("loggingSystem", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select logging system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stackdriver">
                      Google Cloud Logging
                    </SelectItem>
                    <SelectItem value="cloudwatch">AWS CloudWatch</SelectItem>
                    <SelectItem value="elastic">Elastic Stack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Metrics Endpoint</Label>
                <Input
                  value={editedNode?.data.metricsEndpoint || ""}
                  onChange={(e) =>
                    handleChange("metricsEndpoint", e.target.value)
                  }
                  placeholder="/metrics"
                />
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-4">Live Metrics</h3>
                {renderObservabilityMetrics()}
              </div>

              {renderComponentLogs()}
            </div>
          </TabsContent>
        </Tabs>

        {hasChanges && (
          <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t mt-4">
            <Button onClick={handleSave} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}