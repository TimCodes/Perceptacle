/**
 * Cloud component registry for diagram builder.
 * Defines available infrastructure components (Azure, Kubernetes).
 * 
 * MOCK SERVER MODE: Only Azure and Kubernetes components
 * 
 * NOTE: This module is being gradually migrated to the new type system.
 * See @/types/nodeTypeRegistry for the centralized type registry.
 * Components defined here are used for legacy compatibility and will
 * eventually be consolidated with NODE_TYPE_REGISTRY.
 */
import { Box } from 'lucide-react';
import { AzureComponents, azureIconMap } from './azure-components';
import { KubernetesComponents, kubernetesIconMap } from './kubernetes-components';

/** Icon map combining all cloud provider icons */
export const iconMap = {
  Box,
  ...azureIconMap,
  ...kubernetesIconMap
};

/** Predefined cloud infrastructure components */
const predefinedComponents = [
  // Azure Components
  ...AzureComponents.map(comp => ({
    ...comp,
    label: comp.name
  })),
  // Kubernetes Components
  ...KubernetesComponents.map(comp => ({
    ...comp,
    label: comp.name
  }))
];

// Function to get all components including custom ones
export const getCloudComponents = () => {
  const saved = localStorage.getItem("customComponents");
  const customComponents = saved ? JSON.parse(saved) : [];

  // Map custom components to include Box as default icon if not specified
  const mappedCustomComponents = customComponents.map((comp: any) => ({
    ...comp,
    icon: iconMap[comp.icon as keyof typeof iconMap] || Box
  }));

  return [...predefinedComponents, ...mappedCustomComponents];
};

// Export both the static list and the function
export const cloudComponents = predefinedComponents;