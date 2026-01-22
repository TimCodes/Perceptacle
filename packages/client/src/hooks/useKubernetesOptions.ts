import { useState, useEffect } from 'react';
import { fetchKubernetesOptions, KubernetesOptions } from '../services/kubernetes-api';

interface UseKubernetesOptionsResult {
    options: KubernetesOptions;
    loading: boolean;
    available: boolean;
    error: Error | null;
    refresh: () => void;
}

const emptyOptions: KubernetesOptions = {
    namespaces: [],
    pods: [],
    services: [],
    deployments: []
};

export function useKubernetesOptions(namespace?: string): UseKubernetesOptionsResult {
    const [options, setOptions] = useState<KubernetesOptions>(emptyOptions);
    const [loading, setLoading] = useState(true);
    const [available, setAvailable] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchKubernetesOptions(namespace);
            setOptions(data);
            setAvailable(true);
        } catch (err: any) {
            console.warn('Failed to fetch Kubernetes options, falling back to manual entry:', err);
            // We don't clear options here to potentially keep stale data if it was useful, 
            // but usually we want to reset if fetch failed? 
            // Actually, if it fails, we just set available=false so UI knows to switch to manual input
            setAvailable(false);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [namespace]);

    return {
        options,
        loading,
        available,
        error,
        refresh: fetchData
    };
}
