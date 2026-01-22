import express from 'express';
import request from 'supertest';
import kubernetesRouter from '../routes/kubernetes';

// Mock the service factory
const mockGetClusterInfo = jest.fn();
const mockGetPods = jest.fn();
const mockGetServices = jest.fn();
const mockGetDeployments = jest.fn();
const mockHealthCheck = jest.fn();

jest.mock('../services/service-factory', () => ({
    serviceFactory: {
        createKubernetesService: jest.fn(() => ({
            getClusterInfo: mockGetClusterInfo,
            getPods: mockGetPods,
            getServices: mockGetServices,
            getDeployments: mockGetDeployments,
            healthCheck: mockHealthCheck
        })),
        isUsingMocks: jest.fn(() => true)
    }
}));

const app = express();
app.use('/api/kubernetes', kubernetesRouter);

describe('Kubernetes Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        mockGetClusterInfo.mockResolvedValue({ namespaces: ['default', 'kube-system'] });
        mockGetPods.mockResolvedValue([
            { name: 'pod-1', namespace: 'default' },
            { name: 'pod-2', namespace: 'kube-system' }
        ]);
        mockGetServices.mockResolvedValue([
            { name: 'service-1', namespace: 'default' }
        ]);
        mockGetDeployments.mockResolvedValue([
            { name: 'deploy-1', namespace: 'default' }
        ]);
        mockHealthCheck.mockResolvedValue({ status: 'healthy' });
    });

    describe('GET /api/kubernetes/options', () => {
        it('should return aggregated options', async () => {
            const response = await request(app).get('/api/kubernetes/options');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                namespaces: ['default', 'kube-system'],
                pods: [
                    { name: 'pod-1', namespace: 'default' },
                    { name: 'pod-2', namespace: 'kube-system' }
                ],
                services: [
                    { name: 'service-1', namespace: 'default' }
                ],
                deployments: [
                    { name: 'deploy-1', namespace: 'default' }
                ]
            });

            expect(mockGetClusterInfo).toHaveBeenCalled();
            expect(mockGetPods).toHaveBeenCalledWith(undefined);
            expect(mockGetServices).toHaveBeenCalledWith(undefined);
            expect(mockGetDeployments).toHaveBeenCalledWith(undefined);
        });

        it('should pass namespace query parameter', async () => {
            const response = await request(app).get('/api/kubernetes/options?namespace=default');

            expect(response.status).toBe(200);
            expect(mockGetPods).toHaveBeenCalledWith('default');
            expect(mockGetServices).toHaveBeenCalledWith('default');
            expect(mockGetDeployments).toHaveBeenCalledWith('default');
        });

        it('should handle service errors gracefully', async () => {
            mockGetClusterInfo.mockRejectedValue(new Error('Cluster connection failed'));

            const response = await request(app).get('/api/kubernetes/options');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
});
