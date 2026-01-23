/**
 * Node Type System - Main Export Module
 * 
 * This is the main entry point for the node type system.
 * Import everything you need from this single module.
 * 
 * @module nodeTypeSystem
 * 
 * @example
 * // Import types and helpers
 * import { NodeTypeHelper, NodeTypes, AzureSubtypes } from './types/nodeTypeSystem';
 * 
 * @example
 * // Use type detection
 * if (NodeTypeHelper.isAzure(node.nodeType)) {
 *   // Handle Azure node
 * }
 */

// Core type definitions
export {
  type NodeTypeDefinition,
  type NodeCapabilities,
  type ConfigField,
  type MessageProtocol,
  type RegisteredNodeType,
  type NodeTypeRegistry,
  type NodeType,
  type AzureSubtype,
  type KubernetesSubtype,
  type KafkaSubtype,
  type GCPSubtype,
  NodeTypes,
  AzureSubtypes,
  KubernetesSubtypes,
  KafkaSubtypes,
  GCPSubtypes,
  ServiceBusVariants,
  LEGACY_TYPE_MAP
} from './nodeTypes';

// Registry
export {
  NODE_TYPE_REGISTRY,
  IMMUTABLE_NODE_TYPE_REGISTRY,
  getRegistryEntry,
  getRegistryEntriesByType,
  getRegistryEntriesByCategory,
  searchRegistryByTags,
  getAllCategories,
  validateRegistry
} from './nodeTypeRegistry';

// Helper utilities
export {
  NodeTypeHelper,
  isAzure,
  isKubernetes,
  isKafka,
  isGCP,
  fromLegacyType,
  toLegacyType
} from '../utils/nodeTypeHelpers';
