import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Node } from 'reactflow';
import { useKubernetesOptions } from '@/hooks/useKubernetesOptions';
import { K8sCombobox } from './K8sCombobox';
import { NodeTypeHelper } from '@/utils/nodeTypeHelpers';


interface NodeConfigDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialNode: Node | null;
}

export function NodeConfigDialog({
    isOpen,
    onClose,
    onSave,
    initialNode,
}: NodeConfigDialogProps) {
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [customFields, setCustomFields] = useState<any[]>([]);
    // Store other specific fields dynamically
    const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({});

    // Get current namespace for K8s options fetching
    const namespaceField = customFields.find((f: any) => f.name === 'namespace');
    const currentNamespace = namespaceField?.value;

    // Fetch Kubernetes options - only if we have k8s fields
    const hasK8sFields = customFields.some((f: any) => f.type === 'k8s-select');
    const { options: k8sOptions, loading: k8sLoading } = useKubernetesOptions(
        // Only pass namespace if we are looking for dependent resources
        // But we always want to fetch namespaces list, so effectively we always fetch if it's a k8s node
        hasK8sFields ? currentNamespace : undefined
    );

    useEffect(() => {
        if (initialNode) {
            setLabel(initialNode.data.label || '');
            setDescription(initialNode.data.description || '');
            setCustomFields(initialNode.data.customFields || []);

            // Extract other fields that are not standard
            const { label, description, customFields, type, status, instanceType, githubUrl, consoleUrl, metrics, logs, ...others } = initialNode.data;
            setDynamicFields(others);
        }
    }, [initialNode]);

    const handleCustomFieldChange = (index: number, value: string) => {
        const newFields = [...customFields];
        newFields[index] = { ...newFields[index], value };
        setCustomFields(newFields);

        // If namespace changed, it will trigger re-fetch via the currentNamespace variable dependency in the hook
    };

    const handleDynamicFieldChange = (key: string, value: string) => {
        setDynamicFields(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        if (!initialNode) return;

        const updatedData = {
            ...initialNode.data,
            label,
            description,
            customFields,
            ...dynamicFields
        };

        onSave(updatedData);
    };

    // Helper to get options for a specific source
    const getOptionsForSource = (source: string): string[] => {
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

    if (!initialNode) return null;

    // Convert type to display string
    const displayType = typeof initialNode.data.type === 'string' 
        ? initialNode.data.type 
        : NodeTypeHelper.getDisplayName(initialNode.data.type);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configure {displayType}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Label</label>
                        <Input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Application Node Label"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            rows={3}
                        />
                    </div>

                    {/* Custom Fields from Component Definition */}
                    {customFields.length > 0 && (
                        <div className="space-y-3 border-t pt-3">
                            <h4 className="text-sm font-semibold text-muted-foreground">Configuration</h4>
                            {customFields.map((field: any, index: number) => (
                                <div key={index} className="space-y-2">
                                    <label className="text-sm font-medium">{field.name}</label>
                                    {field.type === 'select' ? (
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={field.value}
                                            onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                                        >
                                            {field.options?.map((opt: string) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'k8s-select' ? (
                                        <K8sCombobox
                                            value={field.value}
                                            onChange={(value) => handleCustomFieldChange(index, value)}
                                            options={getOptionsForSource(field.source)}
                                            placeholder={field.placeholder || `Select ${field.name}`}
                                            loading={k8sLoading}
                                        />
                                    ) : (
                                        <Input
                                            type={field.type || 'text'}
                                            value={field.value}
                                            onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                                            placeholder={field.placeholder || ''}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Dynamic Fields (Cloud provider specific) */}
                    {Object.keys(dynamicFields).length > 0 && (
                        <div className="space-y-3 border-t pt-3">
                            <h4 className="text-sm font-semibold text-muted-foreground">Provider Settings</h4>
                            {Object.entries(dynamicFields).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                    <Input
                                        value={value as string}
                                        onChange={(e) => handleDynamicFieldChange(key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Node
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
