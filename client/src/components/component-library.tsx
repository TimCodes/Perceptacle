import {
  Box,
  VStack,
  Input,
  Text,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { GCPComponents } from '@/lib/gcp-components';

export default function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComponents = GCPComponents.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box p={4} borderRight="1px" borderColor="gray.200" bg="white">
      <VStack spacing={4} align="stretch">
        <Box position="relative">
          <InputGroup>
            <InputLeftElement>
              <Search size={20} />
            </InputLeftElement>
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Box>

        <SimpleGrid columns={2} spacing={4}>
          {filteredComponents.map((component) => (
            <Box
              key={component.type}
              p={2}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              cursor="grab"
              draggable
              onDragStart={(e) => onDragStart(e, component.type)}
              _hover={{ bg: 'gray.50' }}
              textAlign="center"
            >
              <component.icon size={32} style={{ margin: '0 auto' }} />
              <Text fontSize="sm" mt={2}>{component.name}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}