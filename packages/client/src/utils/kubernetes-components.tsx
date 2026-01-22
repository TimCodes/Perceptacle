// Kubernetes SVG Icon Component
interface KubernetesIconProps {
  size?: number;
  className?: string;
}

// Import local Kubernetes SVG icons
import PodIconSvg from '@/assets/kubernetes-icons/pod.svg';
import ServiceIconSvg from '@/assets/kubernetes-icons/svc.svg';
import CronJobIconSvg from '@/assets/kubernetes-icons/cronjob.svg';
import KafkaClusterIconSvg from '@/assets/kubernetes-icons/kafka-cluster.svg';
import KafkaTopicIconSvg from '@/assets/kubernetes-icons/kafka-topic.svg';

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

export const KafkaClusterIcon = ({ size = 24, className = "" }: KubernetesIconProps) => (
  <img
    src={KafkaClusterIconSvg}
    alt="Kafka Cluster"
    width={size}
    height={size}
    className={className}
  />
);

export const KafkaTopicIcon = ({ size = 24, className = "" }: KubernetesIconProps) => (
  <img
    src={KafkaTopicIconSvg}
    alt="Kafka Topic"
    width={size}
    height={size}
    className={className}
  />
);

// Kubernetes Components Configuration
export const KubernetesComponents = [
  {
    type: 'k8s-pod',
    name: 'Pod',
    icon: PodIcon,
    category: 'Kubernetes'
  },
  {
    type: 'k8s-service',
    name: 'Service',
    icon: ServiceIcon,
    category: 'Kubernetes'
  },
  {
    type: 'k8s-cronjob',
    name: 'CronJob',
    icon: CronJobIcon,
    category: 'Kubernetes'
  },

  {
    type: 'kafka-cluster',
    name: 'Kafka Cluster',
    icon: KafkaClusterIcon,
    category: 'Kafka'
  },
  {
    type: 'kafka-topic',
    name: 'Kafka Topic',
    icon: KafkaTopicIcon,
    category: 'Kafka'
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


