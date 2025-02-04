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
  HStack,
  Divider,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from "@chakra-ui/react";
import { ExternalLink, Github, Activity, AlertCircle } from "lucide-react";
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

  const renderLink = (url: string, icon: React.ReactNode) => {
    if (!url) return null;
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        color="blue.500"
        fontSize="sm"
        display="inline-flex"
        alignItems="center"
        _hover={{ textDecoration: 'underline', color: 'blue.600' }}
      >
        {icon}
        <Text ml={2}>{url}</Text>
      </Link>
    );
  };

  const renderObservabilityMetrics = () => {
    const metrics = selectedNode.data.metrics || {
      cpu: 45,
      memory: 60,
      disk: 30,
      network: 25,
      lastUpdated: new Date().toISOString(),
      activeAlerts: 2,
    };

    return (
      <Box mt={4}>
        <Divider my={4} />
        <Text mb={4} fontWeight="bold" fontSize="lg">
          Observability
          <Badge ml={2} colorScheme={selectedNode.data.status === 'active' ? 'green' : 'red'}>
            {selectedNode.data.status}
          </Badge>
        </Text>

        <SimpleGrid columns={2} spacing={4} mb={4}>
          <Stat>
            <StatLabel>CPU Usage</StatLabel>
            <StatNumber>{metrics.cpu}%</StatNumber>
            <Progress value={metrics.cpu} size="sm" colorScheme={metrics.cpu > 80 ? 'red' : 'blue'} />
          </Stat>

          <Stat>
            <StatLabel>Memory Usage</StatLabel>
            <StatNumber>{metrics.memory}%</StatNumber>
            <Progress value={metrics.memory} size="sm" colorScheme={metrics.memory > 80 ? 'red' : 'blue'} />
          </Stat>

          <Stat>
            <StatLabel>Disk Usage</StatLabel>
            <StatNumber>{metrics.disk}%</StatNumber>
            <Progress value={metrics.disk} size="sm" colorScheme={metrics.disk > 80 ? 'red' : 'blue'} />
          </Stat>

          <Stat>
            <StatLabel>Network Usage</StatLabel>
            <StatNumber>{metrics.network}%</StatNumber>
            <Progress value={metrics.network} size="sm" colorScheme={metrics.network > 80 ? 'red' : 'blue'} />
          </Stat>
        </SimpleGrid>

        <HStack spacing={4} mb={2}>
          <Activity size={16} />
          <Text fontSize="sm">Last Updated: {new Date(metrics.lastUpdated).toLocaleString()}</Text>
        </HStack>

        <HStack spacing={4}>
          <AlertCircle size={16} color={metrics.activeAlerts > 0 ? '#E53E3E' : '#48BB78'} />
          <Text fontSize="sm">Active Alerts: {metrics.activeAlerts}</Text>
        </HStack>
      </Box>
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
          {selectedNode.data.githubUrl && (
            <Box mt={1}>
              {renderLink(selectedNode.data.githubUrl, <Github size={14} />)}
            </Box>
          )}
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
          {selectedNode.data.consoleUrl && (
            <Box mt={1}>
              {renderLink(selectedNode.data.consoleUrl, <ExternalLink size={14} />)}
            </Box>
          )}
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

        {renderObservabilityMetrics()}
      </VStack>
    </Box>
  );
}