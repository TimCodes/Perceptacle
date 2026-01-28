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
    // Store other specific fields dynamically
    const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({});

    // Get current namespace for K8s options fetching
    const currentNamespace = dynamicFields.namespace;

    // Check if this is a Kubernetes node
    const nodeType = initialNode?.data?.type;
    const isK8sNode = typeof nodeType === 'object' ? nodeType.type === 'kubernetes' : nodeType?.startsWith('k8s-');
    const { options: k8sOptions, loading: k8sLoading } = useKubernetesOptions(
        isK8sNode ? currentNamespace : undefined
    );

    useEffect(() => {
        if (initialNode) {
            setLabel(initialNode.data.label || '');
            setDescription(initialNode.data.description || '');

            // Extract other fields that are not standard
            const { label, description, type, status, instanceType, githubUrl, consoleUrl, metrics, logs, ...others } = initialNode.data;
            setDynamicFields(others);
        }
    }, [initialNode]);

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

                    {/* Dynamic Fields (Provider-specific configuration) */}
                    {Object.keys(dynamicFields).length > 0 && (
                        <div className="space-y-3 border-t pt-3">
                            <h4 className="text-sm font-semibold text-muted-foreground">Configuration</h4>
                            {Object.entries(dynamicFields).map(([key, value]) => {
                                // Check if this is a namespace field for K8s nodes
                                if (key === 'namespace' && isK8sNode) {
                                    return (
                                        <div key={key} className="space-y-2">
                                            <label className="text-sm font-medium">Namespace</label>
                                            <K8sCombobox
                                                value={value as string}
                                                onChange={(newValue) => handleDynamicFieldChange(key, newValue)}
                                                options={getOptionsForSource('namespaces')}
                                                placeholder="Select namespace"
                                                loading={k8sLoading}
                                            />
                                        </div>
                                    );
                                }
                                // Check for other K8s select fields
                                if (key === 'podName' && isK8sNode) {
                                    return (
                                        <div key={key} className="space-y-2">
                                            <label className="text-sm font-medium">Pod Name</label>
                                            <K8sCombobox
                                                value={value as string}
                                                onChange={(newValue) => handleDynamicFieldChange(key, newValue)}
                                                options={getOptionsForSource('pods')}
                                                placeholder="Select pod"
                                                loading={k8sLoading}
                                            />
                                        </div>
                                    );
                                }
                                if (key === 'serviceName' && isK8sNode) {
                                    return (
                                        <div key={key} className="space-y-2">
                                            <label className="text-sm font-medium">Service Name</label>
                                            <K8sCombobox
                                                value={value as string}
                                                onChange={(newValue) => handleDynamicFieldChange(key, newValue)}
                                                options={getOptionsForSource('services')}
                                                placeholder="Select service"
                                                loading={k8sLoading}
                                            />
                                        </div>
                                    );
                                }
                                // Regular text input for other fields
                                return (
                                    <div key={key} className="space-y-2">
                                        <label className="text-sm font-medium capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </label>
                                        <Input
                                            value={value as string}
                                            onChange={(e) => handleDynamicFieldChange(key, e.target.value)}
                                        />
                                    </div>
                                );
                            })}
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
