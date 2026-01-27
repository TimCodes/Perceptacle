
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKubernetesOptions } from "@/hooks/useKubernetesOptions";
import { K8sCombobox } from "@/components/K8sCombobox";

interface CustomField {
  name: string;
  type: string;
  value?: string | number;
  placeholder?: string;
  options?: string[];
  source?: 'namespaces' | 'pods' | 'services' | 'deployments';
  dependsOn?: string;
}

interface CustomFieldsSectionProps {
  customFields: CustomField[];
  handleCustomFieldChange: (name: string, value: string) => void;
  namespace?: string; // For fetching Kubernetes options
}

export const CustomFieldsSection = ({
  customFields,
  handleCustomFieldChange,
  namespace,
}: CustomFieldsSectionProps) => {
  // Check if we have any k8s-select fields
  const hasK8sFields = customFields.some((f) => f.type === 'k8s-select');
  
  // Fetch Kubernetes options if needed
  const { options: k8sOptions, loading: k8sLoading } = useKubernetesOptions(
    hasK8sFields ? namespace : undefined
  );

  // Helper to get options for k8s-select fields
  const getOptionsForSource = (source?: string): string[] => {
    if (!source) return [];
    switch (source) {
      case 'namespaces':
        return k8sOptions.namespaces;
      case 'pods':
        return k8sOptions.pods.map(p => p.name);
      case 'services':
        return k8sOptions.services.map(s => s.name);
      case 'deployments':
        return k8sOptions.deployments.map(d => d.name);
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Custom Fields</h3>
      <div className="space-y-4">
        {customFields.map((field, index) => (
          <div key={index} className="space-y-2">
            <Label>{field.name}</Label>
            {field.type === "select" ? (
              <Select
                value={field.value?.toString() || ""}
                onValueChange={(value) =>
                  handleCustomFieldChange(field.name, value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'k8s-select' ? (
              <K8sCombobox
                value={field.value?.toString() || ""}
                onChange={(value) => handleCustomFieldChange(field.name, value)}
                options={getOptionsForSource(field.source)}
                placeholder={field.placeholder || `Select ${field.name}`}
                loading={k8sLoading}
              />
            ) : (
              <Input
                type={field.type === "number" ? "number" : "text"}
                value={field.value?.toString() || ""}
                onChange={(e) =>
                  handleCustomFieldChange(field.name, e.target.value)
                }
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomFieldsSection;
