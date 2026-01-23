/**
 * Node Type Helper Utilities - Server Side
 * 
 * Provides server-side helper functions for working with the node type system.
 * Includes type detection, conversion, and validation utilities.
 * 
 * @module server/utils/nodeTypeHelpers
 */

import {
  NodeTypes,
  LEGACY_TYPE_MAP,
  type NodeTypeDefinition,
  isNodeTypeDefinition,
  validateNodeType
} from '../types/nodeTypes';

/**
 * Helper class for server-side node type operations.
 * All methods are static and pure functions.
 */
export class NodeTypeHelper {
  
  // ============================================================================
  // TYPE DETECTION
  // ============================================================================
  
  /**
   * Check if a node is an Azure node.
   */
  static isAzure(node: NodeTypeDefinition | null | undefined): boolean {
    return node?.type === NodeTypes.AZURE;
  }
  
  /**
   * Check if a node is a Kubernetes node.
   */
  static isKubernetes(node: NodeTypeDefinition | null | undefined): boolean {
    return node?.type === NodeTypes.KUBERNETES;
  }
  
  /**
   * Check if a node is a Kafka node.
   */
  static isKafka(node: NodeTypeDefinition | null | undefined): boolean {
    return node?.type === NodeTypes.KAFKA;
  }
  
  /**
   * Check if a node is a GCP node.
   */
  static isGCP(node: NodeTypeDefinition | null | undefined): boolean {
    return node?.type === NodeTypes.GCP;
  }
  
  /**
   * Check if a node is a generic/custom node.
   */
  static isGeneric(node: NodeTypeDefinition | null | undefined): boolean {
    return node?.type === NodeTypes.GENERIC;
  }
  
  /**
   * Check if a node is a specific subtype.
   */
  static isSubtype(
    node: NodeTypeDefinition | null | undefined,
    subtype: string
  ): boolean {
    return node?.subtype === subtype;
  }
  
  /**
   * Check if a node matches type, subtype, and optional variant.
   */
  static matches(
    node: NodeTypeDefinition | null | undefined,
    type: string,
    subtype: string,
    variant?: string
  ): boolean {
    if (!node) return false;
    
    const typeMatches = node.type === type;
    const subtypeMatches = node.subtype === subtype;
    const variantMatches = variant === undefined || node.variant === variant;
    
    return typeMatches && subtypeMatches && variantMatches;
  }
  
  // ============================================================================
  // TYPE CONVERSION
  // ============================================================================
  
  /**
   * Convert legacy string type to NodeTypeDefinition.
   * 
   * @param legacyType - Legacy string type (e.g., 'azure-function-app')
   * @returns NodeTypeDefinition
   */
  static fromLegacyType(legacyType: string): NodeTypeDefinition {
    // Check if it's in the legacy map
    if (LEGACY_TYPE_MAP[legacyType]) {
      return LEGACY_TYPE_MAP[legacyType];
    }
    
    // Try to parse common patterns
    // Pattern: "provider-service" (e.g., "azure-function-app")
    const parts = legacyType.split('-');
    if (parts.length >= 2) {
      const type = parts[0];
      const subtype = parts.slice(1).join('-');
      
      // Validate it's a known type
      const knownTypes = Object.values(NodeTypes);
      if (knownTypes.includes(type as any)) {
        return { type, subtype };
      }
    }
    
    // Fallback to generic
    return {
      type: NodeTypes.GENERIC,
      subtype: 'custom',
      variant: legacyType
    };
  }
  
  /**
   * Convert NodeTypeDefinition to legacy string type.
   * 
   * @param nodeType - NodeTypeDefinition
   * @returns Legacy string format
   */
  static toLegacyType(nodeType: NodeTypeDefinition): string {
    const { type, subtype, variant } = nodeType;
    
    // Check if this maps to a known legacy type
    for (const [legacyKey, typeDef] of Object.entries(LEGACY_TYPE_MAP)) {
      if (
        typeDef.type === type &&
        typeDef.subtype === subtype &&
        typeDef.variant === variant
      ) {
        return legacyKey;
      }
    }
    
    // Generate legacy format: type-subtype or type-subtype-variant
    if (variant) {
      return `${type}-${subtype}-${variant}`;
    }
    return `${type}-${subtype}`;
  }
  
