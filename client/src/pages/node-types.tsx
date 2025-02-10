import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus } from "lucide-react";
import { useLocation } from "wouter";
import { cloudComponents } from "@/lib/cloudComponents";
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

export default function NodeTypes() {
  const [_, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [customComponents, setCustomComponents] = useState(() => {
    const saved = localStorage.getItem("customComponents");
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();

  // Form state
  const [newComponent, setNewComponent] = useState({
    type: "",
    label: "",
    category: "",
  });

  const allComponents = [...cloudComponents, ...customComponents];
  const selectedComponent = allComponents.find(c => c.type === selectedType);

  const handleCreateComponent = () => {
    if (!newComponent.type || !newComponent.label || !newComponent.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const exists = allComponents.some(c => c.type === newComponent.type);
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

    setNewComponent({ type: "", label: "", category: "" });
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/")}
          >
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Component Type</DialogTitle>
              <DialogDescription>
                Define a new custom component type for your GCP diagrams.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Component Type ID</Label>
                <Input
                  id="type"
                  placeholder="e.g., custom-service"
                  value={newComponent.type}
                  onChange={(e) => setNewComponent(prev => ({
                    ...prev,
                    type: e.target.value
                  }))}
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
                  onChange={(e) => setNewComponent(prev => ({
                    ...prev,
                    label: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newComponent.category}
                  onValueChange={(value) => setNewComponent(prev => ({
                    ...prev,
                    category: value
                  }))}
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
                      className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                        selectedType === component.type ? 'bg-accent text-accent-foreground' : ''
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
                      {customComponents.some(c => c.type === component.type) && (
                        <Badge variant="secondary">Custom</Badge>
                      )}
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
                    <h2 className="text-2xl font-bold">{selectedComponent.label}</h2>
                    <Badge>{selectedComponent.category}</Badge>
                    {customComponents.some(c => c.type === selectedComponent.type) && (
                      <Badge variant="secondary" className="ml-2">Custom</Badge>
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
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 w-48">
                        <selectedComponent.icon className="h-5 w-5" />
                        <span className="font-medium">{selectedComponent.label}</span>
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