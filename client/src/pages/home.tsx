import { useState } from "react";
import DiagramCanvas from "@/components/diagram-canvas";
import ConfigPanel from "@/components/config-panel";
import DiagramToolbar from "@/components/diagram-toolbar";
import DropDown from "@/components/DropDown";
import { ReactFlowProvider } from "reactflow";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useDiagramStore } from "@/lib/diagram-store";

const MotionDiv = motion.div;

export default function Home() {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const { theme } = useTheme();
  const { saveDiagram, loadDiagram, clearDiagram } = useDiagramStore();

  const handleNodeSelected = () => {
    setIsConfigPanelOpen(true);
  };

  const handleComponentSelect = (component: any) => {
    console.log("Selected component:", component);
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col">
        <div className="border-b bg-background">
          <DiagramToolbar />
        </div>

        <div className="flex-1 flex relative">
          {/* Floating Sidebar */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
            <div className="bg-background border rounded-lg shadow-lg flex flex-col gap-2 p-2">
              <Button
                variant="ghost"
                size="icon"
                title="Save Diagram"
                onClick={saveDiagram}
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Load Diagram"
                onClick={loadDiagram}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Clear Canvas"
                onClick={clearDiagram}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 relative bg-muted/50">
            <div className="absolute top-6 left-6 z-10">
              <DropDown onComponentSelect={handleComponentSelect} />
            </div>
            <DiagramCanvas onNodeSelected={handleNodeSelected} />
          </div>

          <AnimatePresence initial={false} mode="wait">
            {isConfigPanelOpen ? (
              <MotionDiv
                key="config-panel"
                className="h-full bg-background border-l"
                initial={{ width: 0, right: 0 }}
                animate={{ width: 325 }}
                exit={{ width: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <ConfigPanel />
              </MotionDiv>
            ) : null}
          </AnimatePresence>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
            className={cn(
              "absolute top-4 z-10 shadow-md",
              isConfigPanelOpen ? "right-[325px]" : "right-0",
            )}
          >
            {isConfigPanelOpen ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
