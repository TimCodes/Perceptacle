import {
  Box,
  VStack,
  Input,
  Text,
  Image,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { cloudComponents } from '@/lib/cloudComponents';

interface ComponentLibraryProps {
  setNodes: (updater: (nodes: any[]) => any[]) => void;
}

export default function ComponentLibrary({ setNodes }: ComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const filteredComponents = cloudComponents.filter(
    component => component.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box
      w="300px"
      bg={bgColor}
      p={4}
      borderRight="1px"
      borderColor={borderColor}
      overflowY="auto"
    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Components
      </Text>

      <InputGroup mb={4}>
        <InputLeftElement>
          <Search size={20} />
        </InputLeftElement>
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <VStack spacing={2} align="stretch">
        {filteredComponents.map((component) => (
          <Box
            key={component.type}
            p={2}
            border="1px"
            borderColor={borderColor}
            borderRadius="md"
            cursor="grab"
            draggable
            onDragStart={(e) => onDragStart(e, component.type)}
            _hover={{ bg: 'gray.50' }}
          >
            <Image
              src={component.icon}
              alt={component.label}
              boxSize="24px"
              display="inline-block"
              mr={2}
            />
            <Text display="inline-block" verticalAlign="middle">
              {component.label}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
