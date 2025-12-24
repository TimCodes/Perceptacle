import { KubernetesService } from '../services/kubernetes';
import { AzureService } from '../services/azure';
import { LogFormatter } from '../utils/log-formatter';
// Import necessary types if needed, or just mock them
// import { k8s, ClientSecretCredential, DefaultAzureCredential } from '../tests/mocks';

// Stub for DefaultAzureCredential since it is used in the test setup
class DefaultAzureCredential { }

// Mock dependencies
jest.mock('@kubernetes/client-node', () => ({
    KubeConfig: jest.fn().mockImplementation(() => ({
        loadFromDefault: jest.fn(),
        loadFromString: jest.fn(),
        makeApiClient: jest.fn().mockReturnThis(),
    })),
    CoreV1Api: jest.fn(),
    AppsV1Api: jest.fn(),
}));

jest.mock('@azure/identity', () => ({
    ClientSecretCredential: jest.fn(),
    DefaultAzureCredential: jest.fn(),
}));

jest.mock('@azure/monitor-query-logs', () => ({
    LogsQueryClient: jest.fn().mockImplementation(() => ({
        queryWorkspace: jest.fn().mockResolvedValue({
            status: 'Success',
            tables: [
                {
                    name: 'PrimaryResult',
                    rows: [
                        ['2023-01-01T12:00:00Z', 'Info', 'Test Message 1', 'ResourceId1'],
                        ['2023-01-01T12:01:00Z', 'Error', 'Test Message 2', 'ResourceId2'],
                    ],
                    columnDescriptors: [
                        { name: 'TimeGenerated', type: 'datetime' },
                        { name: 'Level', type: 'string' },
                        { name: 'Message', type: 'string' },
                        { name: 'ResourceId', type: 'string' },
                    ],
                },
            ],
        }),
    })),
}));

describe('Log Ingestion Pipeline', () => {
    describe('KubernetesService', () => {
        let service: KubernetesService;
        let mockK8sApi: any;

        beforeEach(() => {
            service = new KubernetesService();
            // Access the private k8sApi property or mock it via getPrototypeOf if strictly private
            // For this test, we assume we can spy on the underlying call or use the mock we set up
            mockK8sApi = (service as any).k8sApi;
            mockK8sApi.readNamespacedPodLog = jest.fn().mockResolvedValue('Log line 1\nLog line 2');
        });

        it('should fetch pod logs using readNamespacedPodLog', async () => {
            const logs = await service.getPodLogs({
                podName: 'test-pod',
                namespace: 'default',
                containerName: 'test-container'
            });

            expect(mockK8sApi.readNamespacedPodLog).toHaveBeenCalledWith(
                'test-pod',
                'default',
                'test-container'
            );
            expect(logs).toBe('Log line 1\nLog line 2');
        });
    });

    describe('AzureService', () => {
        let service: AzureService;

        beforeEach(() => {
            service = new AzureService(new DefaultAzureCredential() as any, 'test-sub-id');
        });

        it('should fetch logs using LogsQueryClient', async () => {
            const logs = await service.getLogs({
                resourceId: 'test-resource',
                workspaceId: 'test-workspace',
                query: 'AppTraces | take 10'
            });

            expect(logs).toHaveLength(2);
            expect(logs[0].message).toBe('Test Message 1');
            expect(logs[1].level).toBe('Error');
        });
    });

    describe('LogFormatter', () => {
        it('should format Azure logs correctly', () => {
            const logs = [
                {
                    timestamp: new Date('2023-01-01T12:00:00Z'),
                    level: 'Info',
                    message: 'Test Message 1',
                    properties: {}
                },
                {
                    timestamp: new Date('2023-01-01T12:01:00Z'),
                    level: 'Error',
                    message: 'Test Message 2',
                    properties: {}
                }
            ];

            const formatted = LogFormatter.formatAzureLogs(logs);
            expect(formatted).toContain('2023-01-01T12:00:00.000Z [INFO] Test Message 1');
            expect(formatted).toContain('2023-01-01T12:01:00.000Z [ERROR] Test Message 2');
        });

        it('should format text logs correctly', () => {
            const logs = 'Line 1\nLine 2';
            const formatted = LogFormatter.formatTextLogs(logs);
            expect(formatted).toBe('Line 1\nLine 2');
        });

        it('should handle array of strings for text logs', () => {
            const logs = ['Line 1', 'Line 2'];
            const formatted = LogFormatter.formatTextLogs(logs);
            expect(formatted).toBe('Line 1\nLine 2');
        });
    });
});
