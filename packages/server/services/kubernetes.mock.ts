// Mock implementation of the Kubernetes service for development and testing
import {
  KubernetesConfig,
  PodLogParams,
  PodMetrics,
  ServiceInfo,
  ClusterInfo,
  NodeInfo,
  PodInfo,
  DeploymentInfo,
  NamespaceResourceUsage,
  ContainerMetrics,
  EndpointInfo,
  ServicePort,
  NodeCapacity,
  NodeCondition,
  PodContainer
} from './kubernetes';

export class MockKubernetesService {
  private config?: KubernetesConfig;

  constructor(config?: KubernetesConfig) {
    this.config = config;
  }

  /**
   * Create mock Kubernetes service instance using default kubeconfig
   */
  static fromDefaultConfig(): MockKubernetesService {
    return new MockKubernetesService();
  }

  /**
   * Create mock Kubernetes service instance with custom kubeconfig
   */
  static fromKubeconfig(kubeconfig: string, context?: string): MockKubernetesService {
    return new MockKubernetesService({ kubeconfig, context });
  }

  /**
   * Get mock cluster information
   */
  async getClusterInfo(): Promise<ClusterInfo> {
    // Simulate API delay
    await this.delay(100);

    return {
      version: 'v1.28.0',
      nodes: [
        {
          name: 'master-node-01',
          status: 'Ready',
          roles: ['control-plane', 'master'],
          age: '45d',
          version: 'v1.28.0',
          internalIP: '10.0.1.10',
          externalIP: '203.0.113.10',
          os: 'linux',
          kernelVersion: '5.15.0-89-generic',
          containerRuntime: 'containerd://1.7.8',
          capacity: {
            cpu: '4',
            memory: '8Gi',
            pods: '110',
            storage: '100Gi'
          },
          allocatable: {
            cpu: '3800m',
            memory: '7.5Gi',
            pods: '110',
            storage: '95Gi'
          },
          conditions: [
            {
              type: 'Ready',
              status: 'True',
              reason: 'KubeletReady',
              message: 'kubelet is posting ready status',
              lastTransitionTime: new Date(Date.now() - 86400000) // 1 day ago
            },
            {
              type: 'MemoryPressure',
              status: 'False',
              reason: 'KubeletHasSufficientMemory',
              message: 'kubelet has sufficient memory available',
              lastTransitionTime: new Date(Date.now() - 86400000)
            }
          ]
        },
        {
          name: 'worker-node-01',
          status: 'Ready',
          roles: ['worker'],
          age: '44d',
          version: 'v1.28.0',
          internalIP: '10.0.1.20',
          os: 'linux',
          kernelVersion: '5.15.0-89-generic',
          containerRuntime: 'containerd://1.7.8',
          capacity: {
            cpu: '8',
            memory: '16Gi',
            pods: '110',
            storage: '200Gi'
          },
          allocatable: {
            cpu: '7800m',
            memory: '15.5Gi',
            pods: '110',
            storage: '190Gi'
          },
          conditions: [
            {
              type: 'Ready',
              status: 'True',
              reason: 'KubeletReady',
              message: 'kubelet is posting ready status',
              lastTransitionTime: new Date(Date.now() - 3600000) // 1 hour ago
            }
          ]
        },
        {
          name: 'worker-node-02',
          status: 'Ready',
          roles: ['worker'],
          age: '44d',
          version: 'v1.28.0',
          internalIP: '10.0.1.21',
          os: 'linux',
          kernelVersion: '5.15.0-89-generic',
          containerRuntime: 'containerd://1.7.8',
          capacity: {
            cpu: '8',
            memory: '16Gi',
            pods: '110',
            storage: '200Gi'
          },
          allocatable: {
            cpu: '7800m',
            memory: '15.5Gi',
            pods: '110',
            storage: '190Gi'
          },
          conditions: [
            {
              type: 'Ready',
              status: 'True',
              reason: 'KubeletReady',
              message: 'kubelet is posting ready status',
              lastTransitionTime: new Date(Date.now() - 1800000) // 30 min ago
            }
          ]
        }
      ],
      namespaces: ['default', 'kube-system', 'kube-public', 'monitoring', 'app-backend', 'app-frontend', 'logging'],
      totalPods: 42,
      totalServices: 18,
      totalDeployments: 12
    };
  }

