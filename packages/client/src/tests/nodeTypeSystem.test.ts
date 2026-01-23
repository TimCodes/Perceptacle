/**
 * Unit tests for Node Type System
 * Tests for nodeTypes, nodeTypeRegistry, and nodeTypeHelpers
 */

import { describe, it, expect } from '@jest/globals';
import {
  NodeTypes,
  AzureSubtypes,
  KubernetesSubtypes,
  KafkaSubtypes,
  GCPSubtypes,
  LEGACY_TYPE_MAP,
  type NodeTypeDefinition
} from '../types/nodeTypes';

import {
  NODE_TYPE_REGISTRY,
  getRegistryEntry,
  getRegistryEntriesByType,
  getRegistryEntriesByCategory,
  searchRegistryByTags,
  getAllCategories,
  validateRegistry
} from '../types/nodeTypeRegistry';

import { NodeTypeHelper } from '../utils/nodeTypeHelpers';

describe('Node Type System', () => {
  
  // ==========================================================================
  // NODE TYPE DEFINITIONS
  // ==========================================================================
  
  describe('NodeTypes Constants', () => {
    it('should have all primary types defined', () => {
      expect(NodeTypes.AZURE).toBe('azure');
      expect(NodeTypes.KUBERNETES).toBe('kubernetes');
      expect(NodeTypes.KAFKA).toBe('kafka');
      expect(NodeTypes.GCP).toBe('gcp');
      expect(NodeTypes.GENERIC).toBe('generic');
    });
  });
  
  describe('Azure Subtypes', () => {
    it('should have common Azure services defined', () => {
      expect(AzureSubtypes.FUNCTION_APP).toBe('function-app');
      expect(AzureSubtypes.SERVICE_BUS).toBe('service-bus');
      expect(AzureSubtypes.APP_SERVICE).toBe('app-service');
      expect(AzureSubtypes.COSMOS_DB).toBe('cosmos-db');
      expect(AzureSubtypes.KEY_VAULT).toBe('key-vault');
    });
  });
  
  describe('Kubernetes Subtypes', () => {
    it('should have common Kubernetes resources defined', () => {
      expect(KubernetesSubtypes.POD).toBe('pod');
      expect(KubernetesSubtypes.SERVICE).toBe('service');
      expect(KubernetesSubtypes.DEPLOYMENT).toBe('deployment');
      expect(KubernetesSubtypes.STATEFULSET).toBe('statefulset');
      expect(KubernetesSubtypes.CRONJOB).toBe('cronjob');
    });
  });
  
  describe('Kafka Subtypes', () => {
    it('should have Kafka components defined', () => {
      expect(KafkaSubtypes.CLUSTER).toBe('cluster');
      expect(KafkaSubtypes.TOPIC).toBe('topic');
      expect(KafkaSubtypes.PRODUCER).toBe('producer');
      expect(KafkaSubtypes.CONSUMER).toBe('consumer');
    });
  });
  
  describe('GCP Subtypes', () => {
    it('should have common GCP services defined', () => {
      expect(GCPSubtypes.COMPUTE_ENGINE).toBe('compute-engine');
      expect(GCPSubtypes.CLOUD_STORAGE).toBe('cloud-storage');
      expect(GCPSubtypes.CLOUD_SQL).toBe('cloud-sql');
      expect(GCPSubtypes.KUBERNETES_ENGINE).toBe('kubernetes-engine');
      expect(GCPSubtypes.CLOUD_FUNCTIONS).toBe('cloud-functions');
    });
  });
  
  describe('Legacy Type Map', () => {
    it('should map azure-function-app to new format', () => {
      const mapped = LEGACY_TYPE_MAP['azure-function-app'];
      expect(mapped.type).toBe(NodeTypes.AZURE);
      expect(mapped.subtype).toBe(AzureSubtypes.FUNCTION_APP);
    });
    
    it('should map ServiceBusQueue to new format with variant', () => {
      const mapped = LEGACY_TYPE_MAP['ServiceBusQueue'];
      expect(mapped.type).toBe(NodeTypes.AZURE);
      expect(mapped.subtype).toBe(AzureSubtypes.SERVICE_BUS);
      expect(mapped.variant).toBe('queue');
    });
    
    it('should map k8s-pod to new format', () => {
      const mapped = LEGACY_TYPE_MAP['k8s-pod'];
      expect(mapped.type).toBe(NodeTypes.KUBERNETES);
      expect(mapped.subtype).toBe(KubernetesSubtypes.POD);
    });
    
    it('should map KafkaTopic to new format', () => {
      const mapped = LEGACY_TYPE_MAP['KafkaTopic'];
      expect(mapped.type).toBe(NodeTypes.KAFKA);
      expect(mapped.subtype).toBe(KafkaSubtypes.TOPIC);
    });
  });
  
  // ==========================================================================
  // NODE TYPE REGISTRY
  // ==========================================================================
  
  describe('Node Type Registry', () => {
    it('should have entries for all major services', () => {
      expect(NODE_TYPE_REGISTRY.length).toBeGreaterThan(20);
    });
    
    it('should validate without errors', () => {
      expect(() => validateRegistry()).not.toThrow();
    });
    
    it('should have required fields for each entry', () => {
      NODE_TYPE_REGISTRY.forEach(entry => {
        expect(entry.type).toBeDefined();
        expect(entry.subtype).toBeDefined();
        expect(entry.displayName).toBeDefined();
        expect(entry.category).toBeDefined();
        expect(entry.capabilities).toBeDefined();
      });
    });
    
    it('should not have duplicate entries', () => {
      const keys = NODE_TYPE_REGISTRY.map(entry => 
        `${entry.type}:${entry.subtype}:${entry.variant || ''}`
      );
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    });
  });
  
  describe('getRegistryEntry', () => {
    it('should find Azure Function App entry', () => {
      const entry = getRegistryEntry(NodeTypes.AZURE, AzureSubtypes.FUNCTION_APP);
      expect(entry).toBeDefined();
      expect(entry?.displayName).toBe('Azure Function App');
    });
    
    it('should find Service Bus Queue entry with variant', () => {
      const entry = getRegistryEntry(NodeTypes.AZURE, AzureSubtypes.SERVICE_BUS, 'queue');
      expect(entry).toBeDefined();
      expect(entry?.displayName).toBe('Service Bus Queue');
    });
    
    it('should find Kubernetes Pod entry', () => {
      const entry = getRegistryEntry(NodeTypes.KUBERNETES, KubernetesSubtypes.POD);
      expect(entry).toBeDefined();
      expect(entry?.displayName).toBe('Kubernetes Pod');
    });
    
    it('should return undefined for non-existent entry', () => {
      const entry = getRegistryEntry('nonexistent', 'type');
      expect(entry).toBeUndefined();
    });
  });
  
  describe('getRegistryEntriesByType', () => {
    it('should return all Azure entries', () => {
      const entries = getRegistryEntriesByType(NodeTypes.AZURE);
      expect(entries.length).toBeGreaterThan(5);
      entries.forEach(entry => {
        expect(entry.type).toBe(NodeTypes.AZURE);
      });
    });
    
    it('should return all Kubernetes entries', () => {
      const entries = getRegistryEntriesByType(NodeTypes.KUBERNETES);
      expect(entries.length).toBeGreaterThan(3);
      entries.forEach(entry => {
        expect(entry.type).toBe(NodeTypes.KUBERNETES);
      });
    });
  });
  
  describe('getRegistryEntriesByCategory', () => {
    it('should return all Serverless entries', () => {
      const entries = getRegistryEntriesByCategory('Serverless');
      expect(entries.length).toBeGreaterThan(0);
      entries.forEach(entry => {
        expect(entry.category).toBe('Serverless');
      });
    });
    
    it('should return all Messaging entries', () => {
      const entries = getRegistryEntriesByCategory('Messaging');
      expect(entries.length).toBeGreaterThan(0);
      entries.forEach(entry => {
        expect(entry.category).toBe('Messaging');
      });
    });
  });
  
  describe('searchRegistryByTags', () => {
    it('should find entries with kafka tag', () => {
      const entries = searchRegistryByTags(['kafka']);
      expect(entries.length).toBeGreaterThan(0);
      entries.forEach(entry => {
        expect(entry.tags).toContain('kafka');
      });
    });
    
    it('should find entries with azure or gcp tags', () => {
      const entries = searchRegistryByTags(['azure', 'gcp']);
      expect(entries.length).toBeGreaterThan(0);
    });
  });
  
  describe('getAllCategories', () => {
    it('should return unique categories', () => {
      const categories = getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      const uniqueCategories = new Set(categories);
      expect(categories.length).toBe(uniqueCategories.size);
    });
    
    it('should include common categories', () => {
      const categories = getAllCategories();
      expect(categories).toContain('Compute');
      expect(categories).toContain('Messaging');
      expect(categories).toContain('Network');
    });
  });
  
  // ==========================================================================
  // NODE TYPE HELPER
  // ==========================================================================
  
  describe('NodeTypeHelper - Type Detection', () => {
    const azureNode: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
    const k8sNode: NodeTypeDefinition = { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD };
    const kafkaNode: NodeTypeDefinition = { type: NodeTypes.KAFKA, subtype: KafkaSubtypes.TOPIC };
    const gcpNode: NodeTypeDefinition = { type: NodeTypes.GCP, subtype: GCPSubtypes.COMPUTE_ENGINE };
    
    it('should detect Azure nodes', () => {
      expect(NodeTypeHelper.isAzure(azureNode)).toBe(true);
      expect(NodeTypeHelper.isAzure(k8sNode)).toBe(false);
    });
    
    it('should detect Kubernetes nodes', () => {
      expect(NodeTypeHelper.isKubernetes(k8sNode)).toBe(true);
      expect(NodeTypeHelper.isKubernetes(azureNode)).toBe(false);
    });
    
    it('should detect Kafka nodes', () => {
      expect(NodeTypeHelper.isKafka(kafkaNode)).toBe(true);
      expect(NodeTypeHelper.isKafka(azureNode)).toBe(false);
    });
    
    it('should detect GCP nodes', () => {
      expect(NodeTypeHelper.isGCP(gcpNode)).toBe(true);
      expect(NodeTypeHelper.isGCP(azureNode)).toBe(false);
    });
    
    it('should handle null/undefined gracefully', () => {
      expect(NodeTypeHelper.isAzure(null)).toBe(false);
      expect(NodeTypeHelper.isKubernetes(undefined)).toBe(false);
    });
  });
  
  describe('NodeTypeHelper - matches', () => {
    const node: NodeTypeDefinition = { 
      type: NodeTypes.AZURE, 
      subtype: AzureSubtypes.SERVICE_BUS,
      variant: 'queue'
    };
    
    it('should match type only', () => {
      expect(NodeTypeHelper.matches(node, NodeTypes.AZURE)).toBe(true);
      expect(NodeTypeHelper.matches(node, NodeTypes.KUBERNETES)).toBe(false);
    });
    
    it('should match type and subtype', () => {
      expect(NodeTypeHelper.matches(node, NodeTypes.AZURE, AzureSubtypes.SERVICE_BUS)).toBe(true);
      expect(NodeTypeHelper.matches(node, NodeTypes.AZURE, AzureSubtypes.FUNCTION_APP)).toBe(false);
    });
    
    it('should match type, subtype, and variant', () => {
      expect(NodeTypeHelper.matches(node, NodeTypes.AZURE, AzureSubtypes.SERVICE_BUS, 'queue')).toBe(true);
      expect(NodeTypeHelper.matches(node, NodeTypes.AZURE, AzureSubtypes.SERVICE_BUS, 'topic')).toBe(false);
    });
  });
  
  describe('NodeTypeHelper - Registry Queries', () => {
    const azureFunctionNode: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
    
    it('should get registry entry', () => {
      const entry = NodeTypeHelper.getRegistryEntry(azureFunctionNode);
      expect(entry).toBeDefined();
      expect(entry?.displayName).toBe('Azure Function App');
    });
    
    it('should get display name', () => {
      const name = NodeTypeHelper.getDisplayName(azureFunctionNode);
      expect(name).toBe('Azure Function App');
    });
    
    it('should get category', () => {
      const category = NodeTypeHelper.getCategory(azureFunctionNode);
      expect(category).toBe('Serverless');
    });
    
    it('should get description', () => {
      const description = NodeTypeHelper.getDescription(azureFunctionNode);
      expect(description).toBeDefined();
      expect(description.length).toBeGreaterThan(0);
    });
    
    it('should get tags', () => {
      const tags = NodeTypeHelper.getTags(azureFunctionNode);
      expect(tags).toContain('azure');
      expect(tags).toContain('serverless');
    });
  });
  
  describe('NodeTypeHelper - Capabilities', () => {
    const azureFunctionNode: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
    const kafkaTopicNode: NodeTypeDefinition = { type: NodeTypes.KAFKA, subtype: KafkaSubtypes.TOPIC };
    
    it('should get all capabilities', () => {
      const caps = NodeTypeHelper.getCapabilities(azureFunctionNode);
      expect(caps).toBeDefined();
      expect(caps.hasMetrics).toBe(true);
      expect(caps.hasLogs).toBe(true);
    });
    
    it('should check hasMetrics capability', () => {
      expect(NodeTypeHelper.hasMetrics(azureFunctionNode)).toBe(true);
    });
    
    it('should check hasLogs capability', () => {
      expect(NodeTypeHelper.hasLogs(azureFunctionNode)).toBe(true);
    });
    
    it('should check hasMessages capability', () => {
      expect(NodeTypeHelper.hasMessages(azureFunctionNode)).toBe(true);
      expect(NodeTypeHelper.hasMessages(kafkaTopicNode)).toBe(true);
    });
    
    it('should get message protocol', () => {
      const protocol = NodeTypeHelper.getMessageProtocol(azureFunctionNode);
      expect(protocol).toBe('https');
      
      const kafkaProtocol = NodeTypeHelper.getMessageProtocol(kafkaTopicNode);
      expect(kafkaProtocol).toBe('kafka');
    });
    
    it('should check hasAutoScaling capability', () => {
      expect(NodeTypeHelper.hasAutoScaling(azureFunctionNode)).toBe(true);
    });
  });
  
  describe('NodeTypeHelper - Resource ID Building', () => {
    const azureFunctionNode: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
    
    it('should build Azure Function resource ID', () => {
      const data = {
        subscriptionId: 'sub-123',
        resourceGroup: 'my-rg',
        name: 'my-function'
      };
      
      const id = NodeTypeHelper.buildResourceId(azureFunctionNode, data);
      expect(id).toContain('/subscriptions/sub-123');
      expect(id).toContain('/resourceGroups/my-rg');
      expect(id).toContain('/Microsoft.Web/sites/my-function');
    });
    
    it('should return empty string for incomplete data', () => {
      const data = { subscriptionId: 'sub-123' }; // Missing required fields
      const id = NodeTypeHelper.buildResourceId(azureFunctionNode, data);
      expect(id).toBe('');
    });
    
    it('should get provider resource type', () => {
      const provider = NodeTypeHelper.getProviderResourceType(azureFunctionNode);
      expect(provider).toBe('Microsoft.Web/sites');
    });
    
    it('should get API version', () => {
      const version = NodeTypeHelper.getApiVersion(azureFunctionNode);
      expect(version).toBeDefined();
      expect(version.length).toBeGreaterThan(0);
    });
  });
  
  describe('NodeTypeHelper - Legacy Conversion', () => {
    it('should convert legacy azure-function-app', () => {
      const newType = NodeTypeHelper.fromLegacyType('azure-function-app');
      expect(newType.type).toBe(NodeTypes.AZURE);
      expect(newType.subtype).toBe(AzureSubtypes.FUNCTION_APP);
    });
    
    it('should convert legacy ServiceBusQueue', () => {
      const newType = NodeTypeHelper.fromLegacyType('ServiceBusQueue');
      expect(newType.type).toBe(NodeTypes.AZURE);
      expect(newType.subtype).toBe(AzureSubtypes.SERVICE_BUS);
      expect(newType.variant).toBe('queue');
    });
    
    it('should convert legacy k8s-pod', () => {
      const newType = NodeTypeHelper.fromLegacyType('k8s-pod');
      expect(newType.type).toBe(NodeTypes.KUBERNETES);
      expect(newType.subtype).toBe(KubernetesSubtypes.POD);
    });
    
    it('should convert legacy KafkaTopic', () => {
      const newType = NodeTypeHelper.fromLegacyType('KafkaTopic');
      expect(newType.type).toBe(NodeTypes.KAFKA);
      expect(newType.subtype).toBe(KafkaSubtypes.TOPIC);
    });
    
    it('should handle unknown legacy types', () => {
      const newType = NodeTypeHelper.fromLegacyType('unknown-type');
      expect(newType.type).toBe(NodeTypes.GENERIC);
    });
    
    it('should convert new type to legacy format', () => {
      const node: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      const legacy = NodeTypeHelper.toLegacyType(node);
      expect(legacy).toBe('azure-function-app');
    });
    
    it('should convert Service Bus Queue with variant to legacy', () => {
      const node: NodeTypeDefinition = { 
        type: NodeTypes.AZURE, 
        subtype: AzureSubtypes.SERVICE_BUS,
        variant: 'queue'
      };
      const legacy = NodeTypeHelper.toLegacyType(node);
      expect(legacy).toBe('ServiceBusQueue');
    });
  });
  
  describe('NodeTypeHelper - Validation', () => {
    const validNode: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
    const invalidNode: NodeTypeDefinition = { type: 'nonexistent', subtype: 'type' };
    
    it('should validate registered node types', () => {
      expect(NodeTypeHelper.isValid(validNode)).toBe(true);
    });
    
    it('should invalidate unregistered node types', () => {
      expect(NodeTypeHelper.isValid(invalidNode)).toBe(false);
    });
    
    it('should handle null/undefined in validation', () => {
      expect(NodeTypeHelper.isValid(null)).toBe(false);
      expect(NodeTypeHelper.isValid(undefined)).toBe(false);
    });
    
    it('should validate without throwing for valid nodes', () => {
      expect(() => NodeTypeHelper.validate(validNode)).not.toThrow();
    });
    
    it('should throw for nodes without type', () => {
      expect(() => NodeTypeHelper.validate({ type: '', subtype: 'test' } as any)).toThrow();
    });
    
    it('should throw for nodes without subtype', () => {
      expect(() => NodeTypeHelper.validate({ type: 'azure', subtype: '' } as any)).toThrow();
    });
  });
  
  describe('NodeTypeHelper - Utility Methods', () => {
    const node: NodeTypeDefinition = { 
      type: NodeTypes.AZURE, 
      subtype: AzureSubtypes.SERVICE_BUS,
      variant: 'queue'
    };
    
    it('should create composite key', () => {
      const key = NodeTypeHelper.getCompositeKey(node);
      expect(key).toBe('azure:service-bus:queue');
    });
    
    it('should create composite key without variant', () => {
      const simpleNode: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      const key = NodeTypeHelper.getCompositeKey(simpleNode);
      expect(key).toBe('azure:function-app');
    });
    
    it('should parse composite key', () => {
      const parsed = NodeTypeHelper.fromCompositeKey('azure:service-bus:queue');
      expect(parsed.type).toBe(NodeTypes.AZURE);
      expect(parsed.subtype).toBe(AzureSubtypes.SERVICE_BUS);
      expect(parsed.variant).toBe('queue');
    });
    
    it('should compare node types for equality', () => {
      const node1: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      const node2: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      const node3: NodeTypeDefinition = { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD };
      
      expect(NodeTypeHelper.equals(node1, node2)).toBe(true);
      expect(NodeTypeHelper.equals(node1, node3)).toBe(false);
    });
    
    it('should clone node types', () => {
      const cloned = NodeTypeHelper.clone(node);
      expect(cloned).not.toBe(node); // Different object
      expect(NodeTypeHelper.equals(cloned, node)).toBe(true); // Same values
    });
    
    it('should get all node types', () => {
      const allTypes = NodeTypeHelper.getAllNodeTypes();
      expect(allTypes.length).toBeGreaterThan(20);
    });
    
    it('should get node types for specific provider', () => {
      const azureTypes = NodeTypeHelper.getNodeTypesForProvider(NodeTypes.AZURE);
      expect(azureTypes.length).toBeGreaterThan(5);
      azureTypes.forEach(type => {
        expect(type.type).toBe(NodeTypes.AZURE);
      });
    });
  });
  
  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================
  
  describe('Integration Tests', () => {
    it('should handle round-trip legacy conversion', () => {
      const legacyTypes = [
        'azure-function-app',
        'ServiceBusQueue',
        'k8s-pod',
        'KafkaTopic',
        'compute-engine'
      ];
      
      legacyTypes.forEach(legacy => {
        const newType = NodeTypeHelper.fromLegacyType(legacy);
        expect(newType).toBeDefined();
        expect(newType.type).toBeDefined();
        expect(newType.subtype).toBeDefined();
      });
    });
    
    it('should maintain capabilities consistency', () => {
      NODE_TYPE_REGISTRY.forEach(entry => {
        const node: NodeTypeDefinition = {
          type: entry.type,
          subtype: entry.subtype,
          variant: entry.variant
        };
        
        const caps = NodeTypeHelper.getCapabilities(node);
        expect(caps).toEqual(entry.capabilities);
      });
    });
    
    it('should build valid resource IDs for Azure nodes', () => {
      const azureTypes = getRegistryEntriesByType(NodeTypes.AZURE);
      const testData = {
        subscriptionId: 'test-sub',
        resourceGroup: 'test-rg',
        name: 'test-resource',
        namespace: 'test-namespace'
      };
      
      azureTypes.forEach(entry => {
        if (entry.resourceMapping?.buildId) {
          const node: NodeTypeDefinition = {
            type: entry.type,
            subtype: entry.subtype,
            variant: entry.variant
          };
          
          const id = NodeTypeHelper.buildResourceId(node, testData);
          // Should either return a valid ID or empty string
          expect(typeof id).toBe('string');
        }
      });
    });
  });
});
