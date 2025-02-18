import { useState } from "react";
import ComponentLibrary from "@/components/component-library";
import DiagramCanvas from "@/components/diagram-canvas";
import ConfigPanel from "@/components/config-panel";
import DiagramToolbar from "@/components/diagram-toolbar";
import DropDown from "@/components/DropDown";
import { ReactFlowProvider } from "reactflow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const MotionDiv = motion.div;

const menuVariants = {
  open: {
    width: "325px",
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
  closed: {
    width: "0px",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    },
  },
};

export default function Home() {
  const [isComponentMenuOpen, setIsComponentMenuOpen] = useState(true);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const { theme } = useTheme();

  const toggleComponentMenu = () => {
    setIsComponentMenuOpen(!isComponentMenuOpen);
  };

  const toggleConfigPanel = () => {
    setIsConfigPanelOpen(!isConfigPanelOpen);
  };

  const handleNodeSelected = () => {
    setIsConfigPanelOpen(true);
  };

  const handleComponentSelect = (component: any) => {
    // This will be handled by DiagramCanvas through the store
    console.log('Selected component:', component);
  };

  return (
    <ReactFlowProvider>
      <div className="grid h-screen grid-cols-[auto_1fr_auto] grid-rows-[60px_1fr] gap-1">
        <div className="col-span-3 border-b bg-background">
          <DiagramToolbar />
        </div>

        <div className="relative">
          <AnimatePresence initial={false}>
            <MotionDiv
              className="h-full border-r bg-card overflow-hidden"
              variants={menuVariants}
              initial="closed"
              animate={isComponentMenuOpen ? "open" : "closed"}
            >
              <ComponentLibrary />
            </MotionDiv>
          </AnimatePresence>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleComponentMenu}
            className="absolute -right-6 top-4 z-10 rounded-l-none shadow-md"
          >
            {isComponentMenuOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="bg-muted/50 relative">
          <div className="h-full w-full">
            <DiagramCanvas onNodeSelected={handleNodeSelected} />
          </div>
          <div className="absolute bottom-6 left-6 z-10">
            <DropDown onComponentSelect={handleComponentSelect} />
          </div>
        </div>

        <div className="relative">
          <AnimatePresence initial={false}>
            <MotionDiv
              variants={menuVariants}
              initial="closed"
              animate={isConfigPanelOpen ? "open" : "closed"}
            >
              <ConfigPanel />
            </MotionDiv>
          </AnimatePresence>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleConfigPanel}
            className="absolute -left-6 top-4 z-10 rounded-r-none shadow-md"
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