  /**
   * Get mock pod logs
   */
  async getPodLogs(params: PodLogParams): Promise<string> {
    await this.delay(200);

    const mockLogs = [
      `2024-01-15T10:30:45.123Z INFO  [${params.containerName || 'main'}] Application started successfully`,
      `2024-01-15T10:30:46.234Z INFO  [${params.containerName || 'main'}] Connected to database`,
      `2024-01-15T10:30:47.345Z INFO  [${params.containerName || 'main'}] Listening on port 8080`,
      `2024-01-15T10:31:15.456Z INFO  [${params.containerName || 'main'}] Processing request GET /api/health`,
      `2024-01-15T10:31:15.567Z INFO  [${params.containerName || 'main'}] Health check passed`,
      `2024-01-15T10:32:30.678Z WARN  [${params.containerName || 'main'}] High memory usage detected: 85%`,
      `2024-01-15T10:33:00.789Z INFO  [${params.containerName || 'main'}] Memory usage normalized: 65%`,
      `2024-01-15T10:35:12.890Z ERROR [${params.containerName || 'main'}] Failed to connect to external service: timeout`,
      `2024-01-15T10:35:13.901Z INFO  [${params.containerName || 'main'}] Retrying connection to external service`,
      `2024-01-15T10:35:15.012Z INFO  [${params.containerName || 'main'}] Successfully connected to external service`
    ];

    const tailLines = params.tailLines || mockLogs.length;
    return mockLogs.slice(-tailLines).join('\n');
  }

  /**
   * Get mock service logs
   */
  async getServiceLogs(namespace: string, serviceName: string, tailLines?: number): Promise<Record<string, string>> {
    await this.delay(300);

    const mockServiceLogs = {
      'pod-1': [
        `2024-01-15T10:30:45.123Z INFO  Service ${serviceName} started`,
        `2024-01-15T10:31:00.234Z INFO  Handling request from ${namespace}`,
        `2024-01-15T10:31:15.345Z INFO  Request processed successfully`
      ].slice(-(tailLines || 3)).join('\n'),
      'pod-2': [
        `2024-01-15T10:30:50.456Z INFO  Service ${serviceName} replica started`,
        `2024-01-15T10:31:05.567Z INFO  Load balancing requests`,
        `2024-01-15T10:31:20.678Z INFO  Metrics exported to monitoring`
      ].slice(-(tailLines || 3)).join('\n')
    };

    return mockServiceLogs;
  }

  /**
   * Get mock pod metrics
   */
  async getPodMetrics(namespace?: string, podName?: string): Promise<PodMetrics[]> {
    await this.delay(150);

    const mockMetrics: PodMetrics[] = [
      {
        podName: 'web-app-deployment-7b9c8d6f5-abc12',
        namespace: 'app-frontend',
        timestamp: new Date(),
        containers: [
          {
            name: 'web-app',
            cpu: '250m',
            memory: '512Mi',
            cpuUsageNanoCores: 250000000,
            memoryUsageBytes: 536870912
          }
        ]
      },
      {
        podName: 'api-server-deployment-9d8f7e6c4-def34',
        namespace: 'app-backend',
        timestamp: new Date(),
        containers: [
          {
            name: 'api-server',
            cpu: '500m',
            memory: '1Gi',
            cpuUsageNanoCores: 500000000,
            memoryUsageBytes: 1073741824
          },
          {
            name: 'sidecar-proxy',
            cpu: '50m',
            memory: '128Mi',
            cpuUsageNanoCores: 50000000,
            memoryUsageBytes: 134217728
          }
        ]
      },
      {
        podName: 'database-statefulset-0',
        namespace: 'app-backend',
        timestamp: new Date(),
        containers: [
          {
            name: 'postgres',
            cpu: '1000m',
            memory: '2Gi',
            cpuUsageNanoCores: 1000000000,
            memoryUsageBytes: 2147483648
          }
        ]
      }
    ];

    if (namespace) {
      return mockMetrics.filter(metric => metric.namespace === namespace);
    }
    if (podName) {
      return mockMetrics.filter(metric => metric.podName === podName);
    }

    return mockMetrics;
  }

