import { Save, Download, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const DiagramToolbar = () => {
  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
      <div className="bg-background border rounded-lg shadow-lg flex flex-col gap-2 p-2">
        <Button variant="ghost" size="icon" title="Load Diagram">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Save Diagram">
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Load Diagram">
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
