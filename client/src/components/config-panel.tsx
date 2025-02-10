import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Github, Activity, AlertCircle, Bug } from "lucide-react";
import { useDiagramStore } from "@/lib/diagram-store";

const renderGitHubIssues = (issues = []) => {
  if (!issues || issues.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No issues found
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue, index) => (
        <div key={index} className="flex items-start space-x-2 p-2 bg-secondary/20 rounded-md">
          <Bug className="h-4 w-4 mt-0.5" />
          <div className="space-y-1">
            <a 
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline text-blue-600"
            >
              {issue.title}
            </a>
            <Badge variant={issue.state === 'open' ? 'destructive' : 'success'}>
              {issue.state}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ConfigPanel() {
  const { selectedNode, updateSelectedNode } = useDiagramStore();

  if (!selectedNode) {
    return (
      <div className="w-[450px] p-4 border-l">
        <p className="text-muted-foreground">
          Select a node to configure its properties
        </p>
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        [field]: value,
      },
    };

    if (field === "status") {
      updatedNode.style = {
        ...selectedNode.style,
        border: `2px solid ${getStatusColor(value)}`,
      };
    }

    updateSelectedNode(updatedNode);
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

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  const renderObservabilityMetrics = () => {
    const metrics = selectedNode.data.metrics || {
      cpu: 45,
      memory: 60,
      disk: 30,
      network: 25,
      lastUpdated: new Date().toISOString(),
      activeAlerts: 2,
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "CPU Usage", value: metrics.cpu },
            { label: "Memory Usage", value: metrics.memory },
            { label: "Disk Usage", value: metrics.disk },
            { label: "Network Usage", value: metrics.network },
          ].map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}%</div>
                <Progress 
                  value={metric.value} 
                  className="mt-2" 
                  variant={metric.value > 80 ? "destructive" : "default"}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Activity className="h-4 w-4" />
          <span>Last Updated: {new Date(metrics.lastUpdated).toLocaleString()}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <AlertCircle 
            className={`h-4 w-4 ${metrics.activeAlerts > 0 ? 'text-destructive' : 'text-success'}`} 
          />
          <span>Active Alerts: {metrics.activeAlerts}</span>
        </div>
      </div>
    );
  };

  const renderComponentLogs = () => {
    const logs = selectedNode.data.logs || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Component Logs</h3>
          <Badge variant="secondary">{logs.length} entries</Badge>
        </div>

        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-2">
            {logs.slice().reverse().map((log: any, index: number) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-2 rounded-md
                  ${log.level === 'error' 
                    ? 'bg-destructive/10' 
                    : log.level === 'warning' 
                      ? 'bg-warning/10' 
                      : 'bg-primary/10'
                  }`}
              >
                {getLogIcon(log.level)}
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {log.message}
                  </p>
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

  return (
    <div className="w-[450px] p-4 border-l">
      <h2 className="text-lg font-semibold mb-4">Node Configuration</h2>

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="cicd">CI/CD</TabsTrigger>
          <TabsTrigger value="observability">Observability</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={selectedNode.data.label || ""}
                onChange={(e) => handleChange("label", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Enter a name for this component
              </p>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full p-2 rounded-md border"
                value={selectedNode.data.status || "active"}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="text-sm text-muted-foreground">
                Current status of the component
              </p>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={selectedNode.data.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Brief description of the component's purpose
              </p>
            </div>

            <div className="space-y-2">
              <Label>Instance Type</Label>
              <Input
                value={selectedNode.data.instanceType || ""}
                onChange={(e) => handleChange("instanceType", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The type of GCP instance (e.g., n1-standard-1)
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cicd" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>GitHub Repository</Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Github className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={selectedNode.data.githubUrl || ""}
                    onChange={(e) => handleChange("githubUrl", e.target.value)}
                    placeholder="https://github.com/user/repo"
                  />
                </div>
                {selectedNode.data.githubUrl && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(selectedNode.data.githubUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">GitHub Issues</h3>
                <Badge variant="destructive">
                  {selectedNode.data.issues?.length || 0}
                </Badge>
              </div>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {renderGitHubIssues(selectedNode.data.issues)}
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label>Google Console Link</Label>
              <div className="flex space-x-2">
                <Input
                  value={selectedNode.data.consoleUrl || ""}
                  onChange={(e) => handleChange("consoleUrl", e.target.value)}
                  placeholder="https://console.cloud.google.com/..."
                />
                {selectedNode.data.consoleUrl && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(selectedNode.data.consoleUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="observability" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Metrics</h3>
              <Badge variant={selectedNode.data.status === 'active' ? 'success' : 'destructive'}>
                {selectedNode.data.status}
              </Badge>
            </div>
            {renderObservabilityMetrics()}
            {renderComponentLogs()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}