  /**
   * Get mock pods
   */
  async getPods(namespace?: string): Promise<PodInfo[]> {
    await this.delay(200);

    const allPods: PodInfo[] = [
      {
        name: 'web-app-deployment-7b9c8d6f5-abc12',
        namespace: 'app-frontend',
        status: 'Running',
        restarts: 0,
        age: '2d',
        ip: '10.244.1.15',
        node: 'worker-node-01',
        containers: [
          {
            name: 'web-app',
            image: 'nginx:1.21',
            ready: true,
            restartCount: 0,
            state: 'running'
          }
        ],
        labels: {
          'app': 'web-app',
          'version': 'v1.0.0',
          'environment': 'production'
        },
        annotations: {
          'deployment.kubernetes.io/revision': '1',
          'kubectl.kubernetes.io/last-applied-configuration': '{...}'
        }
      },
      {
        name: 'api-server-deployment-9d8f7e6c4-def34',
        namespace: 'app-backend',
        status: 'Running',
        restarts: 1,
        age: '1d',
        ip: '10.244.2.20',
        node: 'worker-node-02',
        containers: [
          {
            name: 'api-server',
            image: 'myapp/api-server:v2.1.0',
            ready: true,
            restartCount: 1,
            state: 'running'
          },
          {
            name: 'sidecar-proxy',
            image: 'envoyproxy/envoy:v1.28.0',
            ready: true,
            restartCount: 0,
            state: 'running'
          }
        ],
        labels: {
          'app': 'api-server',
          'version': 'v2.1.0',
          'environment': 'production'
        },
        annotations: {
          'deployment.kubernetes.io/revision': '2'
        }
      },
      {
        name: 'database-statefulset-0',
        namespace: 'app-backend',
        status: 'Running',
        restarts: 0,
        age: '5d',
        ip: '10.244.1.25',
        node: 'worker-node-01',
        containers: [
          {
            name: 'postgres',
            image: 'postgres:15',
            ready: true,
            restartCount: 0,
            state: 'running'
          }
        ],
        labels: {
          'app': 'postgres',
          'component': 'database',
          'statefulset.kubernetes.io/pod-name': 'database-statefulset-0'
        },
        annotations: {
          'statefulset.kubernetes.io/revision': '1'
        }
      },
      {
        name: 'monitoring-prometheus-0',
        namespace: 'monitoring',
        status: 'Running',
        restarts: 0,
        age: '10d',
        ip: '10.244.2.30',
        node: 'worker-node-02',
        containers: [
          {
            name: 'prometheus',
            image: 'prom/prometheus:v2.45.0',
            ready: true,
            restartCount: 0,
            state: 'running'
          }
        ],
        labels: {
          'app': 'prometheus',
          'component': 'monitoring'
        },
        annotations: {}
      }
    ];

    if (namespace) {
      return allPods.filter(pod => pod.namespace === namespace);
    }

    return allPods;
  }

  /**
   * Get mock services
   */
  async getServices(namespace?: string): Promise<ServiceInfo[]> {
    await this.delay(150);

    const allServices: ServiceInfo[] = [
      {
        name: 'web-app-service',
        namespace: 'app-frontend',
        type: 'LoadBalancer',
        clusterIP: '10.96.1.100',
        externalIPs: ['203.0.113.50'],
        ports: [
          {
            name: 'http',
            port: 80,
            targetPort: 8080,
            protocol: 'TCP'
          },
          {
            name: 'https',
            port: 443,
            targetPort: 8443,
            protocol: 'TCP'
          }
        ],
        selector: {
          'app': 'web-app'
        },
        endpoints: [
          {
            ip: '10.244.1.15',
            nodeName: 'worker-node-01',
            ready: true
          }
        ]
      },
      {
        name: 'api-server-service',
        namespace: 'app-backend',
        type: 'ClusterIP',
        clusterIP: '10.96.2.200',
        externalIPs: [],
        ports: [
          {
            name: 'api',
            port: 8080,
            targetPort: 8080,
            protocol: 'TCP'
          }
        ],
        selector: {
          'app': 'api-server'
        },
        endpoints: [
          {
            ip: '10.244.2.20',
            nodeName: 'worker-node-02',
            ready: true
          }
        ]
      },
      {
        name: 'postgres-service',
        namespace: 'app-backend',
        type: 'ClusterIP',
        clusterIP: '10.96.2.150',
        externalIPs: [],
        ports: [
          {
            name: 'postgres',
            port: 5432,
            targetPort: 5432,
            protocol: 'TCP'
          }
        ],
        selector: {
          'app': 'postgres'
        },
        endpoints: [
          {
            ip: '10.244.1.25',
            nodeName: 'worker-node-01',
            ready: true
          }
        ]
      },
      {
        name: 'prometheus-service',
        namespace: 'monitoring',
        type: 'NodePort',
        clusterIP: '10.96.3.100',
        externalIPs: [],
        ports: [
          {
            name: 'web',
            port: 9090,
            targetPort: 9090,
            protocol: 'TCP'
          }
        ],
        selector: {
          'app': 'prometheus'
        },
        endpoints: [
          {
            ip: '10.244.2.30',
            nodeName: 'worker-node-02',
            ready: true
          }
        ]
      }
    ];

    if (namespace) {
      return allServices.filter(service => service.namespace === namespace);
    }

    return allServices;
  }

  /**
   * Get mock deployments
   */
  async getDeployments(namespace?: string): Promise<DeploymentInfo[]> {
    await this.delay(100);

    const allDeployments: DeploymentInfo[] = [
      {
        name: 'web-app-deployment',
        namespace: 'app-frontend',
        replicas: 3,
        readyReplicas: 3,
        availableReplicas: 3,
        updatedReplicas: 3,
        strategy: 'RollingUpdate',
        age: '2d',
        labels: {
          'app': 'web-app',
          'version': 'v1.0.0'
        },
        selector: {
          'app': 'web-app'
        }
      },
      {
        name: 'api-server-deployment',
        namespace: 'app-backend',
        replicas: 2,
        readyReplicas: 2,
        availableReplicas: 2,
        updatedReplicas: 2,
        strategy: 'RollingUpdate',
        age: '1d',
        labels: {
          'app': 'api-server',
          'version': 'v2.1.0'
        },
        selector: {
          'app': 'api-server'
        }
      },
      {
        name: 'monitoring-deployment',
        namespace: 'monitoring',
        replicas: 1,
        readyReplicas: 1,
        availableReplicas: 1,
        updatedReplicas: 1,
        strategy: 'Recreate',
        age: '10d',
        labels: {
          'app': 'monitoring',
          'component': 'prometheus'
        },
        selector: {
          'app': 'prometheus'
        }
      }
    ];

    if (namespace) {
      return allDeployments.filter(deployment => deployment.namespace === namespace);
    }

    return allDeployments;
  }

  /**
   * Get mock namespace resource usage
   */
  async getNamespaceResourceUsage(): Promise<NamespaceResourceUsage[]> {
    await this.delay(250);

    return [
      {
        namespace: 'default',
        pods: 2,
        services: 1,
        deployments: 0,
        configMaps: 0,
        secrets: 1,
        persistentVolumeClaims: 0
      },
      {
        namespace: 'app-frontend',
        pods: 3,
        services: 1,
        deployments: 1,
        configMaps: 2,
        secrets: 2,
        persistentVolumeClaims: 0
      },
      {
        namespace: 'app-backend',
        pods: 3,
        services: 2,
        deployments: 1,
        configMaps: 3,
        secrets: 4,
        persistentVolumeClaims: 2
      },
      {
        namespace: 'monitoring',
        pods: 5,
        services: 3,
        deployments: 2,
        configMaps: 1,
        secrets: 1,
        persistentVolumeClaims: 1
      },
      {
        namespace: 'kube-system',
        pods: 15,
        services: 5,
        deployments: 8,
        configMaps: 12,
        secrets: 8,
        persistentVolumeClaims: 0
      },
      {
        namespace: 'kube-public',
        pods: 0,
        services: 0,
        deployments: 0,
        configMaps: 1,
        secrets: 0,
        persistentVolumeClaims: 0
      },
      {
        namespace: 'logging',
        pods: 6,
        services: 2,
        deployments: 2,
        configMaps: 2,
        secrets: 2,
        persistentVolumeClaims: 1
      }
    ];
  }

  /**
   * Mock health check
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    await this.delay(50);

    return {
      status: 'healthy',
      message: 'Mock Kubernetes cluster is healthy and responsive'
    };
  }

  /**
   * Utility method to simulate API delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
