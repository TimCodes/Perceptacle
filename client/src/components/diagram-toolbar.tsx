import { Flex, Button, useToast as useChakraToast } from '@chakra-ui/react';
import { Save, Trash2, Plus, Download } from 'lucide-react';
import { useCallback } from 'react';
import { useDiagramStore } from '@/lib/diagram-store';

export default function DiagramToolbar() {
  const toast = useChakraToast();
  const { saveDiagram, loadDiagram, clearDiagram } = useDiagramStore();

  const handleSave = useCallback(() => {
    saveDiagram();
    toast({
      title: "Diagram saved",
      description: "Your diagram has been saved to local storage",
      status: "success",
      duration: 3000,
    });
  }, [saveDiagram, toast]);

  const handleNew = useCallback(() => {
    if (window.confirm('Are you sure you want to create a new diagram? All unsaved changes will be lost.')) {
      clearDiagram();
    }
  }, [clearDiagram]);

  return (
    <Flex p={4} justify="space-between">
      <Flex gap={2}>
        <Button
          onClick={handleNew}
          variant="outline"
          leftIcon={<Plus size={16} />}
        >
          New
        </Button>
        <Button
          onClick={handleSave}
          variant="outline"
          leftIcon={<Save size={16} />}
        >
          Save
        </Button>
        <Button
          onClick={loadDiagram}
          variant="outline"
          leftIcon={<Download size={16} />}
        >
          Load
        </Button>
      </Flex>

      <Button
        onClick={handleNew}
        colorScheme="red"
        variant="ghost"
        leftIcon={<Trash2 size={16} />}
      >
        Clear Canvas
      </Button>
    </Flex>
  );
}