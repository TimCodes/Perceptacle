// Service factory to switch between real and mock implementations
import { KubernetesService, KubernetesConfig } from './kubernetes';
import { MockKubernetesService } from './kubernetes.mock';
import { AzureService, AzureCredentials } from './azure';
import { MockAzureService } from './azure.mock';
import { GitHubService, GitHubCredentials } from './github';
import { MockGitHubService } from './github.mock';
import { OracleService, OracleCredentials } from './oracle';
import { MockOracleService } from './oracle.mock';
import { AIChatService, AIChatCredentials } from './aichat';
import { MockAIChatService } from './aichat.mock';
import { ClientSecretCredential, DefaultAzureCredential } from '@azure/identity';

export interface ServiceFactoryConfig {
  useMocks: boolean;
  azure?: {
    subscriptionId: string;
    credentials?: AzureCredentials;
  };
  kubernetes?: KubernetesConfig;
  github?: {
    token: string;
  };
  oracle?: {
    credentials?: OracleCredentials;
  aichat?: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    geminiApiKey?: string;
    deepseekApiKey?: string;
  };
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
   * Create GitHub service instance (real or mock based on configuration)
   */
  createGitHubService(): GitHubService | MockGitHubService {
    if (!this.config.github?.token) {
      throw new Error('GitHub token is required');
    }

    const credentials: GitHubCredentials = {
      token: this.config.github.token
    };

    if (this.config.useMocks) {
      return new MockGitHubService(credentials);
    } else {
      return new GitHubService(credentials);
    }
  }

  /**
   * Create Oracle service instance (real or mock based on configuration)
   */
  createOracleService(): OracleService | MockOracleService {
    if (!this.config.oracle?.credentials) {
      throw new Error('Oracle credentials are required');
    }

    const credentials = this.config.oracle.credentials;

    if (this.config.useMocks) {
      return MockOracleService.fromCredentials(credentials);
    } else {
      return OracleService.fromCredentials(credentials);
   * Create AIChat service instance (real or mock based on configuration)
   */
  createAIChatService(): AIChatService | MockAIChatService {
    const credentials: AIChatCredentials = {
      openaiApiKey: this.config.aichat?.openaiApiKey,
      anthropicApiKey: this.config.aichat?.anthropicApiKey,
      geminiApiKey: this.config.aichat?.geminiApiKey,
      deepseekApiKey: this.config.aichat?.deepseekApiKey,
    };

    if (this.config.useMocks) {
      return new MockAIChatService(credentials);
    } else {
      return new AIChatService(credentials);
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
    },
    github: {
      token: process.env.GITHUB_TOKEN || 'mock-github-token'
    },
    oracle: {
      credentials: process.env.ORACLE_TENANCY && process.env.ORACLE_USER && process.env.ORACLE_FINGERPRINT && process.env.ORACLE_PRIVATE_KEY && process.env.ORACLE_REGION ? {
        tenancy: process.env.ORACLE_TENANCY,
        user: process.env.ORACLE_USER,
        fingerprint: process.env.ORACLE_FINGERPRINT,
        privateKey: process.env.ORACLE_PRIVATE_KEY,
        region: process.env.ORACLE_REGION
      } : {
        tenancy: 'ocid1.tenancy.oc1..mock',
        user: 'ocid1.user.oc1..mock',
        fingerprint: 'mock:fingerprint',
        privateKey: 'mock-private-key',
        region: 'us-phoenix-1'
      }
    aichat: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      geminiApiKey: process.env.GEMINI_API_KEY,
      deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    }
  };

  return new ServiceFactory(config);
}

// Default factory instance for easy importing
export const serviceFactory = createServiceFactoryFromEnv();

// Type guard functions to help with TypeScript type checking
export function isKubernetesService(service: KubernetesService | MockKubernetesService): service is KubernetesService {
  return service instanceof KubernetesService;
}

export function isMockKubernetesService(service: KubernetesService | MockKubernetesService): service is MockKubernetesService {
  return service instanceof MockKubernetesService;
}

export function isAzureService(service: AzureService | MockAzureService): service is AzureService {
  return service instanceof AzureService;
}

export function isMockAzureService(service: AzureService | MockAzureService): service is MockAzureService {
  return service instanceof MockAzureService;
}

export function isGitHubService(service: GitHubService | MockGitHubService): service is GitHubService {
  return service instanceof GitHubService;
}

export function isMockGitHubService(service: GitHubService | MockGitHubService): service is MockGitHubService {
  return service instanceof MockGitHubService;
}

export function isOracleService(service: OracleService | MockOracleService): service is OracleService {
  return service instanceof OracleService;
}

export function isMockOracleService(service: OracleService | MockOracleService): service is MockOracleService {
  return service instanceof MockOracleService;
export function isAIChatService(service: AIChatService | MockAIChatService): service is AIChatService {
  return service instanceof AIChatService;
}

export function isMockAIChatService(service: AIChatService | MockAIChatService): service is MockAIChatService {
  return service instanceof MockAIChatService;
}
