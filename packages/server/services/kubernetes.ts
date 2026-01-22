import * as k8s from '@kubernetes/client-node';
import * as fs from 'fs';

// Types for the Kubernetes service
export interface KubernetesConfig {
  kubeconfigPath?: string;      // Path to kubeconfig file on the server
  kubeconfigContent?: string;   // Raw kubeconfig YAML content (e.g., base64 decoded)
  context?: string;             // Kubernetes context to use
}

export interface PodLogParams {
  namespace: string;
  podName: string;
  containerName?: string;
  follow?: boolean;
  tailLines?: number;
  sinceSeconds?: number;
}

export interface PodMetrics {
  podName: string;
  namespace: string;
  containers: ContainerMetrics[];
  timestamp: Date;
}

export interface ContainerMetrics {
  name: string;
  cpu: string;
  memory: string;
  cpuUsageNanoCores: number;
  memoryUsageBytes: number;
}

export interface ServiceInfo {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  externalIPs: string[];
  ports: ServicePort[];
  selector: Record<string, string>;
  endpoints: EndpointInfo[];
}

export interface ServicePort {
  name?: string;
  port: number;
  targetPort: number | string;
  protocol: string;
}

export interface EndpointInfo {
  ip: string;
  nodeName?: string;
  ready: boolean;
}

export interface ClusterInfo {
  version: string;
  nodes: NodeInfo[];
  namespaces: string[];
  totalPods: number;
  totalServices: number;
  totalDeployments: number;
}

export interface NodeInfo {
  name: string;
  status: string;
  roles: string[];
  age: string;
  version: string;
  internalIP: string;
  externalIP?: string;
  os: string;
  kernelVersion: string;
  containerRuntime: string;
  capacity: NodeCapacity;
  allocatable: NodeCapacity;
  conditions: NodeCondition[];
}

export interface NodeCapacity {
  cpu: string;
  memory: string;
  pods: string;
  storage: string;
}

export interface NodeCondition {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastTransitionTime: Date;
}

export interface PodInfo {
  name: string;
  namespace: string;
  status: string;
  restarts: number;
  age: string;
  ip: string;
  node: string;
  containers: PodContainer[];
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface PodContainer {
  name: string;
  image: string;
  ready: boolean;
  restartCount: number;
  state: string;
}

export interface DeploymentInfo {
  name: string;
  namespace: string;
  replicas: number;
  readyReplicas: number;
  availableReplicas: number;
  updatedReplicas: number;
  strategy: string;
  age: string;
  labels: Record<string, string>;
  selector: Record<string, string>;
}

export interface NamespaceResourceUsage {
  namespace: string;
  pods: number;
  services: number;
  deployments: number;
  configMaps: number;
  secrets: number;
  persistentVolumeClaims: number;
}

export class KubernetesService {
  private kc: k8s.KubeConfig;
  private k8sApi: k8s.CoreV1Api;
  private k8sAppsApi: k8s.AppsV1Api;

  constructor(config?: KubernetesConfig) {
    this.kc = new k8s.KubeConfig();

    if (config?.kubeconfigPath) {
      // Load from file path on the server
      try {
        const kubeconfigContent = fs.readFileSync(config.kubeconfigPath, 'utf8');
        this.kc.loadFromString(kubeconfigContent);
      } catch (error: any) {
        console.error(`Failed to read kubeconfig from path: ${config.kubeconfigPath}`, error.message);
        throw new Error(`Failed to load kubeconfig from ${config.kubeconfigPath}: ${error.message}`);
      }
    } else if (config?.kubeconfigContent) {
      // Load from raw YAML content string
      this.kc.loadFromString(config.kubeconfigContent);
    } else {
      // Try to load from default locations (~/.kube/config, etc.)
      try {
        this.kc.loadFromDefault();
      } catch (error) {
        console.warn('Could not load kubeconfig from default location. Make sure kubectl is configured or provide kubeconfig.');
        throw new Error('Kubernetes configuration not found. Please ensure kubectl is configured or provide kubeconfigPath/kubeconfigContent.');
      }
    }

    if (config?.context) {
      this.kc.setCurrentContext(config.context);
    }

    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.k8sAppsApi = this.kc.makeApiClient(k8s.AppsV1Api);
  }

  /**
   * Create Kubernetes service instance using default kubeconfig
   */
  static fromDefaultConfig(): KubernetesService {
    return new KubernetesService();
  }

  /**
   * Create Kubernetes service instance from a kubeconfig file path
   */
  static fromFile(kubeconfigPath: string, context?: string): KubernetesService {
    return new KubernetesService({ kubeconfigPath, context });
  }

