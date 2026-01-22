import {
  ServiceFactory,
  createServiceFactoryFromEnv,
  isKubernetesService,
  isMockKubernetesService,
  isAzureService,
  isMockAzureService,
  isGitHubService,
  isMockGitHubService,
  isAIChatService,
  isMockAIChatService,
  ServiceFactoryConfig
} from '../services/service-factory';
import { KubernetesService } from '../services/kubernetes';
import { MockKubernetesService } from '../services/kubernetes.mock';
import { AzureService } from '../services/azure';
import { MockAzureService } from '../services/azure.mock';
import { GitHubService } from '../services/github';
import { MockGitHubService } from '../services/github.mock';
import { AIChatService } from '../services/aichat';
import { MockAIChatService } from '../services/aichat.mock';

describe('ServiceFactory', () => {
  describe('Constructor', () => {
    it('should create factory instance with config', () => {
      const config: ServiceFactoryConfig = {
        useMocks: true,
        azure: {
          subscriptionId: 'test-sub-id',
        },
        github: {
          token: 'test-token',
        },
      };

      const factory = new ServiceFactory(config);
      expect(factory).toBeInstanceOf(ServiceFactory);
    });
  });

  describe('Kubernetes Service Creation', () => {
    it('should create mock Kubernetes service when useMocks is true', () => {
      const factory = new ServiceFactory({
        useMocks: true,
      });

      const service = factory.createKubernetesService();
      expect(service).toBeInstanceOf(MockKubernetesService);
      expect(isMockKubernetesService(service)).toBe(true);
    });

    it('should create real Kubernetes service when useMocks is false', () => {
      const factory = new ServiceFactory({
        useMocks: false,
      });

      const service = factory.createKubernetesService();
      expect(service).toBeInstanceOf(KubernetesService);
      expect(isKubernetesService(service)).toBe(true);
    });

    it('should create Kubernetes service with kubeconfig when provided', () => {
      const factory = new ServiceFactory({
        useMocks: true,
        kubernetes: {
          kubeconfigPath: '/path/to/kubeconfig',
          context: 'test-context',
        },
      });

      const service = factory.createKubernetesService();
      expect(service).toBeInstanceOf(MockKubernetesService);
    });
  });

  describe('Azure Service Creation', () => {
    it('should create mock Azure service when useMocks is true', () => {
      const factory = new ServiceFactory({
        useMocks: true,
        azure: {
          subscriptionId: 'test-sub-id',
        },
      });

      const service = factory.createAzureService();
      expect(service).toBeInstanceOf(MockAzureService);
      expect(isMockAzureService(service)).toBe(true);
    });

    it('should create real Azure service when useMocks is false', () => {
      const factory = new ServiceFactory({
        useMocks: false,
        azure: {
          subscriptionId: 'test-sub-id',
        },
      });

      const service = factory.createAzureService();
      expect(service).toBeInstanceOf(AzureService);
      expect(isAzureService(service)).toBe(true);
    });

    it('should throw error when subscription ID is missing', () => {
      const factory = new ServiceFactory({
        useMocks: false,
      });

      expect(() => factory.createAzureService()).toThrow('Azure subscription ID is required');
    });

    it('should create Azure service with credentials when provided', () => {
      const factory = new ServiceFactory({
        useMocks: true,
        azure: {
          subscriptionId: 'test-sub-id',
          credentials: {
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
            tenantId: 'test-tenant-id',
          },
        },
      });

      const service = factory.createAzureService();
      expect(service).toBeInstanceOf(MockAzureService);
    });
  });

  describe('GitHub Service Creation', () => {
    it('should create mock GitHub service when useMocks is true', () => {
      const factory = new ServiceFactory({
        useMocks: true,
        github: {
          token: 'test-token',
        },
      });

      const service = factory.createGitHubService();
      expect(service).toBeInstanceOf(MockGitHubService);
      expect(isMockGitHubService(service)).toBe(true);
    });

    it('should create real GitHub service when useMocks is false', () => {
      const factory = new ServiceFactory({
        useMocks: false,
        github: {
          token: 'test-token',
        },
      });

      const service = factory.createGitHubService();
      expect(service).toBeInstanceOf(GitHubService);
      expect(isGitHubService(service)).toBe(true);
    });

    it('should throw error when GitHub token is missing', () => {
      const factory = new ServiceFactory({
        useMocks: false,
      });

      expect(() => factory.createGitHubService()).toThrow('GitHub token is required');
    });
  });

  describe('AIChat Service Creation', () => {
    it('should create mock AIChat service when useMocks is true', () => {
      const factory = new ServiceFactory({
        useMocks: true,
        aichat: {
          openaiApiKey: 'test-openai-key',
          anthropicApiKey: 'test-anthropic-key',
        },
      });

      const service = factory.createAIChatService();
      expect(service).toBeInstanceOf(MockAIChatService);
      expect(isMockAIChatService(service)).toBe(true);
    });

    it('should create real AIChat service when useMocks is false', () => {
      const factory = new ServiceFactory({
        useMocks: false,
        aichat: {
          openaiApiKey: 'test-openai-key',
        },
      });

      const service = factory.createAIChatService();
      expect(service).toBeInstanceOf(AIChatService);
      expect(isAIChatService(service)).toBe(true);
    });

    it('should create AIChat service with all API keys', () => {
      const factory = new ServiceFactory({
        useMocks: true,
        aichat: {
          openaiApiKey: 'test-openai-key',
          anthropicApiKey: 'test-anthropic-key',
          geminiApiKey: 'test-gemini-key',
          deepseekApiKey: 'test-deepseek-key',
        },
      });

      const service = factory.createAIChatService();
      expect(service).toBeInstanceOf(MockAIChatService);
    });

    it('should create AIChat service without API keys', () => {
      const factory = new ServiceFactory({
        useMocks: true,
      });

      const service = factory.createAIChatService();
      expect(service).toBeInstanceOf(MockAIChatService);
    });
  });

  describe('Configuration Management', () => {
    it('should return current configuration', () => {
      const config: ServiceFactoryConfig = {
        useMocks: true,
        azure: {
          subscriptionId: 'test-sub-id',
        },
        github: {
          token: 'test-token',
        },
      };

      const factory = new ServiceFactory(config);
      const retrievedConfig = factory.getConfig();

      expect(retrievedConfig.useMocks).toBe(true);
      expect(retrievedConfig.azure?.subscriptionId).toBe('test-sub-id');
      expect(retrievedConfig.github?.token).toBe('test-token');
    });

    it('should update configuration', () => {
      const factory = new ServiceFactory({
        useMocks: true,
      });

      factory.updateConfig({
        useMocks: false,
        azure: {
          subscriptionId: 'new-sub-id',
        },
      });

      const config = factory.getConfig();
      expect(config.useMocks).toBe(false);
      expect(config.azure?.subscriptionId).toBe('new-sub-id');
    });

    it('should report if using mocks', () => {
      const mockFactory = new ServiceFactory({ useMocks: true });
      const realFactory = new ServiceFactory({ useMocks: false });

      expect(mockFactory.isUsingMocks()).toBe(true);
      expect(realFactory.isUsingMocks()).toBe(false);
    });
  });

  describe('Environment-based Factory Creation', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should create factory with environment variables', () => {
      process.env.USE_MOCK_SERVICES = 'true';
      process.env.AZURE_SUBSCRIPTION_ID = 'env-sub-id';
      process.env.GITHUB_TOKEN = 'env-token';

      const factory = createServiceFactoryFromEnv();

      expect(factory.isUsingMocks()).toBe(true);
      const config = factory.getConfig();
      expect(config.azure?.subscriptionId).toBe('env-sub-id');
      expect(config.github?.token).toBe('env-token');
    });

    it('should use mock services in development by default', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.USE_MOCK_SERVICES;

      const factory = createServiceFactoryFromEnv();
      expect(factory.isUsingMocks()).toBe(true);
    });

    it('should allow disabling mocks in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.USE_MOCK_SERVICES = 'false';

      const factory = createServiceFactoryFromEnv();
      expect(factory.isUsingMocks()).toBe(false);
    });

    it('should load Azure credentials from environment', () => {
      process.env.AZURE_CLIENT_ID = 'env-client-id';
      process.env.AZURE_CLIENT_SECRET = 'env-client-secret';
      process.env.AZURE_TENANT_ID = 'env-tenant-id';
      process.env.AZURE_SUBSCRIPTION_ID = 'env-sub-id';

      const factory = createServiceFactoryFromEnv();
      const config = factory.getConfig();

      expect(config.azure?.credentials?.clientId).toBe('env-client-id');
      expect(config.azure?.credentials?.clientSecret).toBe('env-client-secret');
      expect(config.azure?.credentials?.tenantId).toBe('env-tenant-id');
    });

    it('should load Kubernetes config from environment', () => {
      process.env.KUBECONFIG = '/path/to/kubeconfig';
      process.env.KUBE_CONTEXT = 'test-context';

      const factory = createServiceFactoryFromEnv();
      const config = factory.getConfig();

      expect(config.kubernetes?.kubeconfigPath).toBe('/path/to/kubeconfig');
      expect(config.kubernetes?.context).toBe('test-context');
    });

    it('should load AIChat config from environment', () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.DEEPSEEK_API_KEY = 'test-deepseek-key';

      const factory = createServiceFactoryFromEnv();
      const config = factory.getConfig();

      expect(config.aichat?.openaiApiKey).toBe('test-openai-key');
      expect(config.aichat?.anthropicApiKey).toBe('test-anthropic-key');
      expect(config.aichat?.geminiApiKey).toBe('test-gemini-key');
      expect(config.aichat?.deepseekApiKey).toBe('test-deepseek-key');
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify KubernetesService', () => {
      const factory = new ServiceFactory({ useMocks: false });
      const service = factory.createKubernetesService();

      expect(isKubernetesService(service)).toBe(true);
      expect(isMockKubernetesService(service)).toBe(false);
    });

    it('should correctly identify MockKubernetesService', () => {
      const factory = new ServiceFactory({ useMocks: true });
      const service = factory.createKubernetesService();

      expect(isMockKubernetesService(service)).toBe(true);
      expect(isKubernetesService(service)).toBe(false);
    });

    it('should correctly identify AzureService', () => {
      const factory = new ServiceFactory({
        useMocks: false,
        azure: { subscriptionId: 'test' },
      });
      const service = factory.createAzureService();

      expect(isAzureService(service)).toBe(true);
      expect(isMockAzureService(service)).toBe(false);
    });

    it('should correctly identify MockAzureService', () => {
      const factory = new ServiceFactory({
        useMocks: true,
        azure: { subscriptionId: 'test' },
      });
      const service = factory.createAzureService();

      expect(isMockAzureService(service)).toBe(true);
      expect(isAzureService(service)).toBe(false);
    });

    it('should correctly identify GitHubService', () => {
      const factory = new ServiceFactory({
        useMocks: false,
        github: { token: 'test' },
      });
      const service = factory.createGitHubService();

      expect(isGitHubService(service)).toBe(true);
      expect(isMockGitHubService(service)).toBe(false);
    });

    it('should correctly identify MockGitHubService', () => {
      const factory = new ServiceFactory({
        useMocks: true,
        github: { token: 'test' },
      });
      const service = factory.createGitHubService();

      expect(isMockGitHubService(service)).toBe(true);
      expect(isGitHubService(service)).toBe(false);
    });

    it('should correctly identify AIChatService', () => {
      const factory = new ServiceFactory({
        useMocks: false,
        aichat: { openaiApiKey: 'test' },
      });
      const service = factory.createAIChatService();

      expect(isAIChatService(service)).toBe(true);
      expect(isMockAIChatService(service)).toBe(false);
    });

    it('should correctly identify MockAIChatService', () => {
      const factory = new ServiceFactory({
        useMocks: true,
        aichat: { openaiApiKey: 'test' },
      });
      const service = factory.createAIChatService();

      expect(isMockAIChatService(service)).toBe(true);
      expect(isAIChatService(service)).toBe(false);
    });
  });
});
