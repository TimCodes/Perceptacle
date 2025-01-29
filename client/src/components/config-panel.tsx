import {
  Box,
  VStack,
  Input,
  Text,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Link,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ExternalLink, Github } from "lucide-react";
import { useDiagramStore } from "@/lib/diagram-store";

export default function ConfigPanel() {
  const { selectedNode, updateSelectedNode } = useDiagramStore();

  if (!selectedNode) {
    return (
      <Box p={4} borderLeft="1px" borderColor="gray.200">
        <Text color="gray.500">Select a node to configure its properties</Text>
      </Box>
    );
  }

  const handleChange = (field: string, value: string) => {
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        [field]: value,
      },
    };

    // Only update the border color when the status changes
    if (field === "status") {
      updatedNode.style = {
        ...selectedNode.style,
        border: `2px solid ${getStatusColor(value)}`,
      };
    }

    updateSelectedNode(updatedNode);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#48BB78"; // green.500
      case "warning":
        return "#ECC94B"; // yellow.500
      case "error":
        return "#E53E3E"; // red.500
      case "inactive":
        return "#A0AEC0"; // gray.500
      default:
        return "#CBD5E0"; // gray.300
    }
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
    <Box p={4} borderLeft="1px" borderColor="gray.200">
      <Text mb={4} fontWeight="bold" fontSize="lg">
        Node Configuration
      </Text>

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Label</FormLabel>
          <Input
            value={selectedNode.data.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
          />
          <FormHelperText>Enter a name for this component</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            value={selectedNode.data.status || "active"}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="active">Active</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="inactive">Inactive</option>
          </Select>
          <FormHelperText>Current status of the component</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            value={selectedNode.data.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
          <FormHelperText>Brief description of the component's purpose</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>GitHub Repository</FormLabel>
          <InputGroup>
            <InputLeftElement>
              <Github size={16} />
            </InputLeftElement>
            <Input
              value={selectedNode.data.githubUrl || ""}
              onChange={(e) => handleChange("githubUrl", e.target.value)}
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
              value={selectedNode.data.consoleUrl || ""}
              onChange={(e) => handleChange("consoleUrl", e.target.value)}
              placeholder="https://console.cloud.google.com/..."
            />
            {renderExternalLinkButton(selectedNode.data.consoleUrl)}
          </InputGroup>
          <FormHelperText>Link to the Google Cloud Console</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Instance Type</FormLabel>
          <Input
            value={selectedNode.data.instanceType || ""}
            onChange={(e) => handleChange("instanceType", e.target.value)}
          />
          <FormHelperText>The type of GCP instance (e.g., n1-standard-1)</FormHelperText>
        </FormControl>
      </VStack>
    </Box>
  );
}