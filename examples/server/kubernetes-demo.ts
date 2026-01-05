import { KubernetesService } from './services/kubernetes';

/**
 * Demo script showing how to use the Kubernetes service
 * This demonstrates all the main features of the KubernetesService
 */
async function kubernetesServiceDemo() {
  try {
    console.log('🚀 Kubernetes Service Demo');
    console.log('===========================\n');

    // Example 1: Initialize service
    console.log('1. Initializing Kubernetes service:');
    console.log('   Using default kubeconfig from ~/.kube/config');
    console.log('   Alternative: KubernetesService.fromKubeconfig(customConfig)\n');

    // Example 2: Health check
    console.log('2. Health check example:');
    console.log('   GET /api/kubernetes/health');
    console.log('   Response: { "status": "healthy", "message": "Kubernetes API is accessible" }\n');

    // Example 3: Cluster information
    console.log('3. Get cluster information:');
    console.log('   GET /api/kubernetes/cluster');
    console.log('   Response includes:');
    console.log('   - Kubernetes version');
    console.log('   - Node information (CPU, memory, status)');
    console.log('   - Namespace list');
    console.log('   - Total resource counts\n');

    // Example 4: Pod operations
    console.log('4. Pod operations:');
    console.log('   GET /api/kubernetes/pods - Get all pods');
    console.log('   GET /api/kubernetes/pods?namespace=default - Get pods in specific namespace');
    console.log('   GET /api/kubernetes/pods/default/my-pod - Get specific pod details');
    console.log('   Response includes: name, namespace, status, restart count, containers, etc.\n');

    // Example 5: Service operations
    console.log('5. Service operations:');
    console.log('   GET /api/kubernetes/services - Get all services');
    console.log('   GET /api/kubernetes/services?namespace=default - Get services in specific namespace');
    console.log('   GET /api/kubernetes/services/default/my-service - Get specific service details');
    console.log('   Response includes: name, type, cluster IP, ports, endpoints, selector\n');

    // Example 6: Pod logs
    console.log('6. Pod logs:');
    console.log('   GET /api/kubernetes/pods/default/my-pod/logs - Get pod logs');
    console.log('   Query parameters:');
    console.log('   - container: specific container name (optional)');
    console.log('   - tailLines: number of lines to return');
    console.log('   - sinceSeconds: logs from last N seconds');
    console.log('   - follow: stream logs (true/false)\n');

    // Example 7: Service logs (all pods in service)
    console.log('7. Service logs:');
    console.log('   GET /api/kubernetes/services/default/my-service/logs');
    console.log('   Returns logs from all pods that match the service selector');
    console.log('   Query parameters: tailLines\n');

    // Example 8: Metrics
    console.log('8. Pod metrics (CPU and memory usage):');
    console.log('   GET /api/kubernetes/metrics/pods - Get metrics for all pods');
    console.log('   GET /api/kubernetes/metrics/pods?namespace=default - Namespace specific');
    console.log('   GET /api/kubernetes/metrics/pods?namespace=default&podName=my-pod - Specific pod');
    console.log('   Note: Requires metrics-server to be installed in the cluster');
    console.log('   Response includes: CPU usage (nanocores), memory usage (bytes)\n');

    // Example 9: Deployments
    console.log('9. Deployment information:');
    console.log('   GET /api/kubernetes/deployments - Get all deployments');
    console.log('   GET /api/kubernetes/deployments?namespace=default - Namespace specific');
    console.log('   Response includes: replicas, ready replicas, update strategy, etc.\n');

    // Example 10: Namespace resource usage
    console.log('10. Namespace resource usage:');
    console.log('    GET /api/kubernetes/namespaces/usage');
    console.log('    Returns resource counts per namespace:');
    console.log('    - Pod count');
    console.log('    - Service count');
    console.log('    - Deployment count');
    console.log('    - ConfigMap count');
    console.log('    - Secret count');
    console.log('    - PVC count\n');

    // Example 11: Log streaming (experimental)
    console.log('11. Real-time log streaming:');
    console.log('    GET /api/kubernetes/pods/default/my-pod/logs/stream');
    console.log('    Server-Sent Events (SSE) for real-time log streaming');
    console.log('    Auto-closes after 30 seconds to prevent hanging connections\n');

    // Example 12: API endpoint patterns
    console.log('12. Complete API endpoint list:');
    const baseUrl = 'http://localhost:3000/api/kubernetes';
    const endpoints = [
      `GET ${baseUrl}/health`,
      `GET ${baseUrl}/cluster`,
      `GET ${baseUrl}/pods`,
      `GET ${baseUrl}/pods?namespace={namespace}`,
      `GET ${baseUrl}/pods/{namespace}/{podName}`,
      `GET ${baseUrl}/pods/{namespace}/{podName}/logs`,
      `GET ${baseUrl}/pods/{namespace}/{podName}/logs/stream`,
      `GET ${baseUrl}/services`,
      `GET ${baseUrl}/services?namespace={namespace}`,
      `GET ${baseUrl}/services/{namespace}/{serviceName}`,
      `GET ${baseUrl}/services/{namespace}/{serviceName}/logs`,
      `GET ${baseUrl}/deployments`,
      `GET ${baseUrl}/deployments?namespace={namespace}`,
      `GET ${baseUrl}/metrics/pods`,
      `GET ${baseUrl}/metrics/pods?namespace={namespace}`,
      `GET ${baseUrl}/metrics/pods?namespace={namespace}&podName={podName}`,
      `GET ${baseUrl}/namespaces/usage`
    ];
    
    endpoints.forEach(endpoint => console.log(`🌐 ${endpoint}`));
    console.log();

    // Example 13: Sample curl commands
    console.log('13. Sample curl commands:');
    console.log('    Get cluster info:');
    console.log(`    curl "${baseUrl}/cluster"`);
    console.log();
    console.log('    Get pod logs:');
    console.log(`    curl "${baseUrl}/pods/default/my-pod/logs?tailLines=100"`);
    console.log();
    console.log('    Get pod metrics:');
    console.log(`    curl "${baseUrl}/metrics/pods?namespace=default"`);
    console.log();
    console.log('    Get service logs:');
    console.log(`    curl "${baseUrl}/services/default/my-service/logs?tailLines=50"`);
    console.log();

    // Example 14: Configuration requirements
    console.log('14. Configuration requirements:');
    console.log('    📋 Kubeconfig file at ~/.kube/config (or KUBECONFIG env var)');
    console.log('    📋 kubectl configured and authenticated');
    console.log('    📋 Proper RBAC permissions for the service account');
    console.log('    📋 metrics-server installed for metrics endpoints');
    console.log('    📋 Network access to Kubernetes API server\n');

    // Example 15: RBAC permissions needed
    console.log('15. Required RBAC permissions:');
    console.log('    apiGroups: ["", "apps", "metrics.k8s.io"]');
    console.log('    resources: ["pods", "services", "deployments", "namespaces", "endpoints", "nodes", "configmaps", "secrets", "persistentvolumeclaims"]');
    console.log('    verbs: ["get", "list", "watch"]');
    console.log('    Note: "watch" is needed for log streaming\n');

    // Example 16: Frontend integration examples
    console.log('16. Frontend integration examples:');
    console.log('    React component for pod metrics:');
    console.log('    ```typescript');
    console.log('    const [metrics, setMetrics] = useState([]);');
    console.log('    ');
    console.log('    useEffect(() => {');
    console.log('      fetch("/api/kubernetes/metrics/pods?namespace=default")');
    console.log('        .then(res => res.json())');
    console.log('        .then(setMetrics);');
    console.log('    }, []);');
    console.log('    ');
    console.log('    // Display CPU and memory usage charts');
    console.log('    metrics.map(metric => ');
    console.log('      metric.containers.map(container => ({');
    console.log('        pod: metric.podName,');
    console.log('        container: container.name,');
    console.log('        cpu: container.cpuUsageNanoCores / 1000000, // Convert to millicores');
    console.log('        memory: container.memoryUsageBytes / 1024 / 1024 // Convert to MB');
    console.log('      }))');
    console.log('    );');
    console.log('    ```\n');

    console.log('✨ Demo completed! The Kubernetes service is ready to use.');
    console.log('📖 All endpoints are documented and ready for frontend integration.');
    console.log('🔧 Make sure to have kubectl configured before using the service.');

  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  kubernetesServiceDemo();
}

export { kubernetesServiceDemo };
