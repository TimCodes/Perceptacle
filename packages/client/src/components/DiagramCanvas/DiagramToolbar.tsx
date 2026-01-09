import { Save, Download, Trash2, Plus, Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDiagramStore } from "@/utils/diagram-store";
import { Link } from "wouter";

interface DiagramToolbarProps {
  onSaveMap?: () => void;
  onLoadMap?: () => void;
}

const DiagramToolbar = ({ onSaveMap, onLoadMap }: DiagramToolbarProps) => {
  const { nodes } = useDiagramStore();
  
  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
      <div className="bg-background border rounded-lg shadow-lg flex flex-col gap-2 p-2">
        <Button variant="ghost" size="icon" title="Load Diagram">
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
        <Link href="/search">
          <Button 
            variant="ghost" 
            size="icon" 
            title="Search"
            asChild
          >
            <a>
              <Search className="h-4 w-4 text-white" />
            </a>
          </Button>
        </Link>
        <Link href="/messages">
          <Button 
            variant="ghost" 
            size="icon" 
            title="Messages"
            asChild
          >
            <a>
              <MessageSquare className="h-4 w-4 text-white" />
            </a>
          </Button>
        </Link>
        <Button variant="ghost" size="icon" title="Clear Canvas">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DiagramToolbar;
