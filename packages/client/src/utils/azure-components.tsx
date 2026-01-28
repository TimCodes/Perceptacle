import { NodeTypes, AzureSubtypes, type NodeTypeDefinition } from '@/types/nodeTypes';

// Azure SVG Icon Component
interface AzureIconProps {
  size?: number;
  className?: string;
}

// Import local Azure SVG icons
import FunctionAppsIconSvg from '@/assets/azure-icons/function-apps.svg';
import ServiceBusIconSvg from '@/assets/azure-icons/service-bus.svg';
import ApplicationInsightsIconSvg from '@/assets/azure-icons/application-insights.svg';
import VirtualNetworksIconSvg from '@/assets/azure-icons/virtual-networks.svg';
import AppServicesIconSvg from '@/assets/azure-icons/app-services.svg';
import FirewallsIconSvg from '@/assets/azure-icons/firewalls.svg';
import ApplicationGatewaysIconSvg from '@/assets/azure-icons/application-gateways.svg';
import KeyVaultsIconSvg from '@/assets/azure-icons/key-vaults.svg';
import CosmosDBIconSvg from '@/assets/azure-icons/azure-cosmos-db.svg';

// Create React components for Azure SVG icons
export const FunctionAppsIcon = ({ size = 24, className = "" }: AzureIconProps) => (
  <img
    src={FunctionAppsIconSvg}
    alt="Function Apps"
    width={size}
    height={size}
    className={className}
  />
);

export const ServiceBusIcon = ({ size = 24, className = "" }: AzureIconProps) => (
  <img
    src={ServiceBusIconSvg}
    alt="Service Bus"
    width={size}
    height={size}
    className={className}
  />
);

export const ApplicationInsightsIcon = ({ size = 24, className = "" }: AzureIconProps) => (
  <img
    src={ApplicationInsightsIconSvg}
    alt="Application Insights"
    width={size}
    height={size}
    className={className}
  />
);

export const VirtualNetworksIcon = ({ size = 24, className = "" }: AzureIconProps) => (
  <img
    src={VirtualNetworksIconSvg}
    alt="Virtual Networks"
    width={size}
    height={size}
    className={className}
  />
);

export const AppServicesIcon = ({ size = 24, className = "" }: AzureIconProps) => (
  <img
    src={AppServicesIconSvg}
    alt="App Services"
    width={size}
    height={size}
    className={className}
  />
);

export const FirewallsIcon = ({ size = 24, className = "" }: AzureIconProps) => (
  <img
    src={FirewallsIconSvg}
    alt="Firewalls"
    width={size}
    height={size}
    className={className}
  />
);

export const ApplicationGatewaysIcon = ({ size = 24, className = "" }: AzureIconProps) => (
  <img
    src={ApplicationGatewaysIconSvg}
    alt="Application Gateways"
    width={size}
    height={size}
    className={className}
  />
);

export const KeyVaultsIcon = ({ size = 24, className = "" }: AzureIconProps) => (
  <img
    src={KeyVaultsIconSvg}
    alt="Key Vaults"
    width={size}
    height={size}
    className={className}
  />
);

export const CosmosDBIcon = ({ size = 24, className = "" }: AzureIconProps) => (
  <img
    src={CosmosDBIconSvg}
    alt="Azure Cosmos DB"
    width={size}
    height={size}
    className={className}
  />
);

// Azure Components Configuration
export const AzureComponents = [
  {
    type: 'azure-function-app', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP } as NodeTypeDefinition,
    name: 'Function App',
    icon: FunctionAppsIcon,
    category: 'Serverless'
  },
  {
    type: 'ServiceBusQueue', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.AZURE, subtype: AzureSubtypes.SERVICE_BUS, variant: 'queue' } as NodeTypeDefinition,
    name: 'Service Bus',
    icon: ServiceBusIcon,
    category: 'Integration'
  },
  {
    type: 'azure-application-insights', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.AZURE, subtype: AzureSubtypes.APPLICATION_INSIGHTS } as NodeTypeDefinition,
    name: 'Application Insights',
    icon: ApplicationInsightsIcon,
    category: 'Monitoring'
  },
  {
    type: 'azure-virtual-network', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.AZURE, subtype: AzureSubtypes.VIRTUAL_NETWORK } as NodeTypeDefinition,
    name: 'Virtual Network',
    icon: VirtualNetworksIcon,
    category: 'Networking'
  },
  {
    type: 'azure-app-service', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.AZURE, subtype: AzureSubtypes.APP_SERVICE } as NodeTypeDefinition,
    name: 'App Service',
    icon: AppServicesIcon,
    category: 'Compute'
  },
  {
    type: 'azure-firewall', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.AZURE, subtype: AzureSubtypes.FIREWALL } as NodeTypeDefinition,
    name: 'Firewall',
    icon: FirewallsIcon,
    category: 'Security'
  },
  {
    type: 'azure-application-gateway', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.AZURE, subtype: AzureSubtypes.APPLICATION_GATEWAY } as NodeTypeDefinition,
    name: 'Application Gateway',
    icon: ApplicationGatewaysIcon,
    category: 'Networking'
  },
  {
    type: 'azure-key-vault', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.AZURE, subtype: AzureSubtypes.KEY_VAULT } as NodeTypeDefinition,
    name: 'Key Vault',
    icon: KeyVaultsIcon,
    category: 'Security'
  },
  {
    type: 'azure-cosmos-db', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.AZURE, subtype: AzureSubtypes.COSMOS_DB } as NodeTypeDefinition,
    name: 'Cosmos DB',
    icon: CosmosDBIcon,
    category: 'Database'
  }
];

// Icon map for Azure components
export const azureIconMap = {
  FunctionAppsIcon,
  ServiceBusIcon,
  ApplicationInsightsIcon,
  VirtualNetworksIcon,
  AppServicesIcon,
  FirewallsIcon,
  ApplicationGatewaysIcon,
  KeyVaultsIcon,
  CosmosDBIcon
};
