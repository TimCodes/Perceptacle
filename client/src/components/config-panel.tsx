import {
  Box,
  VStack,
  Input,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  useTheme,
} from '@chakra-ui/react';
import { useDiagramStore } from '@/lib/diagram-store';

export default function ConfigPanel() {
  const { selectedNode, updateSelectedNode } = useDiagramStore();
  const theme = useTheme();

  if (!selectedNode) {
    return (
      <Box p={4} bg={theme.colors.white}>
        <Text color={theme.colors.gray[500]}>Select a node to configure its properties</Text>
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
    <VStack spacing={4} p={4} align="stretch" bg={theme.colors.white}>
      <Text fontWeight="bold" fontSize="lg">Node Configuration</Text>

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
  );
}