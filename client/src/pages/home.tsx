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
        gridTemplateColumns={isComponentMenuOpen ? "250px 1fr 300px" : "0px 1fr 300px"}
        h="100vh"
        gap="1"
        color="blackAlpha.700"
        fontWeight="bold"
        transition="all 0.3s ease-in-out"
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
            initial={{ width: isComponentMenuOpen ? "250px" : "0px" }}
            animate={{ 
              width: isComponentMenuOpen ? "250px" : "0px",
              opacity: isComponentMenuOpen ? 1 : 0
            }}
            exit={{ width: "0px", opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            style={{
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <ComponentLibrary />
            <IconButton
              aria-label={isComponentMenuOpen ? "Close menu" : "Open menu"}
              icon={isComponentMenuOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              onClick={toggleComponentMenu}
              position="absolute"
              right="-16px"
              top="4"
              zIndex={10}
              size="sm"
              variant="solid"
              bg="white"
              borderWidth={1}
              borderColor="gray.200"
              borderLeftRadius={0}
              shadow="md"
              _hover={{ bg: 'gray.50' }}
            />
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