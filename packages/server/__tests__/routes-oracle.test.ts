import request from 'supertest';
import express, { type Express } from 'express';
import oracleRoutes from '../routes/oracle';

// Mock the service factory
jest.mock('../services/service-factory', () => {
  const mockOracleService = {
    getHealth: jest.fn().mockResolvedValue({ status: 'ok', region: 'us-phoenix-1' }),
    getCompartments: jest.fn().mockResolvedValue([
      {
        id: 'ocid1.compartment.oc1..aaaaaaaa1',
        name: 'Development',
        description: 'Development compartment',
        lifecycleState: 'ACTIVE',
        timeCreated: '2024-01-01T00:00:00Z',
      },
    ]),
    getComputeInstances: jest.fn().mockResolvedValue([
      {
        id: 'ocid1.instance.oc1.phx.aaaaaa1',
        displayName: 'web-server-01',
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        availabilityDomain: 'PHX-AD-1',
        lifecycleState: 'RUNNING',
        shape: 'VM.Standard.E4.Flex',
        imageId: 'ocid1.image.oc1.phx.aaaaa1',
        timeCreated: '2024-01-01T00:00:00Z',
        region: 'us-phoenix-1',
        publicIp: '129.213.45.67',
        privateIp: '10.0.1.5',
      },
    ]),
    getComputeInstance: jest.fn().mockResolvedValue({
      id: 'ocid1.instance.oc1.phx.aaaaaa1',
      displayName: 'web-server-01',
      compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      availabilityDomain: 'PHX-AD-1',
      lifecycleState: 'RUNNING',
      shape: 'VM.Standard.E4.Flex',
      imageId: 'ocid1.image.oc1.phx.aaaaa1',
      timeCreated: '2024-01-01T00:00:00Z',
      region: 'us-phoenix-1',
      publicIp: '129.213.45.67',
      privateIp: '10.0.1.5',
    }),
    getVolumes: jest.fn().mockResolvedValue([
      {
        id: 'ocid1.volume.oc1.phx.aaaaa1',
        displayName: 'boot-volume-01',
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        availabilityDomain: 'PHX-AD-1',
        lifecycleState: 'AVAILABLE',
        sizeInGBs: 50,
        sizeInMBs: 51200,
        timeCreated: '2024-01-01T00:00:00Z',
        isHydrated: true,
        vpusPerGB: 10,
      },
    ]),
    getVolume: jest.fn().mockResolvedValue({
      id: 'ocid1.volume.oc1.phx.aaaaa1',
      displayName: 'boot-volume-01',
      compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      availabilityDomain: 'PHX-AD-1',
      lifecycleState: 'AVAILABLE',
      sizeInGBs: 50,
      sizeInMBs: 51200,
      timeCreated: '2024-01-01T00:00:00Z',
      isHydrated: true,
      vpusPerGB: 10,
    }),
    getVcns: jest.fn().mockResolvedValue([
      {
        id: 'ocid1.vcn.oc1.phx.aaaaa1',
        displayName: 'production-vcn',
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        cidrBlock: '10.0.0.0/16',
        cidrBlocks: ['10.0.0.0/16'],
        lifecycleState: 'AVAILABLE',
        timeCreated: '2024-01-01T00:00:00Z',
        defaultRouteTableId: 'ocid1.routetable.oc1.phx.aaaaa1',
        defaultSecurityListId: 'ocid1.securitylist.oc1.phx.aaaaa1',
        defaultDhcpOptionsId: 'ocid1.dhcpoptions.oc1.phx.aaaaa1',
      },
    ]),
    getVcn: jest.fn().mockResolvedValue({
      id: 'ocid1.vcn.oc1.phx.aaaaa1',
      displayName: 'production-vcn',
      compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      cidrBlock: '10.0.0.0/16',
      cidrBlocks: ['10.0.0.0/16'],
      lifecycleState: 'AVAILABLE',
      timeCreated: '2024-01-01T00:00:00Z',
      defaultRouteTableId: 'ocid1.routetable.oc1.phx.aaaaa1',
      defaultSecurityListId: 'ocid1.securitylist.oc1.phx.aaaaa1',
      defaultDhcpOptionsId: 'ocid1.dhcpoptions.oc1.phx.aaaaa1',
    }),
    getDatabaseSystems: jest.fn().mockResolvedValue([
      {
        id: 'ocid1.dbsystem.oc1.phx.aaaaa1',
        displayName: 'production-db',
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        availabilityDomain: 'PHX-AD-1',
        lifecycleState: 'AVAILABLE',
        shape: 'VM.Standard2.4',
        cpuCoreCount: 4,
        dataStorageSizeInGBs: 256,
        nodeCount: 1,
        databaseEdition: 'ENTERPRISE_EDITION',
        timeCreated: '2024-01-01T00:00:00Z',
        hostname: 'prod-db-01',
        domain: 'example.com',
        version: '19.16.0.0',
      },
    ]),
    getDatabaseSystem: jest.fn().mockResolvedValue({
      id: 'ocid1.dbsystem.oc1.phx.aaaaa1',
      displayName: 'production-db',
      compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      availabilityDomain: 'PHX-AD-1',
      lifecycleState: 'AVAILABLE',
      shape: 'VM.Standard2.4',
      cpuCoreCount: 4,
      dataStorageSizeInGBs: 256,
      nodeCount: 1,
      databaseEdition: 'ENTERPRISE_EDITION',
      timeCreated: '2024-01-01T00:00:00Z',
      hostname: 'prod-db-01',
      domain: 'example.com',
      version: '19.16.0.0',
    }),
    getMetrics: jest.fn().mockResolvedValue([
      {
        namespace: 'oci_computeagent',
        name: 'CpuUtilization',
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        dimensions: { resourceId: 'ocid1.instance.oc1.phx.aaaaaa1' },
        metadata: { unit: 'percent' },
        aggregatedDatapoints: [
          { timestamp: new Date(), value: 45.5 },
        ],
      },
    ]),
  };

  return {
    serviceFactory: {
      createOracleService: jest.fn().mockReturnValue(mockOracleService),
      isUsingMocks: jest.fn().mockReturnValue(true),
    },
  };
});

