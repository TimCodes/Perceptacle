import { useState, useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Save, Maximize2, Minimize2 } from "lucide-react";
import { useDiagramStore } from "@/utils/diagram-store";
import { useToast } from "@/hooks/use-toast";
import { TabNavigation } from "./TabNavigation";
import { ConfigurationTab } from "./ConfigurationTab";
import CICDTab from "./CICDTab";
import ObservabilityTab from "./ObservabilityTab";
import { AIChatTab } from "@/components/NodeInfoSideBar/AIChatTab";
import EmptyPanel from "@/components/NodeInfoSideBar/EmptyPanel";
import { getStatusColor } from "@/utils/helpers";

const tabNames = {
  configuration: "Configuration",
  cicd: "CI/CD",
  observability: "Observability",
  aichat: "AI Chat",
} as const;

type TabName = keyof typeof tabNames;

interface NodeInfoSideBarProps {
  isExpanded?: boolean;
  toggleExpanded?: () => void;
}

export default function NodeInfoSideBar({
  isExpanded = false,
  toggleExpanded,
}: NodeInfoSideBarProps) {
  const { selectedNode, updateSelectedNode } = useDiagramStore();
  const [editedNode, setEditedNode] = useState(selectedNode);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabName>("configuration");
  const { toast } = useToast();
  const prevSelectedNodeIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only update editedNode if the selected node ID actually changed
    // This prevents infinite loops when the node object reference changes but the ID is the same
    if (selectedNode && selectedNode.id !== prevSelectedNodeIdRef.current) {
      prevSelectedNodeIdRef.current = selectedNode.id;
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
    } else if (!selectedNode) {
      prevSelectedNodeIdRef.current = null;
      setEditedNode(null);
    }
  }, [selectedNode]);

  if (!editedNode) {
    return <EmptyPanel />;
  }

  const handleChange = (field, value) => {
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

  const handleCustomFieldChange = (fieldName, value) => {
    setEditedNode((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          customFields: prev.data.customFields.map((field) =>
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
        description: "Application node configuration has been updated",
      });
    }
  };

  return (
    <div className="w-full border-l bg-background overflow-hidden flex flex-col h-full">
      <Tabs
        defaultValue="configuration"
        className="flex flex-col h-full"
        onValueChange={(value) => setCurrentTab(value as TabName)}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            {toggleExpanded && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpanded}
                className="h-8 w-8"
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
            <h2 className="text-lg font-semibold">
              Application Node {tabNames[currentTab]}
            </h2>
          </div>
          <TabNavigation />
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="space-y-4">
              <TabsContent value="configuration" className="space-y-4">
                <ConfigurationTab
                  editedNode={editedNode}
                  handleChange={handleChange}
                  handleCustomFieldChange={handleCustomFieldChange}
                />
              </TabsContent>

              <TabsContent value="cicd" className="space-y-4">
                <CICDTab editedNode={editedNode} handleChange={handleChange} />
              </TabsContent>

              <TabsContent value="observability" className="space-y-4">
                <ObservabilityTab editedNode={editedNode} />
              </TabsContent>

              <TabsContent value="aichat" className="space-y-4">
                <AIChatTab editedNode={editedNode} />
              </TabsContent>
            </div>
          </div>
        </ScrollArea>
      </Tabs>

      {hasChanges && (
        <div className="p-4 bg-background border-t">
          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
