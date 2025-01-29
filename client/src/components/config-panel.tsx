import {
  Box,
  Flex,
  Input,
  Text,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { useDiagramStore } from '@/lib/diagram-store';

export default function ConfigPanel() {
  const { selectedNode, updateSelectedNode } = useDiagramStore();

  if (!selectedNode) {
    return (
      <Box p={4}>
        <Text color="gray.500">Select a node to configure its properties</Text>
      </Box>
    );
  }

  const handleChange = (field: string, value: string) => {
    updateSelectedNode({
      ...selectedNode,
      data: { ...selectedNode.data, [field]: value }
    });
  };

  return (
    <Flex direction="column" p={4} gap={4}>
      <Text fontWeight="bold" fontSize="lg">Node Configuration</Text>

      <FormControl>
        <FormLabel>Label</FormLabel>
        <Input
          value={selectedNode.data.label || ''}
          onChange={(e) => handleChange('label', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Description</FormLabel>
        <Input
          value={selectedNode.data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Instance Type</FormLabel>
        <Input
          value={selectedNode.data.instanceType || ''}
          onChange={(e) => handleChange('instanceType', e.target.value)}
        />
      </FormControl>
    </Flex>
  );
}