describe('Oracle Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/oracle', oracleRoutes);
  });

  describe('GET /api/oracle/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/oracle/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('region');
    });
  });

  describe('GET /api/oracle/compartments', () => {
    it('should return compartments list', async () => {
      const response = await request(app)
        .get('/api/oracle/compartments')
        .query({ tenancyId: 'ocid1.tenancy.oc1..mock' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 400 if tenancyId is missing', async () => {
      const response = await request(app).get('/api/oracle/compartments');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/oracle/compute/instances', () => {
    it('should return compute instances', async () => {
      const response = await request(app)
        .get('/api/oracle/compute/instances')
        .query({ compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('displayName');
    });

    it('should return 400 if compartmentId is missing', async () => {
      const response = await request(app).get('/api/oracle/compute/instances');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/oracle/compute/instances/:instanceId', () => {
    it('should return a specific compute instance', async () => {
      const response = await request(app).get('/api/oracle/compute/instances/ocid1.instance.oc1.phx.aaaaaa1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'ocid1.instance.oc1.phx.aaaaaa1');
      expect(response.body).toHaveProperty('displayName');
    });
  });

  describe('GET /api/oracle/storage/volumes', () => {
    it('should return block volumes', async () => {
      const response = await request(app)
        .get('/api/oracle/storage/volumes')
        .query({ compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('sizeInGBs');
    });

    it('should return 400 if compartmentId is missing', async () => {
      const response = await request(app).get('/api/oracle/storage/volumes');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/oracle/storage/volumes/:volumeId', () => {
    it('should return a specific volume', async () => {
      const response = await request(app).get('/api/oracle/storage/volumes/ocid1.volume.oc1.phx.aaaaa1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'ocid1.volume.oc1.phx.aaaaa1');
      expect(response.body).toHaveProperty('sizeInGBs');
    });
  });

  describe('GET /api/oracle/networking/vcns', () => {
    it('should return VCNs', async () => {
      const response = await request(app)
        .get('/api/oracle/networking/vcns')
        .query({ compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('cidrBlock');
    });

    it('should return 400 if compartmentId is missing', async () => {
      const response = await request(app).get('/api/oracle/networking/vcns');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/oracle/networking/vcns/:vcnId', () => {
    it('should return a specific VCN', async () => {
      const response = await request(app).get('/api/oracle/networking/vcns/ocid1.vcn.oc1.phx.aaaaa1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'ocid1.vcn.oc1.phx.aaaaa1');
      expect(response.body).toHaveProperty('cidrBlock');
    });
  });

  describe('GET /api/oracle/database/systems', () => {
    it('should return database systems', async () => {
      const response = await request(app)
        .get('/api/oracle/database/systems')
        .query({ compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('cpuCoreCount');
    });

    it('should return 400 if compartmentId is missing', async () => {
      const response = await request(app).get('/api/oracle/database/systems');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/oracle/database/systems/:dbSystemId', () => {
    it('should return a specific database system', async () => {
      const response = await request(app).get('/api/oracle/database/systems/ocid1.dbsystem.oc1.phx.aaaaa1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'ocid1.dbsystem.oc1.phx.aaaaa1');
      expect(response.body).toHaveProperty('cpuCoreCount');
    });
  });

  describe('POST /api/oracle/metrics', () => {
    it('should return metrics data', async () => {
      const response = await request(app)
        .post('/api/oracle/metrics')
        .send({
          compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
          namespace: 'oci_computeagent',
          query: 'CpuUtilization[1m].mean()',
        });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('aggregatedDatapoints');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/oracle/metrics')
        .send({
          compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
