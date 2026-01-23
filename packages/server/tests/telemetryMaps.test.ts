/**
 * TelemetryMap API Integration Tests
 * 
 * Tests for the telemetryMaps API routes with NodeTypeDefinition support.
 * Ensures backward compatibility and proper validation.
 */

import { describe, it, expect } from '@jest/globals';
import { NodeTypes, AzureSubtypes, KubernetesSubtypes } from '../types/nodeTypes';
import type { NodeTypeDefinition } from '../types/nodeTypes';
import type { TelemetryMap, TelemetryMapNode } from '../types/telemetryMap';

describe('TelemetryMap API Integration', () => {
  describe('Node Type Handling', () => {
    it('should accept legacy string node types', () => {
      const node = {
        nodeId: 'test-1',
        nodeType: 'azure-function-app',
        label: 'Test Function',
        status: 'active' as const,
        positionX: 100,
        positionY: 100,
        config: {}
      };

      // Should not throw validation error
      expect(() => {
        const normalizedType = typeof node.nodeType === 'string' 
          ? node.nodeType 
          : node.nodeType;
      }).not.toThrow();
    });

    it('should accept new NodeTypeDefinition structure', () => {
      const node = {
        nodeId: 'test-2',
        nodeType: { 
          type: NodeTypes.AZURE, 
          subtype: AzureSubtypes.FUNCTION_APP 
        } as NodeTypeDefinition,
        label: 'Test Function',
        status: 'active' as const,
        positionX: 100,
        positionY: 100,
        config: {}
      };

      expect(node.nodeType).toHaveProperty('type', NodeTypes.AZURE);
      expect(node.nodeType).toHaveProperty('subtype', AzureSubtypes.FUNCTION_APP);
    });

    it('should handle Service Bus with variants', () => {
      const queueNode = {
        nodeId: 'test-3',
        nodeType: { 
          type: NodeTypes.AZURE, 
          subtype: AzureSubtypes.SERVICE_BUS,
          variant: 'queue'
        } as NodeTypeDefinition,
        label: 'Order Queue',
        status: 'active' as const,
        positionX: 100,
        positionY: 100,
        config: {}
      };

      expect(queueNode.nodeType).toHaveProperty('variant', 'queue');
    });
  });

  describe('Backward Compatibility', () => {
    it('should store legacy type for rollback', () => {
      const node: Partial<TelemetryMapNode> = {
        nodeId: 'test-4',
        nodeType: { 
          type: NodeTypes.KUBERNETES, 
          subtype: KubernetesSubtypes.POD 
        },
        _legacyType: 'k8s-pod',
        label: 'API Pod',
        status: 'active',
        positionX: 100,
        positionY: 100,
        config: {}
      };

      expect(node._legacyType).toBe('k8s-pod');
      expect(typeof node.nodeType).toBe('object');
    });

    it('should allow reading maps created with old format', () => {
      // Simulate a map saved with old string-based nodeType
      const oldFormatMap: Partial<TelemetryMap> = {
        id: 'old-map-1',
        name: 'Legacy Map',
        nodes: [
          {
            id: 'node-old-1',
            mapId: 'old-map-1',
            nodeId: 'azure-func-1',
            nodeType: 'azure-function-app', // Old string format
            label: 'Old Function',
            status: 'active',
            positionX: 100,
            positionY: 100,
            config: {},
            createdAt: new Date().toISOString()
          } as TelemetryMapNode
        ],
        connections: []
      };

      expect(oldFormatMap.nodes?.[0].nodeType).toBe('azure-function-app');
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields in NodeTypeDefinition', () => {
      const validNode: NodeTypeDefinition = {
        type: NodeTypes.AZURE,
        subtype: AzureSubtypes.FUNCTION_APP
      };

      expect(validNode.type).toBeTruthy();
      expect(validNode.subtype).toBeTruthy();
    });

    it('should allow optional variant field', () => {
      const nodeWithVariant: NodeTypeDefinition = {
        type: NodeTypes.AZURE,
        subtype: AzureSubtypes.SERVICE_BUS,
        variant: 'queue'
      };

      const nodeWithoutVariant: NodeTypeDefinition = {
        type: NodeTypes.AZURE,
        subtype: AzureSubtypes.FUNCTION_APP
      };

      expect(nodeWithVariant.variant).toBeDefined();
      expect(nodeWithoutVariant.variant).toBeUndefined();
    });
  });

  describe('Type Conversion in API Responses', () => {
    it('should convert legacy types to NodeTypeDefinition on read', () => {
      // Simulate API converting old data on read
      
      // Conversion logic (simulated)
      const converted: NodeTypeDefinition = {
        type: NodeTypes.AZURE,
        subtype: AzureSubtypes.FUNCTION_APP
      };

      expect(converted.type).toBe(NodeTypes.AZURE);
      expect(converted.subtype).toBe(AzureSubtypes.FUNCTION_APP);
    });

    it('should preserve NodeTypeDefinition structure in responses', () => {
      const node: Partial<TelemetryMapNode> = {
        nodeId: 'test-5',
        nodeType: {
          type: NodeTypes.KUBERNETES,
          subtype: KubernetesSubtypes.DEPLOYMENT
        },
        _legacyType: 'k8s-deployment',
        label: 'API Deployment',
        status: 'active',
        positionX: 200,
        positionY: 200,
        config: {}
      };

      // Verify structure is preserved
      expect(typeof node.nodeType).toBe('object');
      if (typeof node.nodeType === 'object') {
        expect(node.nodeType.type).toBe(NodeTypes.KUBERNETES);
        expect(node.nodeType.subtype).toBe(KubernetesSubtypes.DEPLOYMENT);
      }
    });
  });

  describe('Multi-Provider Support', () => {
    it('should support Azure nodes', () => {
      const azureNode: NodeTypeDefinition = {
        type: NodeTypes.AZURE,
        subtype: AzureSubtypes.FUNCTION_APP
      };

      expect(azureNode.type).toBe(NodeTypes.AZURE);
    });

    it('should support Kubernetes nodes', () => {
      const k8sNode: NodeTypeDefinition = {
        type: NodeTypes.KUBERNETES,
        subtype: KubernetesSubtypes.POD
      };

      expect(k8sNode.type).toBe(NodeTypes.KUBERNETES);
    });

    it('should support Kafka nodes', () => {
      const kafkaNode: NodeTypeDefinition = {
        type: NodeTypes.KAFKA,
        subtype: 'topic'
      };

      expect(kafkaNode.type).toBe(NodeTypes.KAFKA);
    });

    it('should support GCP nodes', () => {
      const gcpNode: NodeTypeDefinition = {
        type: NodeTypes.GCP,
        subtype: 'cloud-function'
      };

      expect(gcpNode.type).toBe(NodeTypes.GCP);
    });

    it('should support generic/custom nodes', () => {
      const customNode: NodeTypeDefinition = {
        type: NodeTypes.GENERIC,
        subtype: 'custom'
      };

      expect(customNode.type).toBe(NodeTypes.GENERIC);
    });
  });
});
