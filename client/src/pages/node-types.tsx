import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { cloudComponents } from "@/lib/cloudComponents";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function NodeTypes() {
  const [_, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const selectedComponent = cloudComponents.find(c => c.type === selectedType);

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center gap-4">
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

      <div className="grid grid-cols-[300px_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Components</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-2">
                {cloudComponents.map((component) => {
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
