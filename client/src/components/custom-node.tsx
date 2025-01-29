import { NodeProps } from 'reactflow';
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from '@chakra-ui/react';
import { useDiagramStore } from '@/lib/diagram-store';

export default function CustomNode({ id, data, xPos, yPos }: NodeProps) {
  const { deleteNode, duplicateNode } = useDiagramStore();

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <Box onContextMenu={handleContextMenu}>
      <Menu>
        <MenuButton as={Box} cursor="context-menu">
          <Box
            p={2}
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            display="flex"
            alignItems="center"
            gap={2}
          >
            {data.icon && <data.icon size={24} />}
            <span>{data.label}</span>
          </Box>
        </MenuButton>
        <Portal>
          <MenuList>
            <MenuItem onClick={() => duplicateNode(id)}>Duplicate</MenuItem>
            <MenuItem onClick={() => deleteNode(id)} color="red.500">Delete</MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </Box>
  );
}
