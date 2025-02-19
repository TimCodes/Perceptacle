import { useState } from "react";
import DiagramCanvas from "@/components/diagram-canvas";
import ConfigPanel from "@/components/config-panel";
import DiagramToolbar from "@/components/diagram-toolbar";
import DropDown from "@/components/DropDown";
import { ReactFlowProvider } from "reactflow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;

export default function Home() {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const { theme } = useTheme();

  const toggleConfigPanel = () => {
    setIsConfigPanelOpen(!isConfigPanelOpen);
  };

  const handleNodeSelected = () => {
    setIsConfigPanelOpen(true);
  };

  const handleComponentSelect = (component: any) => {
    console.log('Selected component:', component);
  };

  return (
    <ReactFlowProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="border-b bg-background">
          <DiagramToolbar />
        </div>

        <div className="flex-1 flex">
          <div className="flex-1 relative bg-muted/50">
            <div className="absolute top-6 left-6 z-10">
              <DropDown onComponentSelect={handleComponentSelect} />
            </div>
            <div className="h-full w-full">
              <DiagramCanvas onNodeSelected={handleNodeSelected} />
            </div>
          </div>

          <div className="relative">
            <AnimatePresence initial={false} mode="wait">
              <MotionDiv
                key="config-panel"
                className={cn(
                  "h-full bg-background border-l",
                  "overflow-hidden"
                )}
                initial={{ width: "24px" }}
                animate={{ 
                  width: isConfigPanelOpen ? "325px" : "24px",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                <ConfigPanel />
              </MotionDiv>
            </AnimatePresence>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleConfigPanel}
              className="absolute left-0 top-4 z-10 shadow-md"
            >
              {isConfigPanelOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}