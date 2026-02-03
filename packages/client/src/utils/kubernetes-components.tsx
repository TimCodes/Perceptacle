import { NodeTypes, KubernetesSubtypes, type NodeTypeDefinition } from '@/types/nodeTypes';

// Kubernetes SVG Icon Component
interface KubernetesIconProps {
  size?: number;
  className?: string;
}

// Import local Kubernetes SVG icons
import PodIconSvg from '@/assets/kubernetes-icons/pod.svg';
import ServiceIconSvg from '@/assets/kubernetes-icons/svc.svg';
import CronJobIconSvg from '@/assets/kubernetes-icons/cronjob.svg';

// Create React components for Kubernetes SVG icons
export const PodIcon = ({ size = 24, className = "" }: KubernetesIconProps) => (
  <img
    src={PodIconSvg}
    alt="Kubernetes Pod"
    width={size}
    height={size}
    className={className}
  />
);

export const ServiceIcon = ({ size = 24, className = "" }: KubernetesIconProps) => (
  <img
    src={ServiceIconSvg}
    alt="Kubernetes Service"
    width={size}
    height={size}
    className={className}
  />
);

export const CronJobIcon = ({ size = 24, className = "" }: KubernetesIconProps) => (
  <img
    src={CronJobIconSvg}
    alt="Kubernetes CronJob"
    width={size}
    height={size}
    className={className}
  />
);

// Kubernetes Components Configuration
export const KubernetesComponents = [
  {
    type: 'k8s-pod', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD } as NodeTypeDefinition,
    name: 'Pod',
    icon: PodIcon,
    category: 'Kubernetes',
    fields: [
      { name: 'namespace', type: 'k8s-select', source: 'namespaces', placeholder: 'Select namespace', defaultValue: 'default' },
      { name: 'podName', type: 'k8s-select', source: 'pods', dependsOn: 'namespace', placeholder: 'Select pod' },
      { name: 'containerName', type: 'text', placeholder: 'Container name' }
    ]
  },
  {
    type: 'k8s-service', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.SERVICE } as NodeTypeDefinition,
    name: 'Service',
    icon: ServiceIcon,
    category: 'Kubernetes',
    fields: [
      { name: 'namespace', type: 'k8s-select', source: 'namespaces', placeholder: 'Select namespace', defaultValue: 'default' },
      { name: 'serviceName', type: 'k8s-select', source: 'services', dependsOn: 'namespace', placeholder: 'Select service' },
      { name: 'port', type: 'number', placeholder: 'Service port' }
    ]
  },
  {
    type: 'k8s-cronjob', // Legacy - kept for drag-drop compatibility
    nodeTypeDefinition: { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.CRONJOB } as NodeTypeDefinition,
    name: 'CronJob',
    icon: CronJobIcon,
    category: 'Kubernetes',
    fields: [
      { name: 'namespace', type: 'k8s-select', source: 'namespaces', placeholder: 'Select namespace', defaultValue: 'default' },
      { name: 'schedule', type: 'text', placeholder: '*/5 * * * *' }
    ]
  }
];

// Icon map for Kubernetes components
export const kubernetesIconMap = {
  PodIcon,
  ServiceIcon,
  CronJobIcon,
  KafkaClusterIcon,
  KafkaTopicIcon
};


