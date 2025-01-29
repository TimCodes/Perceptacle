import { Flex, Button } from '@chakra-ui/react';
import { Save, Trash2, Plus, Download } from 'lucide-react';
import { useCallback } from 'react';
import { useDiagramStore } from '@/lib/diagram-store';
import { useToast } from '@/hooks/use-toast';

export default function DiagramToolbar() {
  const toast = useToast();
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
    <Flex p={4} justify="space-between" bg="white" borderBottom="1px" borderColor="gray.200">
      <Flex gap={2}>
        <Button
          onClick={handleNew}
          variant="outline"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Plus size={16} />
          New
        </Button>
        <Button
          onClick={handleSave}
          variant="outline"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Save size={16} />
          Save
        </Button>
        <Button
          onClick={loadDiagram}
          variant="outline"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Download size={16} />
          Load
        </Button>
      </Flex>

      <Button
        onClick={handleNew}
        colorScheme="red"
        variant="ghost"
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Trash2 size={16} />
        Clear Canvas
      </Button>
    </Flex>
  );
}