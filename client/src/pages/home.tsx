import { Box, Grid, GridItem, IconButton } from "@chakra-ui/react";
import ComponentLibrary from "@/components/component-library";
import DiagramCanvas from "@/components/diagram-canvas";
import ConfigPanel from "@/components/config-panel";
import DiagramToolbar from "@/components/diagram-toolbar";
import { ReactFlowProvider } from "reactflow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MotionGridItem = motion(GridItem);

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

  const toggleComponentMenu = () => {
    setIsComponentMenuOpen(!isComponentMenuOpen);
  };

  return (
    <ReactFlowProvider>
      <Grid
        templateAreas={`"toolbar toolbar toolbar"
                       "library canvas config"`}
        gridTemplateRows={"60px 1fr"}
        gridTemplateColumns={"auto 1fr 300px"}
        h="100vh"
        gap="1"
        color="blackAlpha.700"
        fontWeight="bold"
      >
        <GridItem area={"toolbar"} bg="white" borderBottom="1px" borderColor="gray.200">
          <DiagramToolbar />
        </GridItem>

        <AnimatePresence initial={false}>
          <MotionGridItem
            area={"library"}
            bg="white"
            borderRight="1px"
            borderColor="gray.200"
            overflowY="auto"
            variants={menuVariants}
            initial="closed"
            animate={isComponentMenuOpen ? "open" : "closed"}
            style={{ position: 'relative' }}
          >
            <ComponentLibrary />
            <Box position="absolute" right="-12" top="4" zIndex={10}>
              <motion.div
                variants={buttonVariants}
                initial="open"
                animate={isComponentMenuOpen ? "open" : "closed"}
              >
                <IconButton
                  aria-label={isComponentMenuOpen ? "Close menu" : "Open menu"}
                  icon={<ChevronLeft size={20} />}
                  onClick={toggleComponentMenu}
                  size="sm"
                  variant="solid"
                  bg="white"
                  borderWidth={1}
                  borderColor="gray.200"
                  borderLeftRadius={0}
                  shadow="md"
                  _hover={{ bg: 'gray.50' }}
                />
              </motion.div>
            </Box>
          </MotionGridItem>
        </AnimatePresence>

        <GridItem area={"canvas"} bg="gray.50">
          <Box h="100%" w="100%">
            <DiagramCanvas />
          </Box>
        </GridItem>

        <GridItem area={"config"} bg="white" borderLeft="1px" borderColor="gray.200">
          <ConfigPanel />
        </GridItem>
      </Grid>
    </ReactFlowProvider>
  );
}