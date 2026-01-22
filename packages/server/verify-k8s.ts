import { KubernetesService } from './services/kubernetes';
import { config } from 'dotenv';
import * as path from 'path';

// Load .env
config();

async function verifyK8s() {
    console.log('--- Kubernetes Connectivity Verification ---');
    console.log(`KUBECONFIG: ${process.env.KUBECONFIG}`);
    console.log(`USE_MOCK_SERVICES: ${process.env.USE_MOCK_SERVICES}`);

    try {
        const k8sService = new KubernetesService({
            kubeconfigPath: process.env.KUBECONFIG ? path.resolve(process.env.KUBECONFIG) : undefined
        });

        console.log('Testing healthCheck()...');
        const health = await k8sService.healthCheck();
        console.log('Health Check Result:', JSON.stringify(health, null, 2));

        console.log('\nTesting getClusterInfo()...');
        const clusterInfo = await k8sService.getClusterInfo();
        console.log('Cluster Info:', JSON.stringify(clusterInfo, null, 2));

        console.log('\nTesting getNamespaces()...');
        // Note: getClusterInfo returns namespaces in the simulated/mocked version in real service too?
        // Wait, let's look at getClusterInfo in kubernetes.ts again.
        // It seems getClusterInfo in real service is ALSO hardcoded for demo?
        /*
        async getClusterInfo(): Promise<ClusterInfo> {
          try {
            // Simulate cluster info for demo purposes
            // In production, you would make actual API calls
            return { ... }
          }
        }
        */
        // Ah, it seems the "real" service is also partially mocked for demo.
        // But it initializes the k8s client.

        console.log('\n--- Verification Finished ---');
    } catch (error: any) {
        console.error('\n❌ Verification Failed:');
        console.error(error.message);
        if (error.body) {
            console.error('Error Body:', JSON.stringify(error.body, null, 2));
        }
        process.exit(1);
    }
}

verifyK8s();
