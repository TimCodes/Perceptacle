/**
 * Server-Side Node Type Helper Tests
 * 
 * Tests for the server-side NodeTypeHelper utility class.
 * Ensures proper type conversion, validation, and backward compatibility.
 */

import { describe, it, expect } from '@jest/globals';
import { NodeTypeHelper } from '../utils/nodeTypeHelpers';
import { NodeTypes, AzureSubtypes, KubernetesSubtypes, type NodeTypeDefinition } from '../types/nodeTypes';

describe('NodeTypeHelper - Server Side', () => {
  describe('Type Detection', () => {
    it('should detect Azure nodes', () => {
      const azureNode: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      expect(NodeTypeHelper.isAzure(azureNode)).toBe(true);
      expect(NodeTypeHelper.isKubernetes(azureNode)).toBe(false);
    });

    it('should detect Kubernetes nodes', () => {
      const k8sNode: NodeTypeDefinition = { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD };
      expect(NodeTypeHelper.isKubernetes(k8sNode)).toBe(true);
      expect(NodeTypeHelper.isAzure(k8sNode)).toBe(false);
    });

    it('should detect specific subtypes', () => {
      const node: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      expect(NodeTypeHelper.isSubtype(node, AzureSubtypes.FUNCTION_APP)).toBe(true);
      expect(NodeTypeHelper.isSubtype(node, AzureSubtypes.SERVICE_BUS)).toBe(false);
    });

    it('should match type, subtype, and variant', () => {
      const node: NodeTypeDefinition = { 
        type: NodeTypes.AZURE, 
        subtype: AzureSubtypes.SERVICE_BUS,
        variant: 'queue'
      };
      
      expect(NodeTypeHelper.matches(node, NodeTypes.AZURE, AzureSubtypes.SERVICE_BUS, 'queue')).toBe(true);
      expect(NodeTypeHelper.matches(node, NodeTypes.AZURE, AzureSubtypes.SERVICE_BUS, 'topic')).toBe(false);
      expect(NodeTypeHelper.matches(node, NodeTypes.AZURE, AzureSubtypes.SERVICE_BUS)).toBe(true);
    });
  });

  describe('Type Conversion', () => {
    it('should convert legacy Azure types', () => {
      const result = NodeTypeHelper.fromLegacyType('azure-function-app');
      expect(result.type).toBe(NodeTypes.AZURE);
      expect(result.subtype).toBe(AzureSubtypes.FUNCTION_APP);
      expect(result.variant).toBeUndefined();
    });

    it('should convert legacy Kubernetes types', () => {
      const result = NodeTypeHelper.fromLegacyType('k8s-pod');
      expect(result.type).toBe(NodeTypes.KUBERNETES);
      expect(result.subtype).toBe(KubernetesSubtypes.POD);
    });

    it('should convert Service Bus with variants', () => {
      const queueResult = NodeTypeHelper.fromLegacyType('ServiceBusQueue');
      expect(queueResult.type).toBe(NodeTypes.AZURE);
      expect(queueResult.subtype).toBe(AzureSubtypes.SERVICE_BUS);
      expect(queueResult.variant).toBe('queue');

      const topicResult = NodeTypeHelper.fromLegacyType('ServiceBusTopic');
      expect(topicResult.type).toBe(NodeTypes.AZURE);
      expect(topicResult.subtype).toBe(AzureSubtypes.SERVICE_BUS);
      expect(topicResult.variant).toBe('topic');
    });

    it('should handle unknown types with fallback to generic', () => {
      const result = NodeTypeHelper.fromLegacyType('unknown-custom-type');
      expect(result.type).toBe(NodeTypes.GENERIC);
      expect(result.subtype).toBe('custom');
      expect(result.variant).toBe('unknown-custom-type');
    });

    it('should parse pattern-based types', () => {
      const result = NodeTypeHelper.fromLegacyType('mycloud-database');
      expect(result.type).toBe('mycloud');
      expect(result.subtype).toBe('database');
    });

    it('should convert NodeTypeDefinition to legacy string', () => {
      const node: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      const legacy = NodeTypeHelper.toLegacyType(node);
      expect(legacy).toBe('azure-function-app');
    });

    it('should convert NodeTypeDefinition with variant to legacy string', () => {
      const node: NodeTypeDefinition = { 
        type: NodeTypes.AZURE, 
        subtype: AzureSubtypes.SERVICE_BUS,
        variant: 'queue'
      };
      const legacy = NodeTypeHelper.toLegacyType(node);
      expect(legacy).toBe('ServiceBusQueue');
    });

    it('should normalize string types to NodeTypeDefinition', () => {
      const result = NodeTypeHelper.normalize('azure-function-app');
      expect(result.type).toBe(NodeTypes.AZURE);
      expect(result.subtype).toBe(AzureSubtypes.FUNCTION_APP);
    });

    it('should normalize NodeTypeDefinition (pass through)', () => {
      const input: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      const result = NodeTypeHelper.normalize(input);
      expect(result).toEqual(input);
    });

    it('should handle null/undefined in normalize', () => {
      const result = NodeTypeHelper.normalize(null);
      expect(result.type).toBe(NodeTypes.GENERIC);
      expect(result.subtype).toBe('custom');
    });

    it('should safely normalize invalid input', () => {
      expect(NodeTypeHelper.safeNormalize(null)).toBeNull();
      expect(NodeTypeHelper.safeNormalize(undefined)).toBeNull();
      expect(NodeTypeHelper.safeNormalize({})).toBeNull();
      expect(NodeTypeHelper.safeNormalize({ type: 'azure' })).toBeNull();
    });

    it('should safely normalize valid input', () => {
      const result = NodeTypeHelper.safeNormalize('azure-function-app');
      expect(result).not.toBeNull();
      expect(result?.type).toBe(NodeTypes.AZURE);
    });
  });

  describe('Resource ID Generation', () => {
    it('should build resource ID without variant', () => {
      const node: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      const resourceId = NodeTypeHelper.buildResourceId(node);
      expect(resourceId).toBe('azure/function-app');
    });

    it('should build resource ID with variant', () => {
      const node: NodeTypeDefinition = { 
        type: NodeTypes.AZURE, 
        subtype: AzureSubtypes.SERVICE_BUS,
        variant: 'queue'
      };
      const resourceId = NodeTypeHelper.buildResourceId(node);
      expect(resourceId).toBe('azure/service-bus/queue');
    });

    it('should parse resource ID without variant', () => {
      const result = NodeTypeHelper.parseResourceId('azure/function-app');
      expect(result).not.toBeNull();
      expect(result?.type).toBe('azure');
      expect(result?.subtype).toBe('function-app');
      expect(result?.variant).toBeUndefined();
    });

    it('should parse resource ID with variant', () => {
      const result = NodeTypeHelper.parseResourceId('azure/service-bus/queue');
      expect(result).not.toBeNull();
      expect(result?.type).toBe('azure');
      expect(result?.subtype).toBe('service-bus');
      expect(result?.variant).toBe('queue');
    });

    it('should return null for invalid resource ID', () => {
      expect(NodeTypeHelper.parseResourceId('invalid')).toBeNull();
      expect(NodeTypeHelper.parseResourceId('azure')).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should validate correct NodeTypeDefinition', () => {
      const node: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      const result = NodeTypeHelper.validate(node);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate legacy string types', () => {
      const result = NodeTypeHelper.validate('azure-function-app');
      expect(result.valid).toBe(true);
    });

    it('should reject null/undefined', () => {
      const result = NodeTypeHelper.validate(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid structure', () => {
      const result = NodeTypeHelper.validate({ type: 'azure' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('subtype');
    });

    it('should check validity with boolean helper', () => {
      expect(NodeTypeHelper.isValid({ type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP })).toBe(true);
      expect(NodeTypeHelper.isValid(null)).toBe(false);
    });
  });

  describe('Provider Utilities', () => {
    it('should get provider name for Azure', () => {
      const node: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      expect(NodeTypeHelper.getProvider(node)).toBe('Azure');
    });

    it('should get provider name for Kubernetes', () => {
      const node: NodeTypeDefinition = { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD };
      expect(NodeTypeHelper.getProvider(node)).toBe('Kubernetes');
    });

    it('should return null for null node', () => {
      expect(NodeTypeHelper.getProvider(null)).toBeNull();
    });

    it('should get display name without variant', () => {
      const node: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      expect(NodeTypeHelper.getDisplayName(node)).toBe('Azure Function App');
    });

    it('should get display name with variant', () => {
      const node: NodeTypeDefinition = { 
        type: NodeTypes.AZURE, 
        subtype: AzureSubtypes.SERVICE_BUS,
        variant: 'queue'
      };
      expect(NodeTypeHelper.getDisplayName(node)).toBe('Azure Service Bus (Queue)');
    });
  });

  describe('Comparison', () => {
    it('should compare equal nodes', () => {
      const a: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      const b: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      expect(NodeTypeHelper.equals(a, b)).toBe(true);
    });

    it('should compare different nodes', () => {
      const a: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      const b: NodeTypeDefinition = { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD };
      expect(NodeTypeHelper.equals(a, b)).toBe(false);
    });

    it('should compare nodes with different variants', () => {
      const a: NodeTypeDefinition = { 
        type: NodeTypes.AZURE, 
        subtype: AzureSubtypes.SERVICE_BUS,
        variant: 'queue'
      };
      const b: NodeTypeDefinition = { 
        type: NodeTypes.AZURE, 
        subtype: AzureSubtypes.SERVICE_BUS,
        variant: 'topic'
      };
      expect(NodeTypeHelper.equals(a, b)).toBe(false);
    });

    it('should handle null comparisons', () => {
      const node: NodeTypeDefinition = { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP };
      expect(NodeTypeHelper.equals(null, null)).toBe(true);
      expect(NodeTypeHelper.equals(node, null)).toBe(false);
      expect(NodeTypeHelper.equals(null, node)).toBe(false);
    });
  });
});
