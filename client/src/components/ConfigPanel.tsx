import { Box, VStack, Input, Text, useColorModeValue } from "@chakra-ui/react";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  FormErrorIcon,
} from "@chakra-ui/form-control";

import { Node } from "reactflow";

interface ConfigPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (node: Node) => void;
}

export default function ConfigPanel({
  selectedNode,
  onNodeUpdate,
}: ConfigPanelProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  if (!selectedNode) {
    return (
      <Box
        w="300px"
        bg={bgColor}
        p={4}
        borderLeft="1px"
        borderColor={borderColor}
      >
        <Text color="gray.500">Select a node to configure its properties</Text>
      </Box>
    );
  }

  const handleChange = (field: string, value: string) => {
    onNodeUpdate({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        [field]: value,
      },
    });
  };

  return (
    <Box
      w="200px"
      bg={bgColor}
      p={4}
      borderLeft="1px"
      borderColor={borderColor}
    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Configuration dsfsadf
      </Text>

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Label</FormLabel>
          <Input
            value={selectedNode.data.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            value={selectedNode.data.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </FormControl>

        {/* Add more configuration fields based on node type */}
        <Text>
          "HELLo"
          {selectedNode.data.githubUrl}
        </Text>
      </VStack>
    </Box>
  );
}
