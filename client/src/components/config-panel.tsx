import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Github, Activity, AlertCircle, Bug, Save } from "lucide-react";
import { useDiagramStore } from "@/lib/diagram-store";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function ConfigPanel() {
  const { selectedNode, updateSelectedNode } = useDiagramStore();
  const [editedNode, setEditedNode] = useState(selectedNode);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Reset edited node when selected node changes
  useEffect(() => {
    setEditedNode(selectedNode);
    setHasChanges(false);
  }, [selectedNode]);

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
    setEditedNode(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
      style: field === "status" ? {
        ...prev.style,
        border: `2px solid ${getStatusColor(value)}`,
      } : prev.style,
    }));
    setHasChanges(true);
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setEditedNode(prev => ({
      ...prev,
      data: {
        ...prev.data,
        customFields: prev.data.customFields.map((field: any) =>
          field.name === fieldName ? { ...field, value } : field
        ),
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSelectedNode(editedNode);
    setHasChanges(false);
    toast({
      title: "Changes saved",
      description: "Node configuration has been updated",
    });
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

  const renderCustomFields = (node: any) => {
    if (!node.data.customFields) return null;

    return (
      <div className="space-y-4">
        {node.data.customFields.map((field: any, index: number) => {
          switch (field.type) {
            case 'text':
            case 'url':
              return (
                <div key={index} className="space-y-2">
                  <Label>{field.name}</Label>
                  <Input
                    value={field.value || ''}
                    onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              );
            case 'textarea':
              return (
                <div key={index} className="space-y-2">
                  <Label>{field.name}</Label>
                  <Textarea
                    value={field.value || ''}
                    onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              );
            case 'number':
              return (
                <div key={index} className="space-y-2">
                  <Label>{field.name}</Label>
                  <Input
                    type="number"
                    value={field.value || ''}
                    onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              );
            case 'select':
              return (
                <div key={index} className="space-y-2">
                  <Label>{field.name}</Label>
                  <Select
                    value={field.value || ''}
                    onValueChange={(value) => handleCustomFieldChange(field.name, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const renderObservabilityMetrics = () => {
    const metrics = editedNode.data.metrics || {
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
    const logs = editedNode.data.logs || [];

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Node Configuration</h2>
        {hasChanges && (
          <Button onClick={handleSave} size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>

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

            {editedNode.data.customFields && editedNode.data.customFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Custom Fields</h3>
                <div className="space-y-4">
                  {editedNode.data.customFields.map((field: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <Label>{field.name}</Label>
                      {field.type === 'select' ? (
                        <Select
                          value={field.value || ''}
                          onValueChange={(value) => handleCustomFieldChange(field.name, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'textarea' ? (
                        <Textarea
                          value={field.value || ''}
                          onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <Input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={field.value || ''}
                          onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                    value={editedNode.data.githubUrl || ""}
                    onChange={(e) => handleChange("githubUrl", e.target.value)}
                    placeholder="https://github.com/user/repo"
                  />
                </div>
                {editedNode.data.githubUrl && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(editedNode.data.githubUrl, '_blank')}
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
                  {editedNode.data.issues?.length || 0}
                </Badge>
              </div>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {renderGitHubIssues(editedNode.data.issues)}
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label>Google Console Link</Label>
              <div className="flex space-x-2">
                <Input
                  value={editedNode.data.consoleUrl || ""}
                  onChange={(e) => handleChange("consoleUrl", e.target.value)}
                  placeholder="https://console.cloud.google.com/..."
                />
                {editedNode.data.consoleUrl && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(editedNode.data.consoleUrl, '_blank')}
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
              <Badge variant={editedNode.data.status === 'active' ? 'success' : 'destructive'}>
                {editedNode.data.status}
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