  /**
   * Normalize a node type (string or NodeTypeDefinition) to NodeTypeDefinition.
   * Useful for handling API inputs that may be in either format.
   */
  static normalize(
    nodeType: string | NodeTypeDefinition | null | undefined
  ): NodeTypeDefinition {
    if (!nodeType) {
      return { type: NodeTypes.GENERIC, subtype: 'custom' };
    }
    
    if (typeof nodeType === 'string') {
      return this.fromLegacyType(nodeType);
    }
    
    return nodeType;
  }
  
  /**
   * Safely convert any node type format to NodeTypeDefinition.
   * Returns null if the input is invalid.
   */
  static safeNormalize(
    nodeType: any
  ): NodeTypeDefinition | null {
    try {
      if (!nodeType) return null;
      
      if (typeof nodeType === 'string') {
        return this.fromLegacyType(nodeType);
      }
      
      if (isNodeTypeDefinition(nodeType)) {
        return nodeType;
      }
      
      return null;
    } catch {
      return null;
    }
  }
  
  // ============================================================================
  // RESOURCE ID GENERATION
  // ============================================================================
  
  /**
   * Build a resource ID string from NodeTypeDefinition.
   * Format: "type/subtype/variant" or "type/subtype"
   */
  static buildResourceId(nodeType: NodeTypeDefinition): string {
    const { type, subtype, variant } = nodeType;
    
    if (variant) {
      return `${type}/${subtype}/${variant}`;
    }
    return `${type}/${subtype}`;
  }
  
  /**
   * Parse a resource ID string into NodeTypeDefinition.
   * Format: "type/subtype/variant" or "type/subtype"
   */
  static parseResourceId(resourceId: string): NodeTypeDefinition | null {
    const parts = resourceId.split('/');
    
    if (parts.length < 2) {
      return null;
    }
    
    return {
      type: parts[0],
      subtype: parts[1],
      variant: parts[2]
    };
  }
  
  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  /**
   * Validate a node type and return validation result.
   */
  static validate(nodeType: any): { valid: boolean; error?: string } {
    return validateNodeType(nodeType);
  }
  
  /**
   * Check if a node type is valid (boolean).
   */
  static isValid(nodeType: any): boolean {
    return validateNodeType(nodeType).valid;
  }
  
  // ============================================================================
  // PROVIDER-SPECIFIC UTILITIES
  // ============================================================================
  
  /**
   * Get the provider name for a node type.
   */
  static getProvider(node: NodeTypeDefinition | null | undefined): string | null {
    if (!node) return null;
    
    switch (node.type) {
      case NodeTypes.AZURE:
        return 'Azure';
      case NodeTypes.KUBERNETES:
        return 'Kubernetes';
      case NodeTypes.KAFKA:
        return 'Kafka';
      case NodeTypes.GCP:
        return 'Google Cloud Platform';
      case NodeTypes.GENERIC:
        return 'Generic';
      default:
        return node.type;
    }
  }
  
  /**
   * Get a human-readable display name for a node type.
   */
  static getDisplayName(nodeType: NodeTypeDefinition): string {
    const { type, subtype, variant } = nodeType;
    
    // Convert kebab-case to Title Case
    const formatPart = (str: string) => {
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
    
    const provider = formatPart(type);
    const service = formatPart(subtype);
    
    if (variant) {
      const variantFormatted = formatPart(variant);
      return `${provider} ${service} (${variantFormatted})`;
    }
    
    return `${provider} ${service}`;
  }
  
  // ============================================================================
  // COMPARISON
  // ============================================================================
  
  /**
   * Check if two node types are equal.
   */
  static equals(
    a: NodeTypeDefinition | null | undefined,
    b: NodeTypeDefinition | null | undefined
  ): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    
    return (
      a.type === b.type &&
      a.subtype === b.subtype &&
      a.variant === b.variant
    );
  }
}
