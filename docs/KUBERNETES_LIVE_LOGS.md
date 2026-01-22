# Kubernetes Live Logs Configuration

This guide explains how to configure the Kubernetes service to pull **live, non-mocked logs** from your Kubernetes cluster.

## Overview

The Kubernetes service can operate in two modes:
- **Mock Mode**: Returns simulated data for development and testing
- **Live Mode**: Connects to a real Kubernetes cluster and pulls actual logs

## Configuration

### Environment Variables

The service mode is controlled by environment variables in your `.env` or `.env.development` file:

#### 1. Enable Live Mode

Set `USE_MOCK_SERVICES` to `false` to enable live data retrieval:

```bash
USE_MOCK_SERVICES=false
```

**Note**: In development mode (`NODE_ENV=development`), the service defaults to mock mode unless explicitly disabled.

#### 2. Configure Kubernetes Connection

Choose one of the following methods:

##### Option A: Use Default Kubeconfig (Recommended)

If you have `kubectl` configured on your system, the service will automatically use your default kubeconfig:

```bash
# No additional configuration needed if ~/.kube/config exists
```

##### Option B: Specify Kubeconfig Path

Point to a specific kubeconfig file:

```bash
KUBECONFIG=/path/to/your/kubeconfig
```

##### Option C: Provide Kubeconfig Content

For containerized deployments, provide the kubeconfig content directly:

```bash
KUBECONFIG_CONTENT='<base64-encoded-kubeconfig-yaml>'
```

##### Option D: Specify Kubernetes Context

Use a specific context from your kubeconfig:

```bash
KUBE_CONTEXT=my-cluster-context
```

### Complete Example Configuration

Here's a complete `.env.development` file for live Kubernetes logs:

```bash
# Service Mode
USE_MOCK_SERVICES=false
NODE_ENV=development

# Kubernetes Configuration
KUBECONFIG=/Users/yourname/.kube/config
KUBE_CONTEXT=production-cluster

# Optional: Other service configurations
GITHUB_TOKEN=your_github_token
AZURE_SUBSCRIPTION_ID=your_subscription_id
```

## Verification

### 1. Check Service Initialization

When the server starts, you should see:

```
Kubernetes service initialized (using real implementation)
```

Instead of:

```
Kubernetes service initialized (using mock implementation)
```

### 2. Test Live Logs

Make a request to fetch logs:

```bash
# Get logs for a specific pod
curl http://localhost:5000/api/kubernetes/pods/default/my-pod-name/logs

# Get logs for all pods in a service
curl http://localhost:5000/api/kubernetes/services/default/my-service-name/logs?tailLines=100
```

### 3. Check Response Metadata

The response will include metadata indicating the source:

```json
{
  "logs": {
    "pod-abc-123": "2024-01-15 10:00:00 INFO Application started\n..."
  },
  "metadata": {
    "namespace": "default",
    "serviceName": "my-service",
    "source": "live",
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

- `source: "live"` = Live data from Kubernetes
- `source: "mock"` = Mock/simulated data

### 4. Monitor Server Logs

Watch the server console for detailed logging:

```
[Kubernetes Service] Fetching LIVE logs for service: my-service in namespace: default
[Kubernetes Service] Service selector: {"app":"my-app"}
[Kubernetes Service] Found 3 pod(s) for service my-service
[Kubernetes Service] Processing logs for 3 pod(s)
[Kubernetes Service] Fetching logs for pod: my-app-abc123
[Kubernetes Service] Successfully retrieved 100 log lines for pod my-app-abc123
```

## API Endpoints

### Get Pod Logs

**Endpoint**: `GET /api/kubernetes/pods/:namespace/:podName/logs`

**Parameters**:
- `namespace` (required): Kubernetes namespace
- `podName` (required): Name of the pod
- `container` (optional): Specific container name
- `tailLines` (optional): Number of lines to return (default: 100)
- `sinceSeconds` (optional): Return logs from last N seconds

**Example**:
```bash
curl "http://localhost:5000/api/kubernetes/pods/default/nginx-abc123/logs?tailLines=50&container=nginx"
```

### Get Service Logs

**Endpoint**: `GET /api/kubernetes/services/:namespace/:serviceName/logs`

**Parameters**:
- `namespace` (required): Kubernetes namespace
- `serviceName` (required): Name of the service
- `tailLines` (optional): Number of lines per pod (default: 100)

**Example**:
```bash
curl "http://localhost:5000/api/kubernetes/services/default/my-web-service/logs?tailLines=200"
```

**Note**: Service logs will return logs from up to 5 pods backing the service to avoid timeouts.

## Troubleshooting

### Error: "Kubernetes configuration not found"

**Solution**: Ensure one of the following:
1. `~/.kube/config` exists and is valid
2. `KUBECONFIG` environment variable points to a valid file
3. `KUBECONFIG_CONTENT` contains valid base64-encoded kubeconfig

### Error: "Failed to connect to Kubernetes cluster"

**Solution**: 
1. Verify your kubeconfig is valid: `kubectl cluster-info`
2. Check network connectivity to your cluster
3. Ensure you have proper RBAC permissions

### Still Seeing Mock Data

**Solution**:
1. Verify `USE_MOCK_SERVICES=false` is set
2. Check server logs on startup for service initialization message
3. Restart the server after changing environment variables

### Logs Return Empty

**Solution**:
1. Verify the pod/service exists: `kubectl get pods -n <namespace>`
2. Check pod status: `kubectl describe pod <pod-name> -n <namespace>`
3. Ensure the pod has actually generated logs
4. Check RBAC permissions to read pod logs

## Security Considerations

### Production Deployment

1. **Never commit kubeconfig to version control**
   - Add `.env*` to `.gitignore`
   - Use secrets management (e.g., Kubernetes secrets, Vault)

2. **Use Service Accounts**
   - Create a dedicated service account with minimal permissions
   - Only grant `pods/log` read access

3. **RBAC Example**:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: perceptacle-log-reader
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: pod-log-reader
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["services"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: perceptacle-log-reader-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: pod-log-reader
subjects:
- kind: ServiceAccount
  name: perceptacle-log-reader
  namespace: default
```

## Performance Optimization

### Limit Log Lines

To improve performance and reduce memory usage:

```bash
# Fetch only last 50 lines
curl "http://localhost:5000/api/kubernetes/services/default/my-service/logs?tailLines=50"
```

### Pod Limit

The service automatically limits to 5 pods per service to prevent timeouts. For services with many pods, only the first 5 will return logs.

## Additional Resources

- [Kubernetes Service Documentation](./KUBERNETES_SERVICE.md)
- [Service Factory Configuration](../packages/server/services/service-factory.ts)
- [Kubernetes API Reference](https://kubernetes.io/docs/reference/kubernetes-api/)
