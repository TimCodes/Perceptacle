/**
 * Node Type Helper Utilities
 * 
 * Provides helper functions for working with the node type system.
 * Includes type detection, capability queries, resource ID building,
 * and legacy type conversion.
 * 
 * @module nodeTypeHelpers
 */

import {
  NodeTypes,
  AzureSubtypes,
  LEGACY_TYPE_MAP,
  type NodeTypeDefinition,
  type NodeCapabilities,
  type ConfigField,
  type MessageProtocol,
  type RegisteredNodeType
} from '../types/nodeTypes';

import {
  NODE_TYPE_REGISTRY,
  getRegistryEntry
} from '../types/nodeTypeRegistry';

/**
 * Helper class for node type operations.
 * All methods are static and pure functions.
 */
export class NodeTypeHelper {
  
  // ============================================================================
  // TYPE DETECTION
  // ============================================================================
  
  /**
   * Check if a node is an Azure node.
   * 
   * @param node - Node type definition
   * @returns True if Azure node
   * 
   * @example
   * NodeTypeHelper.isAzure({ type: 'azure', subtype: 'function-app' }) // true
   * NodeTypeHelper.isAzure({ type: 'kubernetes', subtype: 'pod' }) // false
   */
  static isAzure(node: NodeTypeDefinition | null | undefined): boolean {
    return node?.type === NodeTypes.AZURE;
  }
  
  /**
   * Check if a node is a Kubernetes node.
   * 
   * @param node - Node type definition
   * @returns True if Kubernetes node
   */
  static isKubernetes(node: NodeTypeDefinition | null | undefined): boolean {
    return node?.type === NodeTypes.KUBERNETES;
  }
  
  /**
   * Check if a node is a specific subtype.
   * 
   * @param node - Node type definition
   * @param subtype - Subtype to check
   * @returns True if node matches subtype
   * 
   * @example
   * NodeTypeHelper.isSubtype(node, 'function-app') // true for Azure Function
   */
  static isSubtype(node: NodeTypeDefinition | null | undefined, subtype: string): boolean {
    return node?.subtype === subtype;
  }
  
  /**
   * Check if a node has a specific variant.
   * 
   * @param node - Node type definition
   * @param variant - Variant to check
   * @returns True if node matches variant
   * 
   * @example
   * NodeTypeHelper.isVariant(serviceBusNode, 'queue') // true for queue variant
   */
  static isVariant(node: NodeTypeDefinition | null | undefined, variant: string): boolean {
    return node?.variant === variant;
  }
  
  /**
   * Check if a node type matches the given criteria.
   * 
   * @param node - Node type definition
   * @param type - Type to match
   * @param subtype - Optional subtype to match
   * @param variant - Optional variant to match
   * @returns True if all criteria match
   */
  static matches(
    node: NodeTypeDefinition | null | undefined,
    type: string,
    subtype?: string,
    variant?: string
  ): boolean {
    if (!node || node.type !== type) return false;
    if (subtype && node.subtype !== subtype) return false;
    if (variant && node.variant !== variant) return false;
    return true;
  }
  
  // ============================================================================
  // REGISTRY QUERIES
  // ============================================================================
  
  /**
   * Get the registry entry for a node type.
   * 
   * @param node - Node type definition
   * @returns Registry entry or undefined if not found
   * 
   * @example
   * const entry = NodeTypeHelper.getRegistryEntry({ type: 'azure', subtype: 'function-app' });
   * console.log(entry.displayName); // "Azure Function App"
   */
  static getRegistryEntry(node: NodeTypeDefinition | null | undefined): RegisteredNodeType | undefined {
    if (!node) return undefined;
    return getRegistryEntry(node.type, node.subtype, node.variant);
  }
  
  /**
   * Get the display name for a node type.
   * 
   * @param node - Node type definition
   * @returns Display name or default string
   */
  static getDisplayName(node: NodeTypeDefinition | null | undefined): string {
    if (!node) return 'Unknown Node';
    const entry = this.getRegistryEntry(node);
    return entry?.displayName || `${node.type}-${node.subtype}`;
  }
  
  /**
   * Get the category for a node type.
   * 
   * @param node - Node type definition
   * @returns Category name or 'Unknown'
   */
  static getCategory(node: NodeTypeDefinition | null | undefined): string {
    if (!node) return 'Unknown';
    const entry = this.getRegistryEntry(node);
    return entry?.category || 'Unknown';
  }
  
