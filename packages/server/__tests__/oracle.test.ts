import { MockOracleService, OracleCredentials } from '../services';

describe('MockOracleService', () => {
  let service: MockOracleService;
  const mockCredentials: OracleCredentials = {
    tenancy: 'ocid1.tenancy.oc1..mock',
    user: 'ocid1.user.oc1..mock',
    fingerprint: 'mock:fingerprint',
    privateKey: 'mock-private-key',
    region: 'us-phoenix-1',
  };

  beforeEach(() => {
    service = new MockOracleService(mockCredentials);
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const health = await service.getHealth();
      expect(health.status).toBe('ok');
      expect(health.region).toBe('us-phoenix-1');
    });
  });

  describe('Compartments', () => {
    it('should return list of compartments', async () => {
      const compartments = await service.getCompartments('ocid1.tenancy.oc1..mock');
      expect(Array.isArray(compartments)).toBe(true);
      expect(compartments.length).toBeGreaterThan(0);
      expect(compartments[0]).toHaveProperty('id');
      expect(compartments[0]).toHaveProperty('name');
      expect(compartments[0]).toHaveProperty('lifecycleState');
    });

    it('should return compartments with correct structure', async () => {
      const compartments = await service.getCompartments('ocid1.tenancy.oc1..mock');
      const compartment = compartments[0];
      
      expect(compartment.id).toBeDefined();
      expect(compartment.name).toBeDefined();
      expect(compartment.description).toBeDefined();
      expect(compartment.lifecycleState).toBe('ACTIVE');
      expect(compartment.timeCreated).toBeDefined();
    });
  });

  describe('Compute Instances', () => {
    it('should return list of compute instances', async () => {
      const instances = await service.getComputeInstances({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      });
      
      expect(Array.isArray(instances)).toBe(true);
      expect(instances.length).toBeGreaterThan(0);
      expect(instances[0]).toHaveProperty('id');
      expect(instances[0]).toHaveProperty('displayName');
      expect(instances[0]).toHaveProperty('lifecycleState');
    });

    it('should filter instances by state', async () => {
      const instances = await service.getComputeInstances({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        state: 'RUNNING',
      });
      
      instances.forEach(instance => {
        expect(instance.lifecycleState).toBe('RUNNING');
      });
    });

    it('should apply limit to results', async () => {
      const instances = await service.getComputeInstances({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        limit: 1,
      });
      
      expect(instances.length).toBe(1);
    });

    it('should get a specific compute instance', async () => {
      const instance = await service.getComputeInstance('ocid1.instance.oc1.phx.aaaaaa1');
      
      expect(instance).toBeDefined();
      expect(instance.id).toBe('ocid1.instance.oc1.phx.aaaaaa1');
      expect(instance.displayName).toBeDefined();
      expect(instance.shape).toBeDefined();
      expect(instance.region).toBe('us-phoenix-1');
    });

    it('should return instances with IP addresses', async () => {
      const instances = await service.getComputeInstances({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      });
      
      const runningInstance = instances.find(i => i.lifecycleState === 'RUNNING');
      expect(runningInstance?.privateIp).toBeDefined();
    });
  });

  describe('Block Volumes', () => {
    it('should return list of volumes', async () => {
      const volumes = await service.getVolumes({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      });
      
      expect(Array.isArray(volumes)).toBe(true);
      expect(volumes.length).toBeGreaterThan(0);
      expect(volumes[0]).toHaveProperty('id');
      expect(volumes[0]).toHaveProperty('displayName');
      expect(volumes[0]).toHaveProperty('sizeInGBs');
    });

    it('should filter volumes by state', async () => {
      const volumes = await service.getVolumes({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        state: 'AVAILABLE',
      });
      
      volumes.forEach(volume => {
        expect(volume.lifecycleState).toBe('AVAILABLE');
      });
    });

    it('should apply limit to volume results', async () => {
      const volumes = await service.getVolumes({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        limit: 2,
      });
      
      expect(volumes.length).toBe(2);
    });

    it('should get a specific volume', async () => {
      const volume = await service.getVolume('ocid1.volume.oc1.phx.aaaaa1');
      
      expect(volume).toBeDefined();
      expect(volume.id).toBe('ocid1.volume.oc1.phx.aaaaa1');
      expect(volume.sizeInGBs).toBeGreaterThan(0);
      expect(volume.isHydrated).toBe(true);
    });
  });

  describe('Virtual Cloud Networks', () => {
    it('should return list of VCNs', async () => {
      const vcns = await service.getVcns({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      });
      
      expect(Array.isArray(vcns)).toBe(true);
      expect(vcns.length).toBeGreaterThan(0);
      expect(vcns[0]).toHaveProperty('id');
      expect(vcns[0]).toHaveProperty('displayName');
      expect(vcns[0]).toHaveProperty('cidrBlock');
    });

    it('should filter VCNs by state', async () => {
      const vcns = await service.getVcns({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        state: 'AVAILABLE',
      });
      
      vcns.forEach(vcn => {
        expect(vcn.lifecycleState).toBe('AVAILABLE');
      });
    });

    it('should get a specific VCN', async () => {
      const vcn = await service.getVcn('ocid1.vcn.oc1.phx.aaaaa1');
      
      expect(vcn).toBeDefined();
      expect(vcn.id).toBe('ocid1.vcn.oc1.phx.aaaaa1');
      expect(vcn.cidrBlock).toBeDefined();
      expect(vcn.cidrBlocks).toBeInstanceOf(Array);
    });

    it('should return VCNs with networking details', async () => {
      const vcns = await service.getVcns({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      });
      
      const vcn = vcns[0];
      expect(vcn.defaultRouteTableId).toBeDefined();
      expect(vcn.defaultSecurityListId).toBeDefined();
      expect(vcn.defaultDhcpOptionsId).toBeDefined();
    });
  });

  describe('Database Systems', () => {
    it('should return list of database systems', async () => {
      const databases = await service.getDatabaseSystems({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      });
      
      expect(Array.isArray(databases)).toBe(true);
      expect(databases.length).toBeGreaterThan(0);
      expect(databases[0]).toHaveProperty('id');
      expect(databases[0]).toHaveProperty('displayName');
      expect(databases[0]).toHaveProperty('shape');
    });

    it('should filter databases by state', async () => {
      const databases = await service.getDatabaseSystems({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        state: 'AVAILABLE',
      });
      
      databases.forEach(db => {
        expect(db.lifecycleState).toBe('AVAILABLE');
      });
    });

    it('should get a specific database system', async () => {
      const database = await service.getDatabaseSystem('ocid1.dbsystem.oc1.phx.aaaaa1');
      
      expect(database).toBeDefined();
      expect(database.id).toBe('ocid1.dbsystem.oc1.phx.aaaaa1');
      expect(database.cpuCoreCount).toBeGreaterThan(0);
      expect(database.dataStorageSizeInGBs).toBeGreaterThan(0);
    });

    it('should return databases with version and edition info', async () => {
      const databases = await service.getDatabaseSystems({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
      });
      
      const database = databases[0];
      expect(database.version).toBeDefined();
      expect(database.databaseEdition).toBeDefined();
      expect(database.hostname).toBeDefined();
    });
  });

  describe('Metrics', () => {
    it('should return metrics data', async () => {
      const metrics = await service.getMetrics({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        namespace: 'oci_computeagent',
        query: 'CpuUtilization[1m].mean()',
      });
      
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0]).toHaveProperty('namespace');
      expect(metrics[0]).toHaveProperty('name');
      expect(metrics[0]).toHaveProperty('aggregatedDatapoints');
    });

    it('should return metrics with datapoints', async () => {
      const metrics = await service.getMetrics({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        namespace: 'oci_computeagent',
        query: 'CpuUtilization[1m].mean()',
      });
      
      const metric = metrics[0];
      expect(metric.aggregatedDatapoints).toBeInstanceOf(Array);
      expect(metric.aggregatedDatapoints.length).toBeGreaterThan(0);
      
      const datapoint = metric.aggregatedDatapoints[0];
      expect(datapoint).toHaveProperty('timestamp');
      expect(datapoint).toHaveProperty('value');
      expect(typeof datapoint.value).toBe('number');
    });

    it('should return metrics with dimensions', async () => {
      const metrics = await service.getMetrics({
        compartmentId: 'ocid1.compartment.oc1..aaaaaaaa1',
        namespace: 'oci_computeagent',
        query: 'CpuUtilization[1m].mean()',
      });
      
      const metric = metrics[0];
      expect(metric.dimensions).toBeDefined();
      expect(typeof metric.dimensions).toBe('object');
    });
  });

  describe('Factory Method', () => {
    it('should create service from credentials', () => {
      const service = MockOracleService.fromCredentials(mockCredentials);
      expect(service).toBeInstanceOf(MockOracleService);
    });

    it('should maintain credentials in created service', async () => {
      const service = MockOracleService.fromCredentials(mockCredentials);
      const health = await service.getHealth();
      expect(health.region).toBe(mockCredentials.region);
    });
  });
});
