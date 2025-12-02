import { useDiagramStore } from './diagram-store';

interface LogMessage {
  message: string;
  level: 'info' | 'warning' | 'error';
}

type ComponentType = 'compute-engine' | 'cloud-storage' | 'cloud-sql';

const mockLogMessages: Record<ComponentType, LogMessage[]> = {
  'compute-engine': [
    { message: 'Instance started successfully', level: 'info' },
    { message: 'High CPU usage detected: 85%', level: 'warning' },
    { message: 'Memory utilization approaching threshold', level: 'warning' },
    { message: 'Instance failed to respond', level: 'error' }
  ],
  'cloud-storage': [
    { message: 'Bucket access optimized', level: 'info' },
    { message: 'Storage quota at 80%', level: 'warning' },
    { message: 'Object uploaded successfully', level: 'info' },
    { message: 'Access denied to bucket', level: 'error' }
  ],
  'cloud-sql': [
    { message: 'Database backup completed', level: 'info' },
    { message: 'High query latency detected', level: 'warning' },
    { message: 'Connection pool near capacity', level: 'warning' },
    { message: 'Database failover initiated', level: 'error' }
  ]
};

export function startMockLogGenerator() {
  const { nodes, addNodeLog } = useDiagramStore.getState();

  const generateLog = () => {
    nodes.forEach(node => {
      const componentType = (node.data.type || 'compute-engine') as ComponentType;
      const logs = mockLogMessages[componentType] || mockLogMessages['compute-engine'];
      const randomLog = logs[Math.floor(Math.random() * logs.length)];

      // 30% chance to generate a log for each component
      if (Math.random() < 0.3) {
        addNodeLog(node.id, randomLog.message, randomLog.level);
      }
    });
  };

  // Generate logs every 5 seconds
  const intervalId = setInterval(generateLog, 5000);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
