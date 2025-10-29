import {
  OracleCredentials,
  ComputeInstanceParams,
  VolumeParams,
  VcnParams,
  DatabaseParams,
  MetricParams,
  ComputeInstance,
  Volume,
  Vcn,
  DatabaseSystem,
  MetricData,
  Compartment,
} from "./oracle";

/**
 * Mock Oracle Cloud Infrastructure Service for testing and development
 */
export class MockOracleService {
  private credentials: OracleCredentials;

  constructor(credentials: OracleCredentials) {
    this.credentials = credentials;
  }

  /**
   * Static factory method to create service from credentials
   */
  static fromCredentials(credentials: OracleCredentials): MockOracleService {
    return new MockOracleService(credentials);
  }

  /**
   * Get compartments list
   */
  async getCompartments(tenancyId: string): Promise<Compartment[]> {
    // Return mock compartments
    return [
      {
        id: "ocid1.compartment.oc1..aaaaaaaa1",
        name: "Development",
        description: "Development environment compartment",
        lifecycleState: "ACTIVE",
        timeCreated: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: "ocid1.compartment.oc1..aaaaaaaa2",
        name: "Production",
        description: "Production environment compartment",
        lifecycleState: "ACTIVE",
        timeCreated: new Date(Date.now() - 86400000 * 60).toISOString(),
      },
      {
        id: "ocid1.compartment.oc1..aaaaaaaa3",
        name: "Testing",
        description: "Testing and QA compartment",
        lifecycleState: "ACTIVE",
        timeCreated: new Date(Date.now() - 86400000 * 45).toISOString(),
      },
    ];
  }

  /**
   * Get compute instances
   */
  async getComputeInstances(params: ComputeInstanceParams): Promise<ComputeInstance[]> {
    const mockInstances: ComputeInstance[] = [
      {
        id: "ocid1.instance.oc1.phx.aaaaaa1",
        displayName: "web-server-01",
        compartmentId: params.compartmentId,
        availabilityDomain: "PHX-AD-1",
        lifecycleState: "RUNNING",
        shape: "VM.Standard.E4.Flex",
        imageId: "ocid1.image.oc1.phx.aaaaa1",
        timeCreated: new Date(Date.now() - 86400000 * 7).toISOString(),
        region: this.credentials.region,
        faultDomain: "FAULT-DOMAIN-1",
        metadata: {
          ssh_authorized_keys: "ssh-rsa AAAAB3...",
        },
        publicIp: "129.213.45.67",
        privateIp: "10.0.1.5",
      },
      {
        id: "ocid1.instance.oc1.phx.aaaaaa2",
        displayName: "app-server-01",
        compartmentId: params.compartmentId,
        availabilityDomain: "PHX-AD-2",
        lifecycleState: "RUNNING",
        shape: "VM.Standard2.4",
        imageId: "ocid1.image.oc1.phx.aaaaa2",
        timeCreated: new Date(Date.now() - 86400000 * 14).toISOString(),
        region: this.credentials.region,
        faultDomain: "FAULT-DOMAIN-2",
        metadata: {
          user_data: "base64encodeddata",
        },
        publicIp: "129.213.45.68",
        privateIp: "10.0.1.6",
      },
      {
        id: "ocid1.instance.oc1.phx.aaaaaa3",
        displayName: "database-server-01",
        compartmentId: params.compartmentId,
        availabilityDomain: "PHX-AD-1",
        lifecycleState: "STOPPED",
        shape: "VM.Standard2.8",
        imageId: "ocid1.image.oc1.phx.aaaaa3",
        timeCreated: new Date(Date.now() - 86400000 * 21).toISOString(),
        region: this.credentials.region,
        faultDomain: "FAULT-DOMAIN-1",
        metadata: {},
        privateIp: "10.0.1.10",
      },
    ];

    // Filter by state if provided
    if (params.state) {
      return mockInstances.filter((instance) => instance.lifecycleState === params.state);
    }

    // Apply limit if provided
    if (params.limit) {
      return mockInstances.slice(0, params.limit);
    }

    return mockInstances;
  }

  /**
   * Get a specific compute instance
   */
  async getComputeInstance(instanceId: string): Promise<ComputeInstance> {
    return {
      id: instanceId,
      displayName: "web-server-01",
      compartmentId: "ocid1.compartment.oc1..aaaaaaaa1",
      availabilityDomain: "PHX-AD-1",
      lifecycleState: "RUNNING",
      shape: "VM.Standard.E4.Flex",
      imageId: "ocid1.image.oc1.phx.aaaaa1",
      timeCreated: new Date(Date.now() - 86400000 * 7).toISOString(),
      region: this.credentials.region,
      faultDomain: "FAULT-DOMAIN-1",
      metadata: {
        ssh_authorized_keys: "ssh-rsa AAAAB3...",
      },
      publicIp: "129.213.45.67",
      privateIp: "10.0.1.5",
    };
  }

