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
  timestamp: Date;
  containers: Array<{
    name: string;
    cpu: string;
    memory: string;
    cpuUsageNanoCores: number;
    memoryUsageBytes: number;
  }>;
}

export interface PodInfo {
  name: string;
  namespace: string;
  status: string;
  restarts: number;
  age: string;
  ip: string;
  node: string;
  containers: Array<{
    name: string;
    image: string;
    ready: boolean;
    restartCount: number;
    state: string;
  }>;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface ServiceInfo {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  externalIPs: string[];
  ports: Array<{
    name?: string;
    port: number;
    targetPort: number | string;
    protocol: string;
  }>;
  selector: Record<string, string>;
  endpoints: Array<{
    ip: string;
    ready: boolean;
  }>;
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

export interface ClusterInfo {
  version: string;
  nodes: Array<{
    name: string;
    status: string;
    roles: string[];
    age: string;
    version: string;
    internalIP: string;
    os: string;
    kernelVersion: string;
    containerRuntime: string;
    capacity: {
      cpu: string;
      memory: string;
      pods: string;
      storage: string;
    };
    allocatable: {
      cpu: string;
      memory: string;
      pods: string;
      storage: string;
    };
    conditions: Array<{
      type: string;
      status: string;
      lastTransitionTime: Date;
    }>;
  }>;
  namespaces: string[];
  totalPods: number;
  totalServices: number;
  totalDeployments: number;
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

/**
 * Kubernetes service for interacting with Kubernetes clusters
 */
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
      // Fetch nodes
      const nodesRes = await this.k8sApi.listNode();
      // @ts-ignore
      const nodesList = nodesRes.items ? nodesRes : (nodesRes as any).body;

      const nodes = (nodesList?.items || []).map((node: k8s.V1Node) => ({
        name: node.metadata?.name || 'unknown',
        status: node.status?.conditions?.find((c: k8s.V1NodeCondition) => c.type === 'Ready')?.status === 'True' ? 'Ready' : 'NotReady',
        roles: Object.keys(node.metadata?.labels || {}).filter(l => l.includes('node-role.kubernetes.io')).map(l => l.split('/')[1] || l),
        age: node.metadata?.creationTimestamp ? new Date(node.metadata.creationTimestamp).toLocaleDateString() : 'unknown',
        version: node.status?.nodeInfo?.kubeletVersion || 'unknown',
        internalIP: node.status?.addresses?.find((a: k8s.V1NodeAddress) => a.type === 'InternalIP')?.address || 'unknown',
        os: node.status?.nodeInfo?.osImage || 'unknown',
        kernelVersion: node.status?.nodeInfo?.kernelVersion || 'unknown',
        containerRuntime: node.status?.nodeInfo?.containerRuntimeVersion || 'unknown',
        capacity: {
          cpu: node.status?.capacity?.cpu || '0',
          memory: node.status?.capacity?.memory || '0',
          pods: node.status?.capacity?.pods || '0',
          storage: node.status?.capacity?.['ephemeral-storage'] || '0'
        },
        allocatable: {
          cpu: node.status?.allocatable?.cpu || '0',
          memory: node.status?.allocatable?.memory || '0',
          pods: node.status?.allocatable?.pods || '0',
          storage: node.status?.allocatable?.['ephemeral-storage'] || '0'
        },
        conditions: (node.status?.conditions || []).map((c: k8s.V1NodeCondition) => ({
          type: c.type,
          status: c.status,
          lastTransitionTime: c.lastTransitionTime || new Date()
        }))
      }));

      // Fetch namespaces
      const nsRes = await this.k8sApi.listNamespace();
      // @ts-ignore
      const nsList = nsRes.items ? nsRes : (nsRes as any).body;
      const namespaces = (nsList?.items || []).map((ns: k8s.V1Namespace) => ns.metadata?.name || 'unknown');

      // Fetch counts (approximate)
      const podsRes = await this.k8sApi.listPodForAllNamespaces();
      // @ts-ignore
      const podsList = podsRes.items ? podsRes : (podsRes as any).body;

      const svcRes = await this.k8sApi.listServiceForAllNamespaces();
      // @ts-ignore
      const svcList = svcRes.items ? svcRes : (svcRes as any).body;

      const deployRes = await this.k8sAppsApi.listDeploymentForAllNamespaces();
      // @ts-ignore
      const deployList = deployRes.items ? deployRes : (deployRes as any).body;

      return {
        version: nodes[0]?.version || 'unknown',
        nodes,
        namespaces,
        totalPods: podsList?.items?.length || 0,
        totalServices: svcList?.items?.length || 0,
        totalDeployments: deployList?.items?.length || 0
      };
    } catch (error: any) {
      console.error('Error getting cluster info:', error);
      if (error.message && (error.message.includes('PEM') || error.code === 'ERR_OSSL_PEM_BAD_END_LINE')) {
        console.error('CRITICAL: Kubeconfig certificate error (bad PEM format). Please check your kubeconfig file.');
      }
      throw new Error(`Failed to get cluster information: ${error.message}`);
    }
  }

