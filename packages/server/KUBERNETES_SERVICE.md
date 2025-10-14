# Kubernetes Service Implementation

This service provides a comprehensive API to interact with Kubernetes clusters, allowing you to retrieve logs, metrics, and cluster information through a RESTful interface.

## Features

✅ **Cluster Management**
- Get cluster information including version, nodes, and namespaces
- Health check endpoint for monitoring service availability
- Node details with capacity, allocatable resources, and conditions

✅ **Pod Operations**
- List pods across all namespaces or filter by namespace
- Get detailed pod information including containers, status, and restart counts
- Retrieve logs from individual pods with customizable parameters
- Support for container-specific logs and tail/since options

✅ **Service Discovery**
- List Kubernetes services with endpoint information
- Get detailed service configuration including selectors and ports
- Retrieve aggregated logs from all pods backing a service
- Service endpoint resolution and health status

✅ **Metrics Collection**
- Real-time CPU and memory usage for pods and containers
- Support for metrics-server integration
- Granular metrics per container with usage in nanocores and bytes
- Namespace and pod-specific metric filtering

✅ **Deployment Monitoring**
- List deployments with replica status and update strategy
- Monitor deployment health and rollout status
- Track available, ready, and updated replica counts

✅ **Resource Usage Analytics**
- Namespace-level resource usage summaries
- Count resources like pods, services, deployments, ConfigMaps, secrets, and PVCs
- Cross-namespace resource distribution analysis

✅ **Log Streaming** (Experimental)
- Real-time log streaming using Server-Sent Events
- Follow pod logs in real-time
- Auto-cleanup to prevent hanging connections

## Setup

### Prerequisites

1. **Kubernetes Cluster Access**
   - A running Kubernetes cluster (local or remote)
   - Valid kubeconfig file (usually at `~/.kube/config`)
   - Network connectivity to the Kubernetes API server

2. **Authentication**
   - Proper RBAC permissions for the service account
   - kubectl configured and authenticated

3. **Optional: Metrics Server**
   - Install metrics-server for CPU/memory metrics: `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`

### Environment Variables

```bash
# Optional: Custom kubeconfig path
export KUBECONFIG=/path/to/your/kubeconfig

# Optional: Set default namespace
export KUBERNETES_NAMESPACE=default
```

### Installation

The Kubernetes client library is automatically installed with the server dependencies:

```bash
npm install @kubernetes/client-node
```

## API Endpoints

### Health Check
```
GET /api/kubernetes/health
```
Returns the health status of the Kubernetes API connection.

**Response:**
```json
{
  "status": "healthy",
  "message": "Kubernetes API is accessible"
}
```

### Cluster Information
```
GET /api/kubernetes/cluster
```
Get comprehensive cluster information including nodes, namespaces, and resource counts.

**Response:**
```json
{
  "version": "v1.28.0",
  "nodes": [
    {
      "name": "master-node",
      "status": "Ready",
      "roles": ["master"],
      "version": "v1.28.0",
      "capacity": {
        "cpu": "4",
        "memory": "8Gi",
        "pods": "110"
      }
    }
  ],
  "namespaces": ["default", "kube-system", "kube-public"],
  "totalPods": 15,
  "totalServices": 8,
  "totalDeployments": 5
}
```

### Pods
```
# List all pods
GET /api/kubernetes/pods

# List pods in specific namespace
GET /api/kubernetes/pods?namespace=default

# Get specific pod details
GET /api/kubernetes/pods/{namespace}/{podName}
```

**Response:**
```json
[
  {
    "name": "nginx-deployment-abc123",
    "namespace": "default",
    "status": "Running",
    "restarts": 0,
    "age": "2h",
    "ip": "10.244.1.5",
    "node": "worker-node-1",
    "containers": [
      {
        "name": "nginx",
        "image": "nginx:1.21",
        "ready": true,
        "restartCount": 0,
        "state": "Running"
      }
    ]
  }
]
```

### Services
```
# List all services
GET /api/kubernetes/services

# List services in specific namespace
GET /api/kubernetes/services?namespace=default

# Get specific service details
GET /api/kubernetes/services/{namespace}/{serviceName}
```

**Response:**
```json
[
  {
    "name": "nginx-service",
    "namespace": "default",
    "type": "ClusterIP",
    "clusterIP": "10.96.1.100",
    "ports": [
      {
        "port": 80,
        "targetPort": 8080,
        "protocol": "TCP"
      }
    ],
    "endpoints": [
      {
        "ip": "10.244.1.5",
        "ready": true
      }
    ]
  }
]
```

