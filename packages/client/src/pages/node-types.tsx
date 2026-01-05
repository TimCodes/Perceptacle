import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { cloudComponents } from "@/utils/cloudComponents";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Compute",
  "Storage",
  "Database",
  "Networking",
  "Security",
  "Serverless",
];

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "textarea", label: "Text Area" },
  { value: "url", label: "URL" },
];

interface CustomField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
  placeholder?: string;
}

interface Component {
  type: string;
  label: string;
  category: string;
  icon: any;
  fields?: CustomField[];
}

export default function NodeTypes() {
  const [_, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [customComponents, setCustomComponents] = useState<Component[]>(() => {
    const saved = localStorage.getItem("customComponents");
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();
  const [openFieldIds, setOpenFieldIds] = useState<string[]>([]);

  const toggleFieldConfig = (fieldId: string) => {
    setOpenFieldIds((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId],
    );
  };

  // Form state
  const [newComponent, setNewComponent] = useState({
    type: "",
    label: "",
    category: "",
    fields: [] as CustomField[],
  });

  const allComponents: Component[] = [...(cloudComponents as unknown as Component[]), ...customComponents];
  const selectedComponent = allComponents.find((c) => c.type === selectedType);

  const addField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      name: "",
      type: "text",
      required: false,
    };
    setNewComponent((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    // Automatically open the configuration for the new field
    setOpenFieldIds((prev) => [...prev, newField.id]);
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    setNewComponent((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field,
      ),
    }));
  };

  const removeField = (id: string) => {
    setNewComponent((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== id),
    }));
    setOpenFieldIds((prev) => prev.filter((fieldId) => fieldId !== id));
  };

  const renderFieldPreview = (field: CustomField) => (
    <div className="space-y-2 p-4 bg-accent/10 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="font-medium">{field.name || "Unnamed Field"}</span>
        <Badge>
          {FIELD_TYPES.find((t) => t.value === field.type)?.label || "Text"}
        </Badge>
      </div>
      {field.type === "select" && field.options && field.options.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {field.options.map((option, i) => (
            <Badge key={i} variant="outline">
              {option}
            </Badge>
          ))}
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        {field.placeholder && `Placeholder: ${field.placeholder}`}
        {field.defaultValue && ` • Default: ${field.defaultValue}`}
      </div>
    </div>
  );

  const renderFieldConfiguration = (field: CustomField) => (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeField(field.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Field
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Field Name</Label>
          <Input
            value={field.name}
            onChange={(e) => updateField(field.id, { name: e.target.value })}
            placeholder="e.g., instanceType"
          />
        </div>

        <div className="space-y-2">
          <Label>Field Type</Label>
          <Select
            value={field.type}
            onValueChange={(value) => updateField(field.id, { type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input
            value={field.placeholder || ""}
            onChange={(e) =>
              updateField(field.id, { placeholder: e.target.value })
            }
            placeholder="Enter placeholder text"
          />
        </div>

        <div className="space-y-2">
          <Label>Default Value</Label>
          <Input
            value={field.defaultValue || ""}
            onChange={(e) =>
              updateField(field.id, { defaultValue: e.target.value })
            }
            placeholder="Enter default value"
          />
        </div>
      </div>

      {field.type === "select" && (
        <div className="space-y-2">
          <Label>Options (comma-separated)</Label>
          <Input
            value={field.options?.join(", ") || ""}
            onChange={(e) =>
              updateField(field.id, {
                options: e.target.value
                  .split(",")
                  .map((opt) => opt.trim())
                  .filter(Boolean),
              })
            }
            placeholder="option1, option2, option3"
          />
        </div>
      )}
    </div>
  );

  const handleCreateComponent = () => {
    if (!newComponent.type || !newComponent.label || !newComponent.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate field names are unique
    const fieldNames = newComponent.fields.map((f) => f.name);
    if (new Set(fieldNames).size !== fieldNames.length) {
      toast({
        title: "Validation Error",
        description: "Field names must be unique",
        variant: "destructive",
      });
      return;
    }

    const exists = allComponents.some((c) => c.type === newComponent.type);
    if (exists) {
      toast({
        title: "Type already exists",
        description: "Please use a unique component type",
        variant: "destructive",
      });
      return;
    }

    const component = {
      ...newComponent,
      icon: "Box", // Default icon
    };

    const updatedComponents = [...customComponents, component];
    setCustomComponents(updatedComponents);
    localStorage.setItem("customComponents", JSON.stringify(updatedComponents));

    toast({
      title: "Component Created",
      description: "New component type has been added successfully",
    });

    setNewComponent({ type: "", label: "", category: "", fields: [] });
  };

  return (
    <div className="p-4 h-[calc(100vh-65px)] w-screen">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Editor
          </Button>
          <h1 className="text-2xl font-bold">Node Types</h1>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Component Type</DialogTitle>
              <DialogDescription>
                Define a new custom component type with custom fields for your
                GCP diagrams.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Component Type ID</Label>
                <Input
                  id="type"
                  placeholder="e.g., custom-service"
                  value={newComponent.type}
                  onChange={(e) =>
                    setNewComponent((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                />
                <p className="text-sm text-muted-foreground">
                  A unique identifier for this component type
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Display Name</Label>
                <Input
                  id="label"
                  placeholder="e.g., Custom Service"
                  value={newComponent.label}
                  onChange={(e) =>
                    setNewComponent((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newComponent.category}
                  onValueChange={(value) =>
                    setNewComponent((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Custom Fields</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addField}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>

                <div className="space-y-4">
                  {newComponent.fields.map((field) => (
                    <Card key={field.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Field Preview */}
                          {renderFieldPreview(field)}

                          {/* Toggle Configuration Button */}
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => toggleFieldConfig(field.id)}
                          >
                            Field Configuration
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${openFieldIds.includes(field.id)
                                ? "rotate-90"
                                : ""
                                }`}
                            />
                          </Button>

                          {/* Field Configuration */}
                          {openFieldIds.includes(field.id) &&
                            renderFieldConfiguration(field)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleCreateComponent}>Create Component</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Components</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-2">
                {allComponents.map((component) => {
                  const Icon = component.icon;
                  return (
                    <div
                      key={component.type}
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${selectedType === component.type
                        ? "bg-accent text-accent-foreground"
                        : ""
                        }`}
                      onClick={() => setSelectedType(component.type)}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{component.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {component.category}
                        </div>
                      </div>
                      {customComponents.some(
                        (c) => c.type === component.type,
                      ) && <Badge variant="secondary">Custom</Badge>}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedComponent ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 border rounded-md">
                    <selectedComponent.icon className="h-12 w-12" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedComponent.label}
                    </h2>
                    <Badge>{selectedComponent.category}</Badge>
                    {customComponents.some(
                      (c) => c.type === selectedComponent.type,
                    ) && (
                        <Badge variant="secondary" className="ml-2">
                          Custom
                        </Badge>
                      )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Component Type</Label>
                    <Input value={selectedComponent.type} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input value={selectedComponent.label} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={selectedComponent.category} readOnly />
                  </div>

                  {selectedComponent.fields &&
                    selectedComponent.fields.length > 0 && (
                      <div className="space-y-4">
                        <Label className="text-lg">Custom Fields</Label>
                        <div className="grid gap-4">
                          {selectedComponent.fields.map(
                            (field: CustomField) => (
                              <Card key={field.id}>
                                <CardContent className="pt-4">
                                  <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">
                                        {field.name}
                                      </span>
                                      <Badge>
                                        {
                                          FIELD_TYPES.find(
                                            (t) => t.value === field.type,
                                          )?.label
                                        }
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {field.placeholder &&
                                        `Placeholder: ${field.placeholder}`}
                                      {field.defaultValue &&
                                        ` • Default: ${field.defaultValue}`}
                                    </p>
                                    {field.type === "select" &&
                                      field.options && (
                                        <div className="flex gap-2 flex-wrap">
                                          {field.options.map((option, i) => (
                                            <Badge key={i} variant="outline">
                                              {option}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                </CardContent>
                              </Card>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 w-48">
                        <selectedComponent.icon className="h-5 w-5" />
                        <span className="font-medium">
                          {selectedComponent.label}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a component to view its details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