  /**
   * Get the description for a node type.
   * 
   * @param node - Node type definition
   * @returns Description or empty string
   */
  static getDescription(node: NodeTypeDefinition | null | undefined): string {
    if (!node) return '';
    const entry = this.getRegistryEntry(node);
    return entry?.description || '';
  }
  
  /**
   * Get the tags for a node type.
   * 
   * @param node - Node type definition
   * @returns Array of tags
   */
  static getTags(node: NodeTypeDefinition | null | undefined): string[] {
    if (!node) return [];
    const entry = this.getRegistryEntry(node);
    return entry?.tags || [];
  }
  
  // ============================================================================
  // CAPABILITY QUERIES
  // ============================================================================
  
  /**
   * Get all capabilities for a node type.
   * 
   * @param node - Node type definition
   * @returns Capabilities object
   * 
   * @example
   * const caps = NodeTypeHelper.getCapabilities(node);
   * if (caps.hasMetrics) { ... }
   */
  static getCapabilities(node: NodeTypeDefinition | null | undefined): NodeCapabilities {
    if (!node) return {};
    const entry = this.getRegistryEntry(node);
    return entry?.capabilities || {};
  }
  
  /**
   * Check if a node supports metrics/telemetry.
   * 
   * @param node - Node type definition
   * @returns True if node has metrics capability
   */
  static hasMetrics(node: NodeTypeDefinition | null | undefined): boolean {
    return this.getCapabilities(node).hasMetrics || false;
  }
  
  /**
   * Check if a node supports logs.
   * 
   * @param node - Node type definition
   * @returns True if node has logs capability
   */
  static hasLogs(node: NodeTypeDefinition | null | undefined): boolean {
    return this.getCapabilities(node).hasLogs || false;
  }
  
  /**
   * Check if a node supports messages.
   * 
   * @param node - Node type definition
   * @returns True if node has messages capability
   */
  static hasMessages(node: NodeTypeDefinition | null | undefined): boolean {
    return this.getCapabilities(node).hasMessages || false;
  }
  
  /**
   * Get the message protocol for a node.
   * 
   * @param node - Node type definition
   * @returns Message protocol or undefined
   */
  static getMessageProtocol(node: NodeTypeDefinition | null | undefined): MessageProtocol | undefined {
    return this.getCapabilities(node).messageProtocol;
  }
  
  /**
   * Check if a node supports health checks.
   * 
   * @param node - Node type definition
   * @returns True if node has health check capability
   */
  static hasHealthCheck(node: NodeTypeDefinition | null | undefined): boolean {
    return this.getCapabilities(node).hasHealthCheck || false;
  }
  
  /**
   * Check if a node supports auto-scaling.
   * 
   * @param node - Node type definition
   * @returns True if node has auto-scaling capability
   */
  static hasAutoScaling(node: NodeTypeDefinition | null | undefined): boolean {
    return this.getCapabilities(node).hasAutoScaling || false;
  }
  
  /**
   * Check if a node has network configuration.
   * 
   * @param node - Node type definition
   * @returns True if node has network config capability
   */
  static hasNetworkConfig(node: NodeTypeDefinition | null | undefined): boolean {
    return this.getCapabilities(node).hasNetworkConfig || false;
  }
  
  // ============================================================================
  // CONFIGURATION FIELDS
  // ============================================================================
  
  /**
   * Get configuration fields for a node type.
   * Returns type-specific fields from the registry.
   * 
   * @param node - Node type definition
   * @returns Array of configuration fields
   */
  static getConfigFields(node: NodeTypeDefinition | null | undefined): ConfigField[] {
    if (!node) return [];
    const entry = this.getRegistryEntry(node);
    return entry?.fields || [];
  }
  
  // ============================================================================
  // RESOURCE ID BUILDING
  // ============================================================================
  
