import { useState } from "react";
import ComponentLibrary from "@/components/component-library";
import DiagramCanvas from "@/components/diagram-canvas";
import ConfigPanel from "@/components/config-panel";
import DiagramToolbar from "@/components/diagram-toolbar";
import { ReactFlowProvider } from "reactflow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const MotionDiv = motion.div;

const menuVariants = {
  open: {
    width: "250px",
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  },
  closed: {
    width: "0px",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }
  }
};

const buttonVariants = {
  open: {
    x: 0,
    rotate: 0,
    transition: { duration: 0.3 }
  },
  closed: {
    x: -10,
    rotate: 180,
    transition: { duration: 0.3 }
  }
};

export default function Home() {
  const [isComponentMenuOpen, setIsComponentMenuOpen] = useState(true);
  const { theme } = useTheme();

  const toggleComponentMenu = () => {
    setIsComponentMenuOpen(!isComponentMenuOpen);
  };

  return (
    <ReactFlowProvider>
      <div className="grid h-screen grid-cols-[auto_1fr_300px] grid-rows-[60px_1fr] gap-1">
        <div className="col-span-3 border-b bg-background">
          <DiagramToolbar />
        </div>

        <AnimatePresence initial={false}>
          <MotionDiv
            className="relative border-r bg-card"
            variants={menuVariants}
            initial="closed"
            animate={isComponentMenuOpen ? "open" : "closed"}
          >
            <ComponentLibrary />
            <div className="absolute -right-12 top-4 z-10">
              <motion.div
                variants={buttonVariants}
                initial="open"
                animate={isComponentMenuOpen ? "open" : "closed"}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleComponentMenu}
                  className="rounded-l-none shadow-md"
                >
                  {isComponentMenuOpen ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </MotionDiv>
        </AnimatePresence>

        <div className="bg-muted/50">
          <div className="h-full w-full">
            <DiagramCanvas />
          </div>
        </div>

        <div className="border-l bg-card">
          <ConfigPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}