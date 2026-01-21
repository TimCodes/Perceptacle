/**
 * Home page - main diagram editor with canvas and configuration panel.
 * Provides drag-and-drop diagram building with real-time application node configuration.
 */
import { useState } from "react";
import DiagramCanvas from "@/components//DiagramCanvas/DiagramCanvas";
import DropDown from "@/components/NodeTypeDropdown/DropDown";
import { ReactFlowProvider } from "reactflow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

import NodeInfoSideBar from "@/components/NodeInfoSideBar/NodeInfoSideBar";
import DiagramToolbar from "@/components/DiagramCanvas/DiagramToolbar";

const MotionDiv = motion.div;

/** Main diagram editor page component */
export default function Home() {
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [isConfigPanelExpanded, setIsConfigPanelExpanded] = useState(false);
  const [saveTriggered, setSaveTriggered] = useState(false);
  const [loadTriggered, setLoadTriggered] = useState(false);
  const [newMapTriggered, setNewMapTriggered] = useState(false);

  const handleNodeSelected = () => {
    setIsConfigPanelOpen(true);
  };

  const handleComponentSelect = (component: any) => {
    console.log("Selected component:", component);
  };

  const triggerSave = () => {
    setSaveTriggered(true);
  };

  const onSaveComplete = () => {
    setSaveTriggered(false);
  };

  const triggerLoad = () => {
    setLoadTriggered(true);
  };

  const onLoadComplete = () => {
    setLoadTriggered(false);
  };

  const triggerNewMap = () => {
    setNewMapTriggered(true);
  };

  const onNewMapComplete = () => {
    setNewMapTriggered(false);
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
            <DiagramCanvas
              onNodeSelected={handleNodeSelected}
              saveTriggered={saveTriggered}
              onSaveComplete={onSaveComplete}
              loadTriggered={loadTriggered}
              onLoadComplete={onLoadComplete}
              newMapTriggered={newMapTriggered}
              onNewMapComplete={onNewMapComplete}
            />
          </div>
          <DiagramToolbar onSaveMap={triggerSave} onLoadMap={triggerLoad} onNewMap={triggerNewMap} />
          <AnimatePresence initial={false}>
            {isConfigPanelOpen ? (
              <MotionDiv
                key="config-panel"
                className="bg-background border-l z-50"
                initial={{ width: "0px" }}
                animate={{ width: isConfigPanelExpanded ? "75%" : "30%" }}
                exit={{ width: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <NodeInfoSideBar
                  isExpanded={isConfigPanelExpanded}
                  toggleExpanded={() =>
                    setIsConfigPanelExpanded(!isConfigPanelExpanded)
                  }
                />
              </MotionDiv>
            ) : null}
          </AnimatePresence>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
            className={cn(
              "absolute top-4 z-10 shadow-md",
              isConfigPanelOpen
                ? isConfigPanelExpanded
                  ? "right-[75%]"
                  : "right-[30%]"
                : "right-0",
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
