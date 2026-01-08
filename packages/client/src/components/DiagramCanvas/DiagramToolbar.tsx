import { Save, Download, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDiagramStore } from "@/utils/diagram-store";

interface DiagramToolbarProps {
  onSaveMap?: () => void;
  onLoadMap?: () => void;
  onNewMap?: () => void;
}

const DiagramToolbar = ({ onSaveMap, onLoadMap, onNewMap }: DiagramToolbarProps) => {
  const { nodes } = useDiagramStore();

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
      <div className="bg-background border rounded-lg shadow-lg flex flex-col gap-2 p-2">
        <Button
          variant="ghost"
          size="icon"
          title="Create New Map"
          onClick={onNewMap}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Save Telemetry Map"
          onClick={onSaveMap}
          disabled={nodes.length === 0}
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Load Telemetry Map"
          onClick={onLoadMap}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Clear Canvas">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DiagramToolbar;