### Pod Logs
```
# Get pod logs
GET /api/kubernetes/pods/{namespace}/{podName}/logs

# Query parameters:
# - container: specific container name (optional)
# - tailLines: number of lines to return (default: all)
# - sinceSeconds: logs from last N seconds
# - follow: stream logs (true/false)
```

**Example:**
```bash
GET /api/kubernetes/pods/default/nginx-abc123/logs?tailLines=100&container=nginx
```

**Response:**
```json
{
  "logs": "2024-01-15 10:30:00 [INFO] Server started on port 80\n2024-01-15 10:30:05 [INFO] Handling request..."
}
```

### Service Logs
```
# Get logs from all pods backing a service
GET /api/kubernetes/services/{namespace}/{serviceName}/logs?tailLines=50
```

**Response:**
```json
{
  "logs": {
    "nginx-abc123": "2024-01-15 10:30:00 [INFO] Server started...",
    "nginx-def456": "2024-01-15 10:30:00 [INFO] Server started..."
  }
}
```

### Pod Metrics
```
# Get metrics for all pods
GET /api/kubernetes/metrics/pods

# Get metrics for pods in specific namespace
GET /api/kubernetes/metrics/pods?namespace=default

# Get metrics for specific pod
GET /api/kubernetes/metrics/pods?namespace=default&podName=nginx-abc123
```

**Response:**
```json
[
  {
    "podName": "nginx-abc123",
    "namespace": "default",
    "timestamp": "2024-01-15T10:30:00Z",
    "containers": [
      {
        "name": "nginx",
        "cpu": "50m",
        "memory": "128Mi",
        "cpuUsageNanoCores": 50000000,
        "memoryUsageBytes": 134217728
      }
    ]
  }
]
```

### Deployments
```
# List all deployments
GET /api/kubernetes/deployments

# List deployments in specific namespace
GET /api/kubernetes/deployments?namespace=default
```

**Response:**
```json
[
  {
    "name": "nginx-deployment",
    "namespace": "default",
    "replicas": 3,
    "readyReplicas": 3,
    "availableReplicas": 3,
    "strategy": "RollingUpdate",
    "age": "2h"
  }
]
```

### Namespace Resource Usage
```
GET /api/kubernetes/namespaces/usage
```

**Response:**
```json
[
  {
    "namespace": "default",
    "pods": 5,
    "services": 3,
    "deployments": 2,
    "configMaps": 4,
    "secrets": 6,
    "persistentVolumeClaims": 1
  }
]
```

### Log Streaming (Experimental)
```
GET /api/kubernetes/pods/{namespace}/{podName}/logs/stream?container=nginx
```

Returns Server-Sent Events (SSE) for real-time log streaming. Connection auto-closes after 30 seconds.

## Usage Examples

### Get Cluster Overview
```bash
curl "http://localhost:3000/api/kubernetes/cluster"
```

### Monitor Pod Metrics
```bash
curl "http://localhost:3000/api/kubernetes/metrics/pods?namespace=production"
```

### Get Application Logs
```bash
curl "http://localhost:3000/api/kubernetes/services/default/my-app/logs?tailLines=100"
```

### Stream Real-time Logs
```bash
curl -N "http://localhost:3000/api/kubernetes/pods/default/my-pod/logs/stream"
```

## Common Use Cases

### 1. Application Monitoring Dashboard

```typescript
// Frontend code to display pod metrics
const [metrics, setMetrics] = useState([]);

useEffect(() => {
  const fetchMetrics = async () => {
    const response = await fetch('/api/kubernetes/metrics/pods?namespace=production');
    const data = await response.json();
    setMetrics(data);
  };
  
  fetchMetrics();
  const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
  
  return () => clearInterval(interval);
}, []);

// Convert to chart data
const chartData = metrics.map(metric => ({
  pod: metric.podName,
  cpu: metric.containers.reduce((sum, c) => sum + c.cpuUsageNanoCores, 0) / 1000000, // millicores
  memory: metric.containers.reduce((sum, c) => sum + c.memoryUsageBytes, 0) / 1024 / 1024 // MB
}));
```

### 2. Log Aggregation

