// Types for Oracle Cloud Infrastructure Service
export interface OracleCredentials {
  tenancy: string;
  user: string;
  fingerprint: string;
  privateKey: string;
  region: string;
}

export interface ComputeInstanceParams {
  compartmentId: string;
  availabilityDomain?: string;
  displayName?: string;
  state?: "RUNNING" | "STOPPED" | "TERMINATED" | "PROVISIONING";
  limit?: number;
  page?: string;
}

export interface VolumeParams {
  compartmentId: string;
  availabilityDomain?: string;
  displayName?: string;
  state?: "AVAILABLE" | "PROVISIONING" | "RESTORING" | "TERMINATING" | "TERMINATED";
  limit?: number;
  page?: string;
}

export interface VcnParams {
  compartmentId: string;
  displayName?: string;
  state?: "AVAILABLE" | "PROVISIONING" | "TERMINATING" | "TERMINATED";
  limit?: number;
  page?: string;
}

export interface DatabaseParams {
  compartmentId: string;
  displayName?: string;
  state?: "AVAILABLE" | "PROVISIONING" | "TERMINATING" | "TERMINATED" | "STOPPED";
  limit?: number;
  page?: string;
}

export interface MetricParams {
  compartmentId: string;
  namespace: string;
  query: string;
  startTime?: Date;
  endTime?: Date;
  resolution?: string;
}

export interface ComputeInstance {
  id: string;
  displayName: string;
  compartmentId: string;
  availabilityDomain: string;
  lifecycleState: string;
  shape: string;
  imageId: string;
  timeCreated: string;
  region: string;
  faultDomain?: string;
  metadata: Record<string, any>;
  publicIp?: string;
  privateIp?: string;
}

export interface Volume {
  id: string;
  displayName: string;
  compartmentId: string;
  availabilityDomain: string;
  lifecycleState: string;
  sizeInGBs: number;
  sizeInMBs: number;
  volumeGroupId?: string;
  timeCreated: string;
  isHydrated: boolean;
  vpusPerGB: number;
}

export interface Vcn {
  id: string;
  displayName: string;
  compartmentId: string;
  cidrBlock: string;
  cidrBlocks: string[];
  lifecycleState: string;
  timeCreated: string;
  defaultRouteTableId: string;
  defaultSecurityListId: string;
  defaultDhcpOptionsId: string;
  dnsLabel?: string;
}

export interface DatabaseSystem {
  id: string;
  displayName: string;
  compartmentId: string;
  availabilityDomain: string;
  lifecycleState: string;
  shape: string;
  cpuCoreCount: number;
  dataStorageSizeInGBs: number;
  nodeCount: number;
  databaseEdition: string;
  timeCreated: string;
  hostname: string;
  domain: string;
  version: string;
  diskRedundancy?: string;
}

export interface MetricData {
  namespace: string;
  name: string;
  compartmentId: string;
  dimensions: Record<string, string>;
  metadata: Record<string, any>;
  aggregatedDatapoints: Array<{
    timestamp: Date;
    value: number;
  }>;
}

export interface Compartment {
  id: string;
  name: string;
  description: string;
  lifecycleState: string;
  timeCreated: string;
}

/**
 * Oracle Cloud Infrastructure Service
 * Provides access to OCI resources including compute, storage, networking, and databases
 */
export class OracleService {
  private credentials: OracleCredentials;

  constructor(credentials: OracleCredentials) {
    this.credentials = credentials;
  }

  /**
   * Static factory method to create service from credentials
   */
  static fromCredentials(credentials: OracleCredentials): OracleService {
    return new OracleService(credentials);
  }

  /**
   * Get compartments list
   */
  async getCompartments(tenancyId: string): Promise<Compartment[]> {
    // In a real implementation, this would use the OCI SDK
    throw new Error("Not implemented - use OCI SDK to list compartments");
  }

  /**
   * Get compute instances
   */
  async getComputeInstances(params: ComputeInstanceParams): Promise<ComputeInstance[]> {
    // In a real implementation, this would use the OCI SDK
    throw new Error("Not implemented - use OCI SDK to list compute instances");
  }

  /**
   * Get a specific compute instance
   */
  async getComputeInstance(instanceId: string): Promise<ComputeInstance> {
    // In a real implementation, this would use the OCI SDK
    throw new Error("Not implemented - use OCI SDK to get compute instance");
  }

  /**
   * Get block volumes
   */
  async getVolumes(params: VolumeParams): Promise<Volume[]> {
    // In a real implementation, this would use the OCI SDK
    throw new Error("Not implemented - use OCI SDK to list volumes");
  }

  /**
   * Get a specific volume
   */
  async getVolume(volumeId: string): Promise<Volume> {
    // In a real implementation, this would use the OCI SDK
    throw new Error("Not implemented - use OCI SDK to get volume");
  }

  /**
   * Get Virtual Cloud Networks
   */
  async getVcns(params: VcnParams): Promise<Vcn[]> {
    // In a real implementation, this would use the OCI SDK
    throw new Error("Not implemented - use OCI SDK to list VCNs");
  }

  /**
   * Get a specific VCN
   */
  async getVcn(vcnId: string): Promise<Vcn> {
    // In a real implementation, this would use the OCI SDK
    throw new Error("Not implemented - use OCI SDK to get VCN");
  }

  /**
   * Get database systems
   */
  async getDatabaseSystems(params: DatabaseParams): Promise<DatabaseSystem[]> {
    // In a real implementation, this would use the OCI SDK
    throw new Error("Not implemented - use OCI SDK to list database systems");
  }

  /**
   * Get a specific database system
   */
  async getDatabaseSystem(dbSystemId: string): Promise<DatabaseSystem> {
    // In a real implementation, this would use the OCI SDK
    throw new Error("Not implemented - use OCI SDK to get database system");
  }

  /**
   * Get metrics data
   */
  async getMetrics(params: MetricParams): Promise<MetricData[]> {
    // In a real implementation, this would use the OCI SDK
    throw new Error("Not implemented - use OCI SDK to query metrics");
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
