import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useDiagramStore } from "@/lib/diagram-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
          customFields: selectedNode.data.customFields || []
        }
      });
      setHasChanges(false);
    } else {
      setEditedNode(null);
    }
  }, [selectedNode]);

  if (!editedNode || !selectedNode) {
    return (
      <div className="w-[450px] p-4 border-l">
        <p className="text-muted-foreground">
          Select a node to configure its properties
        </p>
      </div>
    );
  }

  const handleChange = (field: string, value: string) => {
    setEditedNode(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          [field]: value,
        },
        style: field === "status" ? {
          ...prev.style,
          border: `2px solid ${getStatusColor(value)}`,
        } : prev.style,
      };
    });
    setHasChanges(true);
  };

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setEditedNode(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        data: {
          ...prev.data,
          customFields: prev.data.customFields.map((field: any) =>
            field.name === fieldName ? { ...field, value } : field
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

  return (
    <div className="w-[450px] p-4 border-l">
      <h2 className="text-lg font-semibold mb-4">Node Configuration</h2>

      <div className="space-y-4">
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
        </Tabs>

        {/* Save Button at the bottom */}
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