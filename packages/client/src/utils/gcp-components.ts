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

export const GCPComponents = [
  {
    type: 'compute-engine',
    name: 'Compute Engine',
    icon: Server,
    category: 'Compute'
  },
  {
    type: 'cloud-storage',
    name: 'Cloud Storage',
    icon: HardDrive,
    category: 'Storage'
  },
  {
    type: 'cloud-sql',
    name: 'Cloud SQL',
    icon: Database,
    category: 'Database'
  },
  {
    type: 'vpc-network',
    name: 'VPC Network',
    icon: Network,
    category: 'Networking'
  },
  {
    type: 'cloud-functions',
    name: 'Cloud Functions',
    icon: Cloud,
    category: 'Serverless'
  },
  {
    type: 'kubernetes-engine',
    name: 'Kubernetes Engine',
    icon: Box,
    category: 'Containers'
  },
  {
    type: 'cloud-run',
    name: 'Cloud Run',
    icon: Cpu,
    category: 'Serverless'
  },
  {
    type: 'load-balancer',
    name: 'Load Balancer',
    icon: Globe,
    category: 'Networking'
  },
  {
    type: 'cloud-armor',
    name: 'Cloud Armor',
    icon: Shield,
    category: 'Security'
  },
  {
    type: 'app-engine',
    name: 'App Engine',
    icon: LayoutGrid,
    category: 'Compute'
  }
];
