import {
  Box,
  Button,
  HStack,
  Input,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { Save, FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DiagramToolbarProps {
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
  onClear: () => void;
}

export default function DiagramToolbar({
  onSave,
  onLoad,
  onClear,
}: DiagramToolbarProps) {
  const [diagramName, setDiagramName] = useState('');
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSave = () => {
    if (!diagramName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a diagram name',
        status: 'error',
      });
      return;
    }

    onSave(diagramName);
    toast({
      title: 'Success',
      description: 'Diagram saved successfully',
      status: 'success',
    });
  };

  const handleLoad = () => {
    if (!diagramName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a diagram name to load',
        status: 'error',
      });
      return;
    }

    onLoad(diagramName);
  };

  return (
    <Box
      p={4}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <HStack spacing={4}>
        <Input
          placeholder="Diagram name"
          value={diagramName}
          onChange={(e) => setDiagramName(e.target.value)}
          w="200px"
        />
        
        <Button
          leftIcon={<Save size={16} />}
          onClick={handleSave}
          colorScheme="blue"
        >
          Save
        </Button>
        
        <Button
          leftIcon={<FolderOpen size={16} />}
          onClick={handleLoad}
          variant="outline"
        >
          Load
        </Button>
        
        <Button
          leftIcon={<Trash2 size={16} />}
          onClick={onClear}
          colorScheme="red"
          variant="ghost"
        >
          Clear
        </Button>
      </HStack>
    </Box>
  );
}
