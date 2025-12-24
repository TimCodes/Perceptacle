import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Info, Plus, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomFieldsSection from "@/components/CustomFieldsSection";
import { getConfigFieldsForNodeType, ConfigField } from "@/utils/nodeConfigFields";

interface ConfigurationTabProps {
  editedNode: any;
  handleChange: (field: string, value: any) => void;
  handleCustomFieldChange: (fieldName: string, value: string) => void;
}

export const ConfigurationTab = ({
  editedNode,
  handleChange,
  handleCustomFieldChange,
}: ConfigurationTabProps) => {
  const configFields = getConfigFieldsForNodeType(editedNode.data.type || '');
  const isAzureNode = editedNode.data.type?.startsWith('azure-');
  const isKubernetesNode = editedNode.data.type?.startsWith('k8s-');
  const isKafkaNode = editedNode.data.type?.startsWith('kafka-');

  // Check if it's a GCP node by checking against known GCP component types
  const gcpComponentTypes = [
    'compute-engine', 'cloud-storage', 'cloud-sql', 'kubernetes-engine',
    'cloud-functions', 'cloud-run', 'load-balancer', 'cloud-armor',
    'app-engine', 'vpc-network'
  ];
  const isGCPNode = gcpComponentTypes.includes(editedNode.data.type || '');

  const renderField = (field: ConfigField) => {
    const value = editedNode.data[field.name] || "";

    return (
      <div key={field.name} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </Label>
          {field.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">{field.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {field.type === 'select' && field.options ? (
          <Select
            value={value}
            onValueChange={(newValue) => handleChange(field.name, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === 'textarea' ? (
          <Textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            type={field.type === 'url' ? 'url' : 'text'}
          />
        )}
      </div>
    );
  };

  const getBadgeInfo = () => {
    if (isAzureNode) {
      return {
        text: 'Azure Resource',
        className: 'bg-blue-100 text-blue-800',
        description: 'Additional fields for Azure metrics and logs'
      };
    }
    if (isKubernetesNode) {
      return {
        text: 'Kubernetes Resource',
        className: 'bg-green-100 text-green-800',
        description: 'Additional fields for Kubernetes metrics and logs'
      };
    }
    if (isKafkaNode) {
      return {
        text: 'Kafka Resource',
        className: 'bg-orange-100 text-orange-800',
        description: 'Additional fields for Kafka monitoring'
      };
    }
    if (isGCPNode) {
      return {
        text: 'Google Cloud Resource',
        className: 'bg-purple-100 text-purple-800',
        description: 'Additional fields for GCP monitoring and logging'
      };
    }
    return null;
  };

  const badgeInfo = getBadgeInfo();

  return (
    <div className="space-y-4">
      {badgeInfo && (
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className={badgeInfo.className}>
            {badgeInfo.text}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {badgeInfo.description}
          </span>
        </div>
      )}

      {configFields.map(renderField)}

      {editedNode.data.customFields &&
        editedNode.data.customFields.length > 0 && (
          <CustomFieldsSection
            customFields={editedNode.data.customFields}
            handleCustomFieldChange={handleCustomFieldChange}
          />
        )}

      {/* Custom Actions Section */}
      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-4">Custom Actions</h3>
        <div className="space-y-4">
          {(editedNode.data.customActions || []).map((action: any, index: number) => (
            <div key={index} className="p-3 border rounded-md space-y-3 bg-muted/10 relative group">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  const newActions = [...(editedNode.data.customActions || [])];
                  newActions.splice(index, 1);
                  handleChange('customActions', newActions);
                }}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Action Name</Label>
                  <Input
                    value={action.name}
                    onChange={(e) => {
                      const newActions = [...(editedNode.data.customActions || [])];
                      newActions[index].name = e.target.value;
                      handleChange('customActions', newActions);
                    }}
                    placeholder="e.g. Trigger Backup"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Method</Label>
                  <Select
                    value={action.method}
                    onValueChange={(value) => {
                      const newActions = [...(editedNode.data.customActions || [])];
                      newActions[index].method = value;
                      handleChange('customActions', newActions);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">URL</Label>
                <Input
                  value={action.url}
                  onChange={(e) => {
                    const newActions = [...(editedNode.data.customActions || [])];
                    newActions[index].url = e.target.value;
                    handleChange('customActions', newActions);
                  }}
                  placeholder="https://api.example.com/webhook"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Body (JSON)</Label>
                <Textarea
                  value={typeof action.body === 'string' ? action.body : JSON.stringify(action.body, null, 2)}
                  onChange={(e) => {
                    const newActions = [...(editedNode.data.customActions || [])];
                    // Keeps as string in UI, parsed on execution
                    newActions[index].body = e.target.value;
                    handleChange('customActions', newActions);
                  }}
                  placeholder='{"key": "value"}'
                  className="min-h-[60px] text-xs font-mono h-auto"
                />
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-dashed"
            onClick={() => {
              const newActions = [...(editedNode.data.customActions || []), {
                name: 'New Action',
                method: 'POST',
                url: '',
                headers: {},
                body: '{}'
              }];
              handleChange('customActions', newActions);
            }}
          >
            <Plus className="h-3 w-3" />
            Add Action
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationTab;
