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
  Settings,
  GitBranch,
  BarChart,
  Activity,
  AlertCircle,
  Bug,
  Ticket,
} from "lucide-react";
import { Node } from "reactflow";
import { cn } from "@/lib/utils";

interface ConfigPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (node: Node) => void;
}

export default function ConfigPanel({
  selectedNode,
  onNodeUpdate,
}: ConfigPanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-[325px] p-4 border-l bg-background">
        <p className="text-muted-foreground">
          Select a node to configure its properties
        </p>
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    onNodeUpdate({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        [field]: value,
      },
    });
  };

  return (
    <div className="w-[325px] border-l bg-background">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <Tabs defaultValue="configuration">
            <TabsList className="grid w-full grid-cols-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="configuration">
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
                    <TabsTrigger value="cicd">
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
                    <TabsTrigger value="observability">
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
                    <TabsTrigger value="tickets">
                      <Ticket className="h-4 w-4" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tickets</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsList>

            <TabsContent value="configuration" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Label</Label>
                  <Input
                    value={selectedNode.data.label || ""}
                    onChange={(e) => handleChange("label", e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={selectedNode.data.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cicd" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Repository URL</Label>
                  <Input
                    value={selectedNode.data.githubUrl || ""}
                    onChange={(e) => handleChange("githubUrl", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="observability" className="mt-4">
              <div className="space-y-4">
                {selectedNode.data.metrics && (
                  <>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>CPU Usage</Label>
                        <Progress 
                          value={selectedNode.data.metrics.cpu} 
                          className={cn(
                            selectedNode.data.metrics.cpu > 80 
                              ? "text-destructive" 
                              : "text-primary"
                          )}
                        />
                        <p className="text-sm text-muted-foreground">
                          {selectedNode.data.metrics.cpu}%
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Memory Usage</Label>
                        <Progress 
                          value={selectedNode.data.metrics.memory}
                          className={cn(
                            selectedNode.data.metrics.memory > 80 
                              ? "text-destructive" 
                              : "text-primary"
                          )}
                        />
                        <p className="text-sm text-muted-foreground">
                          {selectedNode.data.metrics.memory}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>
                        Last Updated: {new Date(selectedNode.data.metrics.lastUpdated).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle
                        className={cn(
                          "h-4 w-4",
                          selectedNode.data.metrics.activeAlerts > 0 
                            ? "text-destructive" 
                            : "text-success"
                        )}
                      />
                      <span>Active Alerts: {selectedNode.data.metrics.activeAlerts}</span>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Tickets</h3>
                  <Badge variant="secondary">
                    {selectedNode.data.tickets?.length || 0} tickets
                  </Badge>
                </div>

                {selectedNode.data.tickets?.map((ticket: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge>{ticket.status}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {ticket.created}
                      </span>
                    </div>
                    <h4 className="font-medium">{ticket.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {ticket.description}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}