```typescript
// Get logs from all pods in a service
const fetchServiceLogs = async (namespace: string, serviceName: string) => {
  const response = await fetch(`/api/kubernetes/services/${namespace}/${serviceName}/logs?tailLines=1000`);
  const data = await response.json();
  
  return Object.entries(data.logs).map(([podName, logs]) => ({
    pod: podName,
    logs: logs.split('\n').map(line => ({
      timestamp: extractTimestamp(line),
      message: line,
      level: extractLogLevel(line)
    }))
  }));
};
```

### 3. Resource Usage Analytics

```typescript
// Track resource usage across namespaces
const analyzeResourceUsage = async () => {
  const response = await fetch('/api/kubernetes/namespaces/usage');
  const usage = await response.json();
  
  const totalResources = usage.reduce((total, ns) => ({
    pods: total.pods + ns.pods,
    services: total.services + ns.services,
    deployments: total.deployments + ns.deployments
  }), { pods: 0, services: 0, deployments: 0 });
  
  return { namespaces: usage, totals: totalResources };
};
```

## Error Handling

The API returns structured error responses:

```json
{
  "error": "Description of the error",
  "details": "Additional error details",
  "note": "Optional helpful information"
}
```

Common error scenarios:
- Kubeconfig not found or invalid (500)
- Insufficient RBAC permissions (403)
- Pod/Service not found (404)
- Metrics server not available (500)
- Invalid namespace or resource name (400)

## RBAC Permissions Required

For the service to function properly, ensure the service account has these permissions:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: perceptacle-kubernetes-reader
rules:
- apiGroups: [""]
  resources: ["pods", "services", "namespaces", "endpoints", "nodes", "configmaps", "secrets", "persistentvolumeclaims"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list"]
- apiGroups: ["metrics.k8s.io"]
  resources: ["pods", "nodes"]
  verbs: ["get", "list"]
```

## Development

### Running Locally

1. Ensure kubectl is configured:
   ```bash
   kubectl cluster-info
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. Test the health endpoint:
   ```bash
   curl http://localhost:3000/api/kubernetes/health
   ```

### Testing with Different Clusters

```bash
# Use specific kubeconfig
export KUBECONFIG=/path/to/cluster/config

# Or specify context
kubectl config use-context my-cluster-context
```

### Demo Script

Run the demo to see all available features:

```bash
npx tsx kubernetes-demo.ts
```

## Troubleshooting

### Common Issues

1. **"Kubernetes configuration not found"**
   - Ensure kubeconfig file exists at `~/.kube/config`
   - Or set `KUBECONFIG` environment variable
   - Verify with: `kubectl cluster-info`

2. **"Failed to get pod metrics"**
   - Install metrics-server: `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`
   - Verify metrics-server is running: `kubectl get pods -n kube-system | grep metrics-server`

3. **"Permission denied" errors**
   - Check RBAC permissions for your service account
   - Ensure the account can read pods, services, and other required resources

4. **Connection timeouts**
   - Verify network connectivity to Kubernetes API server
   - Check if API server is accessible: `kubectl get nodes`

5. **Empty metrics response**
   - Metrics may take a few minutes to appear after pod creation
   - Verify metrics-server is collecting data: `kubectl top pods`

### Debugging

Enable debug logging:

```bash
export DEBUG=kubernetes:*
npm run dev
```

Check service logs:
```bash
kubectl logs -f deployment/perceptacle-server
```

## Performance Considerations

- **Metrics collection**: Can be resource-intensive on large clusters
- **Log retrieval**: Use `tailLines` parameter to limit log size
- **Caching**: Consider implementing caching for frequently accessed data
- **Rate limiting**: Be mindful of Kubernetes API rate limits
- **Streaming**: Log streaming connections auto-close after 30 seconds

## Security

- Service requires valid kubeconfig and RBAC permissions
- No authentication is built into the API (add authentication middleware as needed)
- Logs may contain sensitive information - consider filtering
- Network policies should restrict access to Kubernetes API

## Integration with Frontend

The Kubernetes service integrates seamlessly with the existing Perceptacle frontend components:

1. **Existing Components**: Pod and Service icons are already available
2. **Metrics Display**: Can reuse `ObservabilityMetricsDisplay` component
3. **Log Display**: Can reuse `NodeLogs` component
4. **Real-time Updates**: Use WebSockets or polling for live metrics

Example integration in diagram nodes:

```typescript
// Add Kubernetes data to node
const kubernetesNode = {
  type: 'k8s-pod',
  data: {
    name: 'nginx-pod',
    namespace: 'default',
    metrics: podMetrics,
    logs: podLogs,
    status: 'Running'
  }
};
```
