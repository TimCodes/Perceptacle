import { Stack, Input, Box, Text, SimpleGrid } from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { GCPComponents } from '@/lib/gcp-components';
import { useState } from 'react';

export default function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComponents = GCPComponents.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Stack direction="column" p={4} spacing={4}>
      <Box position="relative">
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          pl={10}
        />
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'gray'
          }}
        />
      </Box>

      <SimpleGrid columns={2} gap={4}>
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
    </Stack>
  );
}