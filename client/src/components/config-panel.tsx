import {
  Box,
  VStack,
  Input,
  Text,
} from '@chakra-ui/react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/form-control';
import { useDiagramStore } from '@/lib/diagram-store';

export default function ConfigPanel() {
  const { selectedNode, updateSelectedNode } = useDiagramStore();

  if (!selectedNode) {
    return (
      <Box p={4} borderLeft="1px" borderColor="gray.200">
        <Text color="gray.500">Select a node to configure its properties</Text>
      </Box>
    );
  }

  const handleChange = (field: string, value: string) => {
    updateSelectedNode({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        [field]: value,
      },
    });
  };

  return (
    <Box p={4} borderLeft="1px" borderColor="gray.200">
      <Text mb={4} fontWeight="bold" fontSize="lg">Node Configuration</Text>

      <VStack align="stretch" spacing={4}>
        <FormControl>
          <FormLabel>Label</FormLabel>
          <Input
            value={selectedNode.data.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
          />
          <FormHelperText>Enter a name for this component</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            value={selectedNode.data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <FormHelperText>Brief description of the component's purpose</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Instance Type</FormLabel>
          <Input
            value={selectedNode.data.instanceType || ''}
            onChange={(e) => handleChange('instanceType', e.target.value)}
          />
          <FormHelperText>The type of GCP instance (e.g., n1-standard-1)</FormHelperText>
        </FormControl>
      </VStack>
    </Box>
  );
}