import {
  Box,
  VStack,
  Input,
  Text,
  useColorModeValue,
  Link,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  FormErrorIcon,
} from "@chakra-ui/form-control"

import { ExternalLink, Github } from 'lucide-react';
import { Node } from 'reactflow';

interface ConfigPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (node: Node) => void;
}

export default function ConfigPanel({ selectedNode, onNodeUpdate }: ConfigPanelProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!selectedNode) {
    return (
      <Box
        w="300px"
        bg={bgColor}
        p={4}
        borderLeft="1px"
        borderColor={borderColor}
      >
        <Text color="gray.500">
          Select a node to configure its properties
        </Text>
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

  const renderExternalLinkButton = (url: string) => {
    if (!url) return null;
    return (
      <InputRightElement>
        <IconButton
          aria-label="Open link"
          icon={<ExternalLink size={16} />}
          size="sm"
          variant="ghost"
          onClick={() => window.open(url, '_blank')}
        />
      </InputRightElement>
    );
  };

  return (
    <Box
      w="300px"
      bg={bgColor}
      p={4}
      borderLeft="1px"
      borderColor={borderColor}
    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Configuration
      </Text>

      <VStack spacing={4} align="stretch">
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
          <FormLabel>GitHub Repository</FormLabel>
          <InputGroup>
            <InputLeftElement>
              <Github size={16} />
            </InputLeftElement>
            <Input
              value={selectedNode.data.githubUrl || ''}
              onChange={(e) => handleChange('githubUrl', e.target.value)}
              placeholder="https://github.com/user/repo"
            />
            {renderExternalLinkButton(selectedNode.data.githubUrl)}
          </InputGroup>
          <FormHelperText>Link to the component's repository</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Google Console Link</FormLabel>
          <InputGroup>
            <Input
              value={selectedNode.data.consoleUrl || ''}
              onChange={(e) => handleChange('consoleUrl', e.target.value)}
              placeholder="https://console.cloud.google.com/..."
            />
            {renderExternalLinkButton(selectedNode.data.consoleUrl)}
          </InputGroup>
          <FormHelperText>Link to the Google Cloud Console</FormHelperText>
        </FormControl>
      </VStack>
    </Box>
  );
}