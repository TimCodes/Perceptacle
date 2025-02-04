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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorModeValue,
} from "@chakra-ui/react";
import { ExternalLink, Github, Activity, AlertCircle } from "lucide-react";
import { useDiagramStore } from "@/lib/diagram-store";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ConfigPanel() {
  const { selectedNode, updateSelectedNode } = useDiagramStore();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!selectedNode) {
    return (
      <Box p={4} borderLeft="1px" borderColor={borderColor}>
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
        return "#48BB78";
      case "warning":
        return "#ECC94B";
      case "error":
        return "#E53E3E";
      case "inactive":
        return "#A0AEC0";
      default:
        return "#CBD5E0";
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle size={14} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={14} className="text-yellow-500" />;
      default:
        return <Activity size={14} className="text-blue-500" />;
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
      <Box>
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

  const renderComponentLogs = () => {
    const logs = selectedNode.data.logs || [];

    return (
      <Box mt={4}>
        <HStack mb={4} justify="space-between">
          <Text fontWeight="bold" fontSize="lg">
            Component Logs
          </Text>
          <Badge>{logs.length} entries</Badge>
        </HStack>

        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <VStack spacing={2} align="stretch">
            {logs.slice().reverse().map((log: any, index: number) => (
              <HStack
                key={index}
                p={2}
                bg={log.level === 'error' ? 'red.50' : log.level === 'warning' ? 'yellow.50' : 'blue.50'}
                borderRadius="md"
                spacing={3}
              >
                {getLogIcon(log.level)}
                <VStack spacing={0} align="start" flex={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {log.message}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </ScrollArea>
      </Box>
    );
  };

  return (
    <Box p={4} borderLeft="1px" borderColor={borderColor} width="400px">
      <Text mb={4} fontWeight="bold" fontSize="lg">
        Node Configuration
      </Text>

      <Tabs>
        <TabList>
          <Tab>Configuration</Tab>
          <Tab>CI/CD</Tab>
          <Tab>Observability</Tab>
        </TabList>

        <TabPanels>
          {/* Configuration Tab */}
          <TabPanel>
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
                <FormLabel>Instance Type</FormLabel>
                <Input
                  value={selectedNode.data.instanceType || ""}
                  onChange={(e) => handleChange("instanceType", e.target.value)}
                />
                <FormHelperText>The type of GCP instance (e.g., n1-standard-1)</FormHelperText>
              </FormControl>
            </VStack>
          </TabPanel>

          {/* CI/CD Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
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
            </VStack>
          </TabPanel>

          {/* Observability Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Box>
                <HStack mb={4} justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">
                    Metrics
                  </Text>
                  <Badge colorScheme={selectedNode.data.status === 'active' ? 'green' : 'red'}>
                    {selectedNode.data.status}
                  </Badge>
                </HStack>
                {renderObservabilityMetrics()}
              </Box>
              {renderComponentLogs()}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}