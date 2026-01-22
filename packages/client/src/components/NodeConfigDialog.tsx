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

    if (!initialNode) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configure {initialNode.data.type}</DialogTitle>
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
