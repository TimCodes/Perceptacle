import React, { useState } from "react";
import DiagramCanvas from "@/components//DiagramCanvas/DiagramCanvas";
import DropDown from "@/components/NodeTypeDropdown/DropDown";
import { ReactFlowProvider } from "@xyflow/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/utils/cn";

import NodeInfoSideBar from "@/components/NodeInfoSideBar/NodeInfoSideBar";
import DiagramToolbar from "@/components/DiagramCanvas/DiagramToolbar";

const MotionDiv = motion.div;

export default function Home() {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const { theme } = useTheme();

  const handleNodeSelected = () => {
    setIsConfigPanelOpen(true);
  };

  const handleComponentSelect = (component: any) => {
    console.log("Selected component:", component);
  };

  return (
    <ReactFlowProvider>
      <div className="h-[calc(100vh-65px)]  w-screen flex flex-col">
        {/* <div className="border-b bg-background">
          <DiagramToolbar />
        </div>
 */}
        <div className="flex-1 flex relative">
          <div className="flex-1 relative bg-muted/50">
            <div className="absolute top-6 left-6 z-10">
              <DropDown onComponentSelect={handleComponentSelect} />
            </div>
            <DiagramCanvas onNodeSelected={handleNodeSelected} />
          </div>
          <DiagramToolbar />
          <AnimatePresence initial={false} mode="wait">
            {isConfigPanelOpen ? (
              <MotionDiv
                key="config-panel"
                className="bg-background border-l"
                initial={{ width: "0px" }}
                animate={{ width: "400px" }}
                exit={{ width: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <NodeInfoSideBar />
              </MotionDiv>
            ) : null}
          </AnimatePresence>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
            className={cn(
              "absolute top-4 z-10 shadow-md",
              isConfigPanelOpen ? "right-[400px]" : "right-0",
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