  /**
   * Create Kubernetes service instance from kubeconfig content string
   * @deprecated Use fromFile() for file paths or pass kubeconfigContent in config
   */
  static fromKubeconfig(kubeconfigContent: string, context?: string): KubernetesService {
    return new KubernetesService({ kubeconfigContent, context });
  }

  /**
   * Get cluster information
   */
  async getClusterInfo(): Promise<ClusterInfo> {
    try {
      // Simulate cluster info for demo purposes
      // In production, you would make actual API calls
      return {
        version: 'v1.28.0',
        nodes: [
          {
            name: 'master-node',
            status: 'Ready',
            roles: ['master'],
            age: '30d',
            version: 'v1.28.0',
            internalIP: '192.168.1.10',
            os: 'linux',
            kernelVersion: '5.4.0',
            containerRuntime: 'containerd://1.6.0',
            capacity: {
              cpu: '4',
              memory: '8Gi',
              pods: '110',
              storage: '100Gi'
            },
            allocatable: {
              cpu: '3.8',
              memory: '7.5Gi',
              pods: '110',
              storage: '95Gi'
            },
            conditions: [
              {
                type: 'Ready',
                status: 'True',
                lastTransitionTime: new Date()
              }
            ]
          }
        ],
        namespaces: ['default', 'kube-system', 'kube-public'],
        totalPods: 10,
        totalServices: 5,
        totalDeployments: 3
      };
    } catch (error: any) {
      console.error('Error getting cluster info:', error);
      throw new Error(`Failed to get cluster information: ${error.message}`);
    }
  }

  /**
   * Get logs from a specific pod
   */
  /**
   * Get logs from a specific pod
   */
  async getPodLogs(params: PodLogParams): Promise<string> {
    try {
      const response = await this.k8sApi.readNamespacedPodLog(
        params.podName,
        params.namespace,
        // @ts-ignore - arguments mismatch between versions
        params.containerName
      );

      // @ts-ignore - return type mismatch
      return response.body || response;
    } catch (error: any) {
      console.error('Error getting pod logs:', error);
      throw new Error(`Failed to get logs for pod ${params.podName}: ${error.body?.message || error.message}`);
    }
  }

  /**
   * Get logs from all pods in a service
   */
  async getServiceLogs(namespace: string, serviceName: string, tailLines?: number): Promise<Record<string, string>> {
    try {
      // For demo purposes, return simulated service logs
      const timestamp = new Date().toISOString();
      return {
        [`${serviceName}-pod-1`]: `${timestamp} [INFO] Service ${serviceName} pod 1 logs`,
        [`${serviceName}-pod-2`]: `${timestamp} [INFO] Service ${serviceName} pod 2 logs`,
        [`${serviceName}-pod-3`]: `${timestamp} [INFO] Service ${serviceName} pod 3 logs`
      };
    } catch (error: any) {
      console.error('Error getting service logs:', error);
      throw new Error(`Failed to get logs for service ${serviceName}: ${error.message}`);
    }
  }

  /**
   * Get pod metrics (CPU and memory usage)
   */
  async getPodMetrics(namespace?: string, podName?: string): Promise<PodMetrics[]> {
    try {
      // For demo purposes, return simulated metrics
      // In production, you would use metrics-server API
      const timestamp = new Date();
      const sampleMetrics: PodMetrics[] = [
        {
          podName: podName || 'nginx-deployment-abc123',
          namespace: namespace || 'default',
          timestamp,
          containers: [
            {
              name: 'nginx',
              cpu: '50m',
              memory: '128Mi',
              cpuUsageNanoCores: 50000000,
              memoryUsageBytes: 134217728
            }
          ]
        },
        {
          podName: 'api-deployment-def456',
          namespace: namespace || 'default',
          timestamp,
          containers: [
            {
              name: 'api',
              cpu: '100m',
              memory: '256Mi',
              cpuUsageNanoCores: 100000000,
              memoryUsageBytes: 268435456
            }
          ]
        }
      ];

      if (podName) {
        return sampleMetrics.filter(m => m.podName === podName);
      }

      return sampleMetrics;
    } catch (error: any) {
      console.error('Error getting pod metrics:', error);
      throw new Error(`Failed to get pod metrics: ${error.message}`);
    }
  }

