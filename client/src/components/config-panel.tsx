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
  Bug,
  Ticket,
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

const tabNames = {
  configuration: "Configuration",
  cicd: "CI/CD",
  observability: "Observability",
  tickets: "Tickets",
};

export default function ConfigPanel() {
  const { selectedNode, updateSelectedNode } = useDiagramStore();
  const [editedNode, setEditedNode] = useState(selectedNode);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentTab, setCurrentTab] = useState("configuration");
  const { toast } = useToast();

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
              state: "open",
            },
            {
              title: "Update dependencies to latest versions",
              url: "https://github.com/org/repo/issues/2",
              state: "closed",
            },
            {
              title: "Add error handling for API failures",
              url: "https://github.com/org/repo/issues/3",
              state: "open",
            },
          ],
          tickets: selectedNode.data.tickets || [
            {
              id: "TICKET-001",
              title: "Service degradation in production",
              status: "open",
              priority: "high",
              created: "2025-02-09T10:00:00Z",
              assignee: "John Doe",
              description:
                "Users reporting slow response times and occasional timeouts",
            },
            {
              id: "TICKET-002",
              title: "SSL Certificate expiring soon",
              status: "in-progress",
              priority: "medium",
              created: "2025-02-08T15:30:00Z",
              assignee: "Jane Smith",
              description:
                "SSL certificate needs to be renewed before March 1st",
            },
            {
              id: "TICKET-003",
              title: "Backup validation required",
              status: "closed",
              priority: "low",
              created: "2025-02-07T09:15:00Z",
              assignee: "Mike Johnson",
              description: "Regular backup validation check pending",
            },
          ],
        },
      });
      setHasChanges(false);
    } else {
      setEditedNode(null);
    }
  }, [selectedNode]);

  if (!editedNode) {
    return (
      <div className="w-[325px] p-4 border-l">
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
      <div className="space-y-6 h-90px">
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
    const logs = editedNode.data.logs || [];

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
  };

  const renderGitHubIssues = () => {
    const issues = editedNode.data.issues || [];

    return (
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">GitHub Issues</h3>
          <Badge variant="secondary">{issues.length} issues</Badge>
        </div>

        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-2">
            {issues.map((issue: any, index: number) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3 p-2 rounded-md",
                  issue.state === "open"
                    ? "bg-destructive/10"
                    : "bg-success/10",
                )}
              >
                <Bug
                  className={cn(
                    "h-4 w-4",
                    issue.state === "open"
                      ? "text-destructive"
                      : "text-success",
                  )}
                />
                <div className="flex flex-col gap-0.5 flex-1">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm font-medium text-left justify-start"
                    onClick={() => window.open(issue.url, "_blank")}
                  >
                    {issue.title}
                  </Button>
                  <Badge
                    variant={issue.state === "open" ? "destructive" : "success"}
                    className="w-fit"
                  >
                    {issue.state}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-warning";
      case "low":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "destructive";
      case "in-progress":
        return "warning";
      case "closed":
        return "success";
      default:
        return "secondary";
    }
  };

  const renderTickets = () => {
    const tickets = editedNode.data.tickets || [];

    if (!tickets || tickets.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No trouble tickets found
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {tickets.map((ticket: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg bg-card">
            <div className="flex items-start justify-between mb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ticket.id}</span>
                  <Badge variant={getStatusBadgeVariant(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold">{ticket.title}</h4>
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  getPriorityColor(ticket.priority),
                )}
              >
                {ticket.priority.toUpperCase()}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {ticket.description}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Assignee: {ticket.assignee}</span>
              <span>Created: {new Date(ticket.created).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-[375px] border-l bg-background overflow-hidden h-90px flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <h2 className="text-lg font-semibold mb-4">
          Node {tabNames[currentTab]}
        </h2>

        {/* <div className="space-y-4">
          <Tabs
            defaultValue="configuration"
            className="space-y-4"
            onValueChange={setCurrentTab}
          >
            <TabsList className="grid w-[345px] grid-cols-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="configuration" className="p-2">
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
                    <TabsTrigger value="cicd" className="p-2">
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
                    <TabsTrigger value="observability" className="p-2">
                      <BarChart className="h-4 w-4" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Observability</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="tickets" className="p-2">
                      <Ticket className="h-4 w-4" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tickets</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsList>

            <div className="mt-4">
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
                    <Select
                      value={editedNode.data.status || "active"}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={editedNode.data.description || ""}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
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
                                      field.type === "number"
                                        ? "number"
                                        : "text"
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
                      value={editedNode.data.repositoryUrl || ""}
                      onChange={(e) =>
                        handleChange("repositoryUrl", e.target.value)
                      }
                      placeholder="https://github.com/username/repo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Input
                      value={editedNode.data.branch || ""}
                      onChange={(e) => handleChange("branch", e.target.value)}
                      placeholder="main"
                    />
                  </div>

                  {renderGitHubIssues()}
                </div>
              </TabsContent>

              <TabsContent value="observability" className="space-y-4">
                <div className="space-y-4">
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-4">Live Metrics</h3>
                    {renderObservabilityMetrics()}
                  </div>

                  {renderComponentLogs()}
                </div>
              </TabsContent>

              <TabsContent value="tickets" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Trouble Tickets</h3>
                    <Badge variant="secondary">
                      {editedNode.data.tickets?.length || 0} tickets
                    </Badge>
                  </div>
                  {renderTickets()}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div> */}
      </ScrollArea>

      {hasChanges && (
        <div className="sticky bottom-0 p-4 bg-background border-t mt-4">
          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
