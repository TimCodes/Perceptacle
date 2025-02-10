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

export const cloudComponents = [
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