  /**
   * Build a cloud provider resource ID for a node.
   * 
   * @param node - Node type definition
   * @param data - Node data containing resource details
   * @returns Resource ID string or empty string if cannot build
   * 
   * @example
   * const id = NodeTypeHelper.buildResourceId(azureNode, {
   *   subscriptionId: 'sub-123',
   *   resourceGroup: 'my-rg',
   *   name: 'my-function'
   * });
   * // Returns: "/subscriptions/sub-123/resourceGroups/my-rg/providers/Microsoft.Web/sites/my-function"
   */
  static buildResourceId(node: NodeTypeDefinition | null | undefined, data: any): string {
    if (!node) return '';
    const entry = this.getRegistryEntry(node);
    
    if (!entry?.resourceMapping?.buildId) {
      return '';
    }
    
    try {
      return entry.resourceMapping.buildId(data);
    } catch (error) {
      console.error('Error building resource ID:', error);
      return '';
    }
  }
  
  /**
   * Get the cloud provider resource type.
   * 
   * @param node - Node type definition
   * @returns Provider resource type string (e.g., 'Microsoft.Web/sites')
   */
  static getProviderResourceType(node: NodeTypeDefinition | null | undefined): string {
    if (!node) return '';
    const entry = this.getRegistryEntry(node);
    return entry?.resourceMapping?.provider || '';
  }
  
  /**
   * Get the API version for cloud provider calls.
   * 
   * @param node - Node type definition
   * @returns API version string
   */
  static getApiVersion(node: NodeTypeDefinition | null | undefined): string {
    if (!node) return '';
    const entry = this.getRegistryEntry(node);
    return entry?.resourceMapping?.apiVersion || '';
  }
  
  // ============================================================================
  // LEGACY CONVERSION
  // ============================================================================
  
  /**
   * Convert a legacy type string to new NodeTypeDefinition.
   * 
   * @param legacyType - Old type string (e.g., 'azure-function-app')
   * @returns NodeTypeDefinition
   * 
   * @example
   * const newType = NodeTypeHelper.fromLegacyType('azure-function-app');
   * // Returns: { type: 'azure', subtype: 'function-app' }
   */
  static fromLegacyType(legacyType: string | null | undefined): NodeTypeDefinition {
    if (!legacyType) {
      return { type: NodeTypes.AZURE, subtype: 'unknown' };
    }
    
    // Check direct mapping first
    const mapped = LEGACY_TYPE_MAP[legacyType];
    if (mapped) {
      return mapped;
    }
    
    // Try to parse kebab-case format (e.g., 'azure-function-app')
    if (legacyType.includes('-')) {
      const parts = legacyType.split('-');
      if (parts.length >= 2) {
        const type = parts[0];
        const subtype = parts.slice(1).join('-');
        
        // Validate against known types
        if (Object.values(NodeTypes).includes(type as any)) {
          return { type, subtype };
        }
      }
    }
    
    // Fallback to azure type (default in mock mode)
    console.warn(`Unknown legacy type: ${legacyType}, using azure type`);
    return { type: NodeTypes.AZURE, subtype: 'custom', variant: legacyType };
  }
  
  /**
   * Convert NodeTypeDefinition to legacy type string.
   * Used for backward compatibility.
   * 
   * @param node - Node type definition
   * @returns Legacy type string
   * 
   * @example
   * const legacy = NodeTypeHelper.toLegacyType({ type: 'azure', subtype: 'function-app' });
   * // Returns: 'azure-function-app'
   */
  static toLegacyType(node: NodeTypeDefinition | null | undefined): string {
    if (!node) return 'unknown';
    
    // Special cases with variants
    if (node.type === NodeTypes.AZURE && node.subtype === AzureSubtypes.SERVICE_BUS) {
      if (node.variant === 'queue') return 'ServiceBusQueue';
      if (node.variant === 'topic') return 'ServiceBusTopic';
      return 'azure-service-bus';
    }
    
    // Check for reverse mapping in legacy map
    for (const [legacyType, newType] of Object.entries(LEGACY_TYPE_MAP)) {
      if (newType.type === node.type && 
          newType.subtype === node.subtype &&
          newType.variant === node.variant) {
        return legacyType;
      }
    }
    
    // Default to kebab-case format
    return `${node.type}-${node.subtype}`;
  }
  
  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  /**
   * Check if a node type is valid and registered.
   * 
   * @param node - Node type definition
   * @returns True if valid and found in registry
   */
  static isValid(node: NodeTypeDefinition | null | undefined): boolean {
    if (!node) return false;
    return this.getRegistryEntry(node) !== undefined;
  }
  
