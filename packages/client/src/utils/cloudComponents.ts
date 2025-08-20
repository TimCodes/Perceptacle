import {
  Server,
  Database,
  HardDrive,
  Network,
  Cloud,
  Box,
  Cpu,
  Globe,
  Shield,
  LayoutGrid
} from 'lucide-react';

export const iconMap = {
  Server,
  Database,
  HardDrive,
  Network,
  Cloud,
  Box,
  Cpu,
  Globe,
  Shield,
  LayoutGrid
};

const predefinedComponents = [
  {
    type: 'compute-engine',
    label: 'Compute Engine',
    icon: Server,
    category: 'Compute',
  },
  {
    type: 'cloud-storage',
    label: 'Cloud Storage',
    icon: HardDrive,
    category: 'Storage',
  },
  {
    type: 'cloud-sql',
    label: 'Cloud SQL',
    icon: Database,
    category: 'Database',
  },
  {
    type: 'kubernetes-engine',
    label: 'Kubernetes Engine',
    icon: Box,
    category: 'Compute',
  },
  {
    type: 'cloud-functions',
    label: 'Cloud Functions',
    icon: Cloud,
    category: 'Serverless',
  },
  {
    type: 'cloud-run',
    label: 'Cloud Run',
    icon: Cpu,
    category: 'Serverless',
  },
  {
    type: 'load-balancer',
    label: 'Load Balancer',
    icon: Globe,
    category: 'Networking',
  },
  {
    type: 'cloud-armor',
    label: 'Cloud Armor',
    icon: Shield,
    category: 'Security',
  },
  {
    type: 'app-engine',
    label: 'App Engine',
    icon: LayoutGrid,
    category: 'Compute',
  }
];

// Function to get all components including custom ones
export const getCloudComponents = () => {
  const saved = localStorage.getItem("customComponents");
  const customComponents = saved ? JSON.parse(saved) : [];

  // Map custom components to include Box as default icon if not specified
  const mappedCustomComponents = customComponents.map(comp => ({
    ...comp,
    icon: iconMap[comp.icon] || Box
  }));

  return [...predefinedComponents, ...mappedCustomComponents];
};

// Export both the static list and the function
export const cloudComponents = predefinedComponents;