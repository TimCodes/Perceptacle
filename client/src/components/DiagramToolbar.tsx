import { Save, FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DiagramToolbarProps {
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
  onClear: () => void;
}

export default function DiagramToolbar({
  onSave,
  onLoad,
  onClear,
}: DiagramToolbarProps) {
  const [diagramName, setDiagramName] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    if (!diagramName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a diagram name",
        variant: "destructive",
      });
      return;
    }

    onSave(diagramName);
    toast({
      title: "Success",
      description: "Diagram saved successfully",
    });
  };

  const handleLoad = () => {
    if (!diagramName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a diagram name to load",
        variant: "destructive",
      });
      return;
    }

    onLoad(diagramName);
  };

  return (
    <div className="p-4 bg-background border-b flex items-center gap-4">
      <Input
        placeholder="Diagram name"
        value={diagramName}
        onChange={(e) => setDiagramName(e.target.value)}
        className="w-[200px]"
      />

      <Button
        onClick={handleSave}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        Save
      </Button>

      <Button
        variant="outline"
        onClick={handleLoad}
        className="gap-2"
      >
        <FolderOpen className="h-4 w-4" />
        Load
      </Button>

      <Button
        variant="ghost"
        onClick={onClear}
        className="gap-2 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}