  /**
   * Validate a node type definition.
   * Throws error if invalid.
   * 
   * @param node - Node type definition to validate
   * @throws Error if invalid
   */
  static validate(node: NodeTypeDefinition): void {
    if (!node.type) {
      throw new Error('Node type is required');
    }
    if (!node.subtype) {
      throw new Error('Node subtype is required');
    }
    if (!this.isValid(node)) {
      console.warn(`Node type not found in registry: ${node.type}-${node.subtype}`);
    }
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Create a composite key for a node type.
   * Useful for maps, caching, etc.
   * 
   * @param node - Node type definition
   * @returns Composite key string
   * 
   * @example
   * const key = NodeTypeHelper.getCompositeKey(node);
   * // Returns: 'azure:function-app' or 'azure:service-bus:queue'
   */
  static getCompositeKey(node: NodeTypeDefinition | null | undefined): string {
    if (!node) return 'unknown';
    const parts = [node.type, node.subtype];
    if (node.variant) {
      parts.push(node.variant);
    }
    return parts.join(':');
  }
  
  /**
   * Parse a composite key back into a NodeTypeDefinition.
   * 
   * @param key - Composite key string
   * @returns NodeTypeDefinition
   */
  static fromCompositeKey(key: string): NodeTypeDefinition {
    const parts = key.split(':');
    return {
      type: parts[0] || NodeTypes.AZURE,
      subtype: parts[1] || 'unknown',
      variant: parts[2]
    };
  }
  
  /**
   * Compare two node types for equality.
   * 
   * @param a - First node type
   * @param b - Second node type
   * @returns True if equal
   */
  static equals(
    a: NodeTypeDefinition | null | undefined,
    b: NodeTypeDefinition | null | undefined
  ): boolean {
    if (!a || !b) return a === b;
    return a.type === b.type && 
           a.subtype === b.subtype && 
           a.variant === b.variant;
  }
  
  /**
   * Clone a node type definition.
   * 
   * @param node - Node type to clone
   * @returns Cloned node type
   */
  static clone(node: NodeTypeDefinition | null | undefined): NodeTypeDefinition | null {
    if (!node) return null;
    return {
      type: node.type,
      subtype: node.subtype,
      variant: node.variant
    };
  }
  
  /**
   * Get all registered node types.
   * 
   * @returns Array of all node type definitions
   */
  static getAllNodeTypes(): NodeTypeDefinition[] {
    return NODE_TYPE_REGISTRY.map(entry => ({
      type: entry.type,
      subtype: entry.subtype,
      variant: entry.variant
    }));
  }
  
  /**
   * Get all node types for a specific provider.
   * 
   * @param type - Provider type (e.g., 'azure', 'kubernetes')
   * @returns Array of node type definitions
   */
  static getNodeTypesForProvider(type: string): NodeTypeDefinition[] {
    return NODE_TYPE_REGISTRY
      .filter(entry => entry.type === type)
      .map(entry => ({
        type: entry.type,
        subtype: entry.subtype,
        variant: entry.variant
      }));
  }
}

/**
 * Convenience functions (aliases for common operations)
 */

/**
 * Quick check if a node is Azure.
 * @param node - Node type definition
 */
export const isAzure = (node: NodeTypeDefinition | null | undefined) => 
  NodeTypeHelper.isAzure(node);

/**
 * Quick check if a node is Kubernetes.
 * @param node - Node type definition
 */
export const isKubernetes = (node: NodeTypeDefinition | null | undefined) => 
  NodeTypeHelper.isKubernetes(node);

/**
 * Quick check if a node is Kafka.
 * @param node - Node type definition
 */
export const isKafka = (node: NodeTypeDefinition | null | undefined) => 
  NodeTypeHelper.isKafka(node);

/**
 * Quick check if a node is GCP.
 * @param node - Node type definition
 */
export const isGCP = (node: NodeTypeDefinition | null | undefined) => 
  NodeTypeHelper.isGCP(node);

/**
 * Quick conversion from legacy type.
 * @param legacyType - Legacy type string
 */
export const fromLegacyType = (legacyType: string) => 
  NodeTypeHelper.fromLegacyType(legacyType);

/**
 * Quick conversion to legacy type.
 * @param node - Node type definition
 */
export const toLegacyType = (node: NodeTypeDefinition) => 
  NodeTypeHelper.toLegacyType(node);
