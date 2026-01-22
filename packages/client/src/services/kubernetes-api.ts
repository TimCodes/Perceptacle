export interface KubernetesOptions {
    namespaces: string[];
    pods: { name: string; namespace: string }[];
    services: { name: string; namespace: string }[];
    deployments: { name: string; namespace: string }[];
}

export async function fetchKubernetesOptions(namespace?: string): Promise<KubernetesOptions> {
    const url = namespace
        ? `/api/kubernetes/options?namespace=${encodeURIComponent(namespace)}`
        : '/api/kubernetes/options';

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch Kubernetes options');
    }

    return response.json();
}