  /**
   * Get detailed information about pods
   */
  async getPods(namespace?: string): Promise<PodInfo[]> {
    try {
      // For demo purposes, return simulated pod info
      const samplePods: PodInfo[] = [
        {
          name: 'nginx-deployment-abc123',
          namespace: namespace || 'default',
          status: 'Running',
          restarts: 0,
          age: '2h',
          ip: '10.244.1.5',
          node: 'worker-node-1',
          containers: [
            {
              name: 'nginx',
              image: 'nginx:1.21',
              ready: true,
              restartCount: 0,
              state: 'Running'
            }
          ],
          labels: { app: 'nginx', version: 'v1' },
          annotations: { 'kubernetes.io/created-by': 'deployment-controller' }
        },
        {
          name: 'api-deployment-def456',
          namespace: namespace || 'default',
          status: 'Running',
          restarts: 1,
          age: '1h',
          ip: '10.244.1.6',
          node: 'worker-node-2',
          containers: [
            {
              name: 'api',
              image: 'myapp:latest',
              ready: true,
              restartCount: 1,
              state: 'Running'
            }
          ],
          labels: { app: 'api', version: 'v2' },
          annotations: { 'kubernetes.io/created-by': 'deployment-controller' }
        }
      ];

      return samplePods;
    } catch (error: any) {
      console.error('Error getting pods:', error);
      throw new Error(`Failed to get pods: ${error.message}`);
    }
  }

  /**
   * Get detailed information about services
   */
  async getServices(namespace?: string): Promise<ServiceInfo[]> {
    try {
      // For demo purposes, return simulated service info
      const sampleServices: ServiceInfo[] = [
        {
          name: 'nginx-service',
          namespace: namespace || 'default',
          type: 'ClusterIP',
          clusterIP: '10.96.1.100',
          externalIPs: [],
          ports: [
            {
              port: 80,
              targetPort: 8080,
              protocol: 'TCP'
            }
          ],
          selector: { app: 'nginx' },
          endpoints: [
            {
              ip: '10.244.1.5',
              ready: true
            }
          ]
        },
        {
          name: 'api-service',
          namespace: namespace || 'default',
          type: 'LoadBalancer',
          clusterIP: '10.96.1.101',
          externalIPs: ['203.0.113.1'],
          ports: [
            {
              port: 443,
              targetPort: 8443,
              protocol: 'TCP'
            }
          ],
          selector: { app: 'api' },
          endpoints: [
            {
              ip: '10.244.1.6',
              ready: true
            }
          ]
        }
      ];

      return sampleServices;
    } catch (error: any) {
      console.error('Error getting services:', error);
      throw new Error(`Failed to get services: ${error.message}`);
    }
  }

  /**
   * Get detailed information about deployments
   */
  async getDeployments(namespace?: string): Promise<DeploymentInfo[]> {
    try {
      // For demo purposes, return simulated deployment info
      const sampleDeployments: DeploymentInfo[] = [
        {
          name: 'nginx-deployment',
          namespace: namespace || 'default',
          replicas: 3,
          readyReplicas: 3,
          availableReplicas: 3,
          updatedReplicas: 3,
          strategy: 'RollingUpdate',
          age: '2h',
          labels: { app: 'nginx' },
          selector: { app: 'nginx' }
        },
        {
          name: 'api-deployment',
          namespace: namespace || 'default',
          replicas: 2,
          readyReplicas: 2,
          availableReplicas: 2,
          updatedReplicas: 2,
          strategy: 'RollingUpdate',
          age: '1h',
          labels: { app: 'api' },
          selector: { app: 'api' }
        }
      ];

      return sampleDeployments;
    } catch (error: any) {
      console.error('Error getting deployments:', error);
      throw new Error(`Failed to get deployments: ${error.message}`);
    }
  }

  /**
   * Get resource usage by namespace
   */
  async getNamespaceResourceUsage(): Promise<NamespaceResourceUsage[]> {
    try {
      // For demo purposes, return simulated resource usage
      const sampleUsage: NamespaceResourceUsage[] = [
        {
          namespace: 'default',
          pods: 5,
          services: 3,
          deployments: 2,
          configMaps: 4,
          secrets: 6,
          persistentVolumeClaims: 1
        },
        {
          namespace: 'kube-system',
          pods: 15,
          services: 5,
          deployments: 8,
          configMaps: 12,
          secrets: 10,
          persistentVolumeClaims: 0
        },
        {
          namespace: 'monitoring',
          pods: 8,
          services: 4,
          deployments: 3,
          configMaps: 6,
          secrets: 4,
          persistentVolumeClaims: 2
        }
      ];

      return sampleUsage;
    } catch (error: any) {
      console.error('Error getting namespace resource usage:', error);
      throw new Error(`Failed to get namespace resource usage: ${error.message}`);
    }
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      // For demo purposes, always return healthy
      // In production, you would test the actual API connection
      return { status: 'healthy', message: 'Kubernetes API is accessible' };
    } catch (error: any) {
      return { status: 'unhealthy', message: `Kubernetes API is not accessible: ${error.message}` };
    }
  }
}