  /**
   * Get block volumes
   */
  async getVolumes(params: VolumeParams): Promise<Volume[]> {
    const mockVolumes: Volume[] = [
      {
        id: "ocid1.volume.oc1.phx.aaaaa1",
        displayName: "boot-volume-web-server-01",
        compartmentId: params.compartmentId,
        availabilityDomain: "PHX-AD-1",
        lifecycleState: "AVAILABLE",
        sizeInGBs: 50,
        sizeInMBs: 51200,
        timeCreated: new Date(Date.now() - 86400000 * 7).toISOString(),
        isHydrated: true,
        vpusPerGB: 10,
      },
      {
        id: "ocid1.volume.oc1.phx.aaaaa2",
        displayName: "data-volume-01",
        compartmentId: params.compartmentId,
        availabilityDomain: "PHX-AD-2",
        lifecycleState: "AVAILABLE",
        sizeInGBs: 500,
        sizeInMBs: 512000,
        timeCreated: new Date(Date.now() - 86400000 * 10).toISOString(),
        isHydrated: true,
        vpusPerGB: 20,
        volumeGroupId: "ocid1.volumegroup.oc1.phx.aaaaa1",
      },
      {
        id: "ocid1.volume.oc1.phx.aaaaa3",
        displayName: "backup-volume-01",
        compartmentId: params.compartmentId,
        availabilityDomain: "PHX-AD-1",
        lifecycleState: "AVAILABLE",
        sizeInGBs: 1000,
        sizeInMBs: 1024000,
        timeCreated: new Date(Date.now() - 86400000 * 5).toISOString(),
        isHydrated: true,
        vpusPerGB: 10,
      },
    ];

    // Filter by state if provided
    if (params.state) {
      return mockVolumes.filter((volume) => volume.lifecycleState === params.state);
    }

    // Apply limit if provided
    if (params.limit) {
      return mockVolumes.slice(0, params.limit);
    }

    return mockVolumes;
  }

  /**
   * Get a specific volume
   */
  async getVolume(volumeId: string): Promise<Volume> {
    return {
      id: volumeId,
      displayName: "data-volume-01",
      compartmentId: "ocid1.compartment.oc1..aaaaaaaa1",
      availabilityDomain: "PHX-AD-2",
      lifecycleState: "AVAILABLE",
      sizeInGBs: 500,
      sizeInMBs: 512000,
      timeCreated: new Date(Date.now() - 86400000 * 10).toISOString(),
      isHydrated: true,
      vpusPerGB: 20,
      volumeGroupId: "ocid1.volumegroup.oc1.phx.aaaaa1",
    };
  }

  /**
   * Get Virtual Cloud Networks
   */
  async getVcns(params: VcnParams): Promise<Vcn[]> {
    const mockVcns: Vcn[] = [
      {
        id: "ocid1.vcn.oc1.phx.aaaaa1",
        displayName: "production-vcn",
        compartmentId: params.compartmentId,
        cidrBlock: "10.0.0.0/16",
        cidrBlocks: ["10.0.0.0/16"],
        lifecycleState: "AVAILABLE",
        timeCreated: new Date(Date.now() - 86400000 * 30).toISOString(),
        defaultRouteTableId: "ocid1.routetable.oc1.phx.aaaaa1",
        defaultSecurityListId: "ocid1.securitylist.oc1.phx.aaaaa1",
        defaultDhcpOptionsId: "ocid1.dhcpoptions.oc1.phx.aaaaa1",
        dnsLabel: "prodvcn",
      },
      {
        id: "ocid1.vcn.oc1.phx.aaaaa2",
        displayName: "development-vcn",
        compartmentId: params.compartmentId,
        cidrBlock: "10.1.0.0/16",
        cidrBlocks: ["10.1.0.0/16", "10.2.0.0/16"],
        lifecycleState: "AVAILABLE",
        timeCreated: new Date(Date.now() - 86400000 * 20).toISOString(),
        defaultRouteTableId: "ocid1.routetable.oc1.phx.aaaaa2",
        defaultSecurityListId: "ocid1.securitylist.oc1.phx.aaaaa2",
        defaultDhcpOptionsId: "ocid1.dhcpoptions.oc1.phx.aaaaa2",
        dnsLabel: "devvcn",
      },
    ];

    // Filter by state if provided
    if (params.state) {
      return mockVcns.filter((vcn) => vcn.lifecycleState === params.state);
    }

    // Apply limit if provided
    if (params.limit) {
      return mockVcns.slice(0, params.limit);
    }

    return mockVcns;
  }

