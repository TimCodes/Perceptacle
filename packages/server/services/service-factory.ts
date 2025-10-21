// Service factory to switch between real and mock implementations
import { KubernetesService, KubernetesConfig } from './kubernetes';
import { MockKubernetesService } from './kubernetes.mock';
import { AzureService, AzureCredentials } from './azure';
import { MockAzureService } from './azure.mock';
import { ClientSecretCredential, DefaultAzureCredential } from '@azure/identity';

export interface ServiceFactoryConfig {
  useMocks: boolean;
  azure?: {
    subscriptionId: string;
    credentials?: AzureCredentials;
  };
  kubernetes?: KubernetesConfig;
}

export class ServiceFactory {
  private config: ServiceFactoryConfig;

  constructor(config: ServiceFactoryConfig) {
    this.config = config;
  }

  /**
   * Create Kubernetes service instance (real or mock based on configuration)
   */
  createKubernetesService(): KubernetesService | MockKubernetesService {
    if (this.config.useMocks) {
      if (this.config.kubernetes?.kubeconfig) {
        return MockKubernetesService.fromKubeconfig(
          this.config.kubernetes.kubeconfig,
          this.config.kubernetes.context
        );
      }
      return MockKubernetesService.fromDefaultConfig();
    } else {
      if (this.config.kubernetes?.kubeconfig) {
        return KubernetesService.fromKubeconfig(
          this.config.kubernetes.kubeconfig,
          this.config.kubernetes.context
        );
      }
      return KubernetesService.fromDefaultConfig();
    }
  }

  /**
   * Create Azure service instance (real or mock based on configuration)
   */
  createAzureService(): AzureService | MockAzureService {
    if (!this.config.azure?.subscriptionId) {
      throw new Error('Azure subscription ID is required');
    }

    if (this.config.useMocks) {
      if (this.config.azure.credentials) {
        return MockAzureService.fromCredentials(
          this.config.azure.credentials,
          this.config.azure.subscriptionId
        );
      }
      return MockAzureService.fromDefaultCredentials(this.config.azure.subscriptionId);
    } else {
      if (this.config.azure.credentials) {
        return AzureService.fromCredentials(
          this.config.azure.credentials,
          this.config.azure.subscriptionId
        );
      }
      return AzureService.fromDefaultCredentials(this.config.azure.subscriptionId);
    }
  }

  /**
   * Check if the factory is configured to use mock services
   */
  isUsingMocks(): boolean {
    return this.config.useMocks;
  }

  /**
   * Get the current configuration
   */
  getConfig(): ServiceFactoryConfig {
    return { ...this.config };
  }

  /**
   * Update the configuration
   */
  updateConfig(newConfig: Partial<ServiceFactoryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Environment-based factory creation
export function createServiceFactoryFromEnv(): ServiceFactory {
  const useMocks = process.env.USE_MOCK_SERVICES === 'true' || (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_SERVICES !== 'false');
  
  const config: ServiceFactoryConfig = {
    useMocks,
    azure: {
      subscriptionId: process.env.AZURE_SUBSCRIPTION_ID || 'mock-subscription-id',
      credentials: process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID ? {
        clientId: process.env.AZURE_CLIENT_ID,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        tenantId: process.env.AZURE_TENANT_ID
      } : undefined
    },
    kubernetes: {
      kubeconfig: process.env.KUBECONFIG,
      context: process.env.KUBE_CONTEXT
    }
  };

  return new ServiceFactory(config);
}

// Default factory instance for easy importing
export const serviceFactory = createServiceFactoryFromEnv();

// Type guard functions to help with TypeScript type checking
export function isKubernetesService(service: KubernetesService | MockKubernetesService): service is KubernetesService {
  return !serviceFactory.isUsingMocks();
}

export function isMockKubernetesService(service: KubernetesService | MockKubernetesService): service is MockKubernetesService {
  return serviceFactory.isUsingMocks();
}

export function isAzureService(service: AzureService | MockAzureService): service is AzureService {
  return !serviceFactory.isUsingMocks();
}

export function isMockAzureService(service: AzureService | MockAzureService): service is MockAzureService {
  return serviceFactory.isUsingMocks();
}
