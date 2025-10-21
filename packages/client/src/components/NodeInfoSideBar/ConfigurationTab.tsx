import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
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
  handleChange: (field: string, value: string) => void;
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
    </div>
  );
};

export default ConfigurationTab;
