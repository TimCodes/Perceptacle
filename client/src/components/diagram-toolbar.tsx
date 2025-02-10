import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Trash2, Plus, Download } from "lucide-react";
import { useCallback } from "react";
import { useDiagramStore } from "@/lib/diagram-store";
import { useToast } from "@/hooks/use-toast";

export default function DiagramToolbar() {
  const toast = useToast();
  const { saveDiagram, loadDiagram, clearDiagram } = useDiagramStore();

  const handleSave = useCallback(() => {
    saveDiagram();
    toast({
      title: "Diagram saved",
      description: "Your diagram has been saved to local storage",
    });
  }, [saveDiagram, toast]);

  const handleNew = useCallback(() => {
    if (window.confirm("Are you sure you want to create a new diagram? All unsaved changes will be lost.")) {
      clearDiagram();
    }
  }, [clearDiagram]);

  return (
    <div className="flex justify-between items-center p-4 border-b bg-background">
      <div className="flex gap-2">
        <Button
          onClick={handleNew}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New
        </Button>

        <Button
          onClick={handleSave}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>

        <Button
          onClick={loadDiagram}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Load
        </Button>
      </div>

      <Button
        onClick={clearDiagram}
        variant="destructive"
        size="sm"
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Clear Canvas
      </Button>
    </div>
  );
}