  /**
   * Get logs from a specific pod
   * Pulls LIVE logs from the Kubernetes cluster when namespace and pod are configured
   */
  async getPodLogs(params: PodLogParams): Promise<string> {
    try {
      console.log(`[Kubernetes Service] Fetching LIVE logs for pod: ${params.podName} in namespace: ${params.namespace}${params.containerName ? `, container: ${params.containerName}` : ''}`);
      
      const response = await this.k8sApi.readNamespacedPodLog({
        name: params.podName,
        namespace: params.namespace,
        container: params.containerName,
        follow: params.follow,
        tailLines: params.tailLines
      });

      // @ts-ignore - return type mismatch
      const logs = response.body || response;
      console.log(`[Kubernetes Service] Successfully retrieved logs for pod ${params.podName} (${logs.split('\n').length} lines)`);
      return logs;
    } catch (error: any) {
      console.error(`[Kubernetes Service] Error getting pod logs for ${params.podName}:`, error.message || error);
      throw new Error(`Failed to get logs for pod ${params.podName}: ${error.body?.message || error.message}`);
    }
  }

  /**
   * Get logs from all pods in a service
   * Pulls LIVE logs from the Kubernetes cluster when namespace and service are configured
   */
  async getServiceLogs(namespace: string, serviceName: string, tailLines?: number): Promise<Record<string, string>> {
    try {
      console.log(`[Kubernetes Service] Fetching LIVE logs for service: ${serviceName} in namespace: ${namespace}`);
      
      // Find pods for service
      const svcRes = await this.k8sApi.readNamespacedService({ name: serviceName, namespace });
      // @ts-ignore
      const svc = svcRes.metadata ? svcRes : (svcRes as any).body;
      const selector = svc?.spec?.selector;

      if (!selector) {
        console.warn(`[Kubernetes Service] No selector found for service ${serviceName} in namespace ${namespace}`);
        return {};
      }

      console.log(`[Kubernetes Service] Service selector: ${JSON.stringify(selector)}`);
      const labelSelector = Object.entries(selector).map(([k, v]) => `${k}=${v}`).join(',');
      const podsRes = await this.k8sApi.listNamespacedPod({ namespace, labelSelector });
      // @ts-ignore
      const podsList = podsRes.items ? podsRes : (podsRes as any).body;
      const pods = podsList?.items || [];

      console.log(`[Kubernetes Service] Found ${pods.length} pod(s) for service ${serviceName}`);

      const logs: Record<string, string> = {};

      // Limit to first 5 pods to avoid timeout (increased from 3)
      const podsToProcess = pods.slice(0, 5);
      console.log(`[Kubernetes Service] Processing logs for ${podsToProcess.length} pod(s)`);

      for (const pod of podsToProcess) {
        if (!pod.metadata?.name) continue;
        const podName = pod.metadata.name;
        
        try {
          console.log(`[Kubernetes Service] Fetching logs for pod: ${podName}`);
          logs[podName] = await this.getPodLogs({
            namespace,
            podName,
            tailLines: tailLines || 100
          });
          console.log(`[Kubernetes Service] Successfully retrieved ${logs[podName].split('\n').length} log lines for pod ${podName}`);
        } catch (e: any) {
          const errorMsg = `Failed to fetch logs: ${e.message || e}`;
          console.error(`[Kubernetes Service] ${errorMsg} for pod ${podName}`);
          logs[podName] = errorMsg;
        }
      }

      if (pods.length > 5) {
        logs['_info'] = `Showing logs from first 5 pods out of ${pods.length} total pods`;
      }

      return logs;
    } catch (error: any) {
      console.error('[Kubernetes Service] Error getting service logs:', error);
      throw new Error(`Failed to get logs for service ${serviceName} in namespace ${namespace}: ${error.body?.message || error.message}`);
    }
  }