  /**
   * Get a specific VCN
   */
  async getVcn(vcnId: string): Promise<Vcn> {
    return {
      id: vcnId,
      displayName: "production-vcn",
      compartmentId: "ocid1.compartment.oc1..aaaaaaaa1",
      cidrBlock: "10.0.0.0/16",
      cidrBlocks: ["10.0.0.0/16"],
      lifecycleState: "AVAILABLE",
      timeCreated: new Date(Date.now() - 86400000 * 30).toISOString(),
      defaultRouteTableId: "ocid1.routetable.oc1.phx.aaaaa1",
      defaultSecurityListId: "ocid1.securitylist.oc1.phx.aaaaa1",
      defaultDhcpOptionsId: "ocid1.dhcpoptions.oc1.phx.aaaaa1",
      dnsLabel: "prodvcn",
    };
  }

  /**
   * Get database systems
   */
  async getDatabaseSystems(params: DatabaseParams): Promise<DatabaseSystem[]> {
    const mockDatabases: DatabaseSystem[] = [
      {
        id: "ocid1.dbsystem.oc1.phx.aaaaa1",
        displayName: "production-db",
        compartmentId: params.compartmentId,
        availabilityDomain: "PHX-AD-1",
        lifecycleState: "AVAILABLE",
        shape: "VM.Standard2.4",
        cpuCoreCount: 4,
        dataStorageSizeInGBs: 256,
        nodeCount: 1,
        databaseEdition: "ENTERPRISE_EDITION",
        timeCreated: new Date(Date.now() - 86400000 * 45).toISOString(),
        hostname: "prod-db-01",
        domain: "example.com",
        version: "19.16.0.0",
        diskRedundancy: "HIGH",
      },
      {
        id: "ocid1.dbsystem.oc1.phx.aaaaa2",
        displayName: "development-db",
        compartmentId: params.compartmentId,
        availabilityDomain: "PHX-AD-2",
        lifecycleState: "AVAILABLE",
        shape: "VM.Standard2.2",
        cpuCoreCount: 2,
        dataStorageSizeInGBs: 128,
        nodeCount: 1,
        databaseEdition: "STANDARD_EDITION",
        timeCreated: new Date(Date.now() - 86400000 * 30).toISOString(),
        hostname: "dev-db-01",
        domain: "dev.example.com",
        version: "19.16.0.0",
        diskRedundancy: "NORMAL",
      },
    ];

    // Filter by state if provided
    if (params.state) {
      return mockDatabases.filter((db) => db.lifecycleState === params.state);
    }

    // Apply limit if provided
    if (params.limit) {
      return mockDatabases.slice(0, params.limit);
    }

    return mockDatabases;
  }

  /**
   * Get a specific database system
   */
  async getDatabaseSystem(dbSystemId: string): Promise<DatabaseSystem> {
    return {
      id: dbSystemId,
      displayName: "production-db",
      compartmentId: "ocid1.compartment.oc1..aaaaaaaa1",
      availabilityDomain: "PHX-AD-1",
      lifecycleState: "AVAILABLE",
      shape: "VM.Standard2.4",
      cpuCoreCount: 4,
      dataStorageSizeInGBs: 256,
      nodeCount: 1,
      databaseEdition: "ENTERPRISE_EDITION",
      timeCreated: new Date(Date.now() - 86400000 * 45).toISOString(),
      hostname: "prod-db-01",
      domain: "example.com",
      version: "19.16.0.0",
      diskRedundancy: "HIGH",
    };
  }

  /**
   * Get metrics data
   */
  async getMetrics(params: MetricParams): Promise<MetricData[]> {
    const now = new Date();
    const datapoints: Array<{ timestamp: Date; value: number }> = [];

    // Generate 12 datapoints (1 hour of data at 5-minute intervals)
    for (let i = 11; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
      const value = Math.random() * 100; // Random value between 0-100
      datapoints.push({ timestamp, value });
    }

    return [
      {
        namespace: params.namespace,
        name: "CpuUtilization",
        compartmentId: params.compartmentId,
        dimensions: {
          resourceId: "ocid1.instance.oc1.phx.aaaaaa1",
          availabilityDomain: "PHX-AD-1",
        },
        metadata: {
          unit: "percent",
          displayName: "CPU Utilization",
        },
        aggregatedDatapoints: datapoints,
      },
      {
        namespace: params.namespace,
        name: "MemoryUtilization",
        compartmentId: params.compartmentId,
        dimensions: {
          resourceId: "ocid1.instance.oc1.phx.aaaaaa1",
          availabilityDomain: "PHX-AD-1",
        },
        metadata: {
          unit: "percent",
          displayName: "Memory Utilization",
        },
        aggregatedDatapoints: datapoints.map((dp) => ({
          timestamp: dp.timestamp,
          value: Math.random() * 80, // Different random values for memory
        })),
      },
    ];
  }

  /**
   * Get health status of the service
   */
  async getHealth(): Promise<{ status: string; region: string }> {
    return {
      status: "ok",
      region: this.credentials.region,
    };
  }
}
