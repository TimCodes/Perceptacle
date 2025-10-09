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
    type: 'azure-function-app',
    name: 'Function App',
    icon: FunctionAppsIcon,
    category: 'Serverless'
  },
  {
    type: 'azure-service-bus',
    name: 'Service Bus',
    icon: ServiceBusIcon,
    category: 'Integration'
  },
  {
    type: 'azure-application-insights',
    name: 'Application Insights',
    icon: ApplicationInsightsIcon,
    category: 'Monitoring'
  },
  {
    type: 'azure-virtual-network',
    name: 'Virtual Network',
    icon: VirtualNetworksIcon,
    category: 'Networking'
  },
  {
    type: 'azure-app-service',
    name: 'App Service',
    icon: AppServicesIcon,
    category: 'Compute'
  },
  {
    type: 'azure-firewall',
    name: 'Firewall',
    icon: FirewallsIcon,
    category: 'Security'
  },
  {
    type: 'azure-application-gateway',
    name: 'Application Gateway',
    icon: ApplicationGatewaysIcon,
    category: 'Networking'
  },
  {
    type: 'azure-key-vault',
    name: 'Key Vault',
    icon: KeyVaultsIcon,
    category: 'Security'
  },
  {
    type: 'azure-cosmos-db',
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
