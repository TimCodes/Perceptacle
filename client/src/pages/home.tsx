import { Box, Grid, GridItem } from "@chakra-ui/react";
import ComponentLibrary from "@/components/component-library";
import DiagramCanvas from "@/components/diagram-canvas";
import ConfigPanel from "@/components/config-panel";
import DiagramToolbar from "@/components/diagram-toolbar";
import { ReactFlowProvider } from "reactflow";

export default function Home() {
  return (
    <ReactFlowProvider>
      <Grid
        templateAreas={`"toolbar toolbar toolbar"
                       "library canvas config"`}
        gridTemplateRows={"60px 1fr"}
        gridTemplateColumns={"250px 1fr 300px"}
        h="100vh"
        gap="1"
        color="blackAlpha.700"
        fontWeight="bold"
      >
        <GridItem area={"toolbar"} bg="white" borderBottom="1px" borderColor="gray.200">
          <DiagramToolbar />
        </GridItem>
        <GridItem area={"library"} bg="white" borderRight="1px" borderColor="gray.200" overflowY="auto">
          <ComponentLibrary />
        </GridItem>
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