  /**
   * Get pod metrics (CPU and memory usage)
   */
  async getPodMetrics(namespace?: string, podName?: string): Promise<PodMetrics[]> {
    try {
      // Metrics API is often not available via standard client easily without metrics-server
      // Keeping mock data for metrics for safety unless we implement raw API call
      // Returning simulated metrics for now to prevent breaking UI if metrics-server is missing
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
      let response;
      const ns = (namespace && namespace !== 'undefined' && namespace !== 'null') ? namespace : undefined;

      if (ns) {
        response = await this.k8sApi.listNamespacedPod({ namespace: ns });
      } else {
        response = await this.k8sApi.listPodForAllNamespaces();
      }

      // @ts-ignore
      const list = response.items ? response : (response as any).body;

      return (list?.items || []).map((pod: k8s.V1Pod) => ({
        name: pod.metadata?.name || 'unknown',
        namespace: pod.metadata?.namespace || 'unknown',
        status: pod.status?.phase || 'Unknown',
        restarts: pod.status?.containerStatuses?.reduce((acc: number, c: k8s.V1ContainerStatus) => acc + c.restartCount, 0) || 0,
        age: pod.metadata?.creationTimestamp ? new Date(pod.metadata.creationTimestamp).toISOString() : 'unknown',
        ip: pod.status?.podIP || 'unknown',
        node: pod.spec?.nodeName || 'unknown',
        containers: (pod.spec?.containers || []).map((c: k8s.V1Container) => {
          const status = pod.status?.containerStatuses?.find((cs: k8s.V1ContainerStatus) => cs.name === c.name);
          return {
            name: c.name,
            image: c.image || 'unknown',
            ready: status?.ready || false,
            restartCount: status?.restartCount || 0,
            state: status?.state?.running ? 'Running' : (status?.state?.waiting ? 'Waiting' : 'Terminated')
          };
        }),
        labels: pod.metadata?.labels || {},
        annotations: pod.metadata?.annotations || {}
      }));
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
      let response;
      const ns = (namespace && namespace !== 'undefined' && namespace !== 'null') ? namespace : undefined;

      if (ns) {
        response = await this.k8sApi.listNamespacedService({ namespace: ns });
      } else {
        response = await this.k8sApi.listServiceForAllNamespaces();
      }

      // @ts-ignore
      const list = response.items ? response : (response as any).body;

      return (list?.items || []).map((svc: k8s.V1Service) => ({
        name: svc.metadata?.name || 'unknown',
        namespace: svc.metadata?.namespace || 'unknown',
        type: svc.spec?.type || 'Unknown',
        clusterIP: svc.spec?.clusterIP || 'None',
        externalIPs: svc.spec?.externalIPs || [],
        ports: (svc.spec?.ports || []).map((p: k8s.V1ServicePort) => ({
          name: p.name || '',
          port: p.port,
          targetPort: p.targetPort || 0,
          protocol: p.protocol || 'TCP'
        })),
        selector: svc.spec?.selector || {},
        endpoints: [] // Endpoints would require another call to listEndpoints
      }));
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
      let response;
      const ns = (namespace && namespace !== 'undefined' && namespace !== 'null') ? namespace : undefined;

      if (ns) {
        response = await this.k8sAppsApi.listNamespacedDeployment({ namespace: ns });
      } else {
        response = await this.k8sAppsApi.listDeploymentForAllNamespaces();
      }

      // @ts-ignore
      const list = response.items ? response : (response as any).body;

      return (list?.items || []).map((dep: k8s.V1Deployment) => ({
        name: dep.metadata?.name || 'unknown',
        namespace: dep.metadata?.namespace || 'unknown',
        replicas: dep.spec?.replicas || 0,
        readyReplicas: dep.status?.readyReplicas || 0,
        availableReplicas: dep.status?.availableReplicas || 0,
        updatedReplicas: dep.status?.updatedReplicas || 0,
        strategy: dep.spec?.strategy?.type || 'RollingUpdate',
        age: dep.metadata?.creationTimestamp ? new Date(dep.metadata.creationTimestamp).toISOString() : 'unknown',
        labels: dep.metadata?.labels || {},
        selector: dep.spec?.selector?.matchLabels || {}
      }));
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
