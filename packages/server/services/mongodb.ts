import { MongoClient, Db, Collection, Document, Filter, OptionalId, UpdateFilter, FindOptions } from 'mongodb';

// Types for the service
export interface MongoDBCredentials {
  connectionString: string;
  databaseName: string;
}

export interface MongoDBConfig {
  credentials?: MongoDBCredentials;
  connectionString?: string;
  databaseName?: string;
}

export interface QueryParams {
  filter?: Filter<Document>;
  options?: FindOptions;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

export interface InsertResult {
  acknowledged: boolean;
  insertedId: string;
}

export interface UpdateResult {
  acknowledged: boolean;
  matchedCount: number;
  modifiedCount: number;
  upsertedCount: number;
  upsertedId?: string;
}

export interface DeleteResult {
  acknowledged: boolean;
  deletedCount: number;
}

export interface DatabaseInfo {
  name: string;
  sizeOnDisk: number;
  empty: boolean;
}

export interface CollectionInfo {
  name: string;
  type: string;
  options: Record<string, any>;
  info: {
    readOnly: boolean;
  };
}

/**
 * MongoDB Service for interacting with MongoDB databases
 * Provides a comprehensive API for CRUD operations and database management
 */
export class MongoDBService {
  private client: MongoClient;
  private db: Db | null = null;
  private credentials: MongoDBCredentials;
  private connected: boolean = false;

  constructor(credentials: MongoDBCredentials) {
    this.credentials = credentials;
    this.client = new MongoClient(credentials.connectionString);
  }

  /**
   * Create MongoDB service instance from credentials
   */
  static fromCredentials(credentials: MongoDBCredentials): MongoDBService {
    return new MongoDBService(credentials);
  }

  /**
   * Create MongoDB service instance from connection string and database name
   */
  static fromConnectionString(connectionString: string, databaseName: string): MongoDBService {
    return new MongoDBService({ connectionString, databaseName });
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      await this.client.connect();
      this.db = this.client.db(this.credentials.databaseName);
      this.connected = true;
      console.log(`Connected to MongoDB database: ${this.credentials.databaseName}`);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.client.close();
      this.connected = false;
      this.db = null;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Failed to disconnect from MongoDB:', error);
      throw new Error(`MongoDB disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if connected to MongoDB
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get database instance
   */
  private getDatabase(): Db {
    if (!this.db) {
      throw new Error('Not connected to MongoDB. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Get collection
   */
  private getCollection(collectionName: string): Collection<Document> {
    const db = this.getDatabase();
    return db.collection(collectionName);
  }

  /**
   * List all databases
   */
  async listDatabases(): Promise<DatabaseInfo[]> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const result = await this.client.db().admin().listDatabases();
      return result.databases.map((db: any) => ({
        name: db.name,
        sizeOnDisk: db.sizeOnDisk || 0,
        empty: db.empty || false,
      }));
    } catch (error) {
      throw new Error(`Failed to list databases: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all collections in the current database
   */
  async listCollections(): Promise<CollectionInfo[]> {
    if (!this.connected) {
      await this.connect();
    }

    const db = this.getDatabase();

    try {
      const collections = await db.listCollections().toArray();
      return collections.map((col: any) => ({
        name: col.name,
        type: col.type || 'collection',
        options: col.options || {},
        info: {
          readOnly: col.info?.readOnly || false,
        },
      }));
    } catch (error) {
      throw new Error(`Failed to list collections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find documents in a collection
   */
  async find(collectionName: string, params: QueryParams = {}): Promise<Document[]> {
    if (!this.connected) {
      await this.connect();
    }

    const collection = this.getCollection(collectionName);
    const { filter = {}, limit = 100, skip = 0, sort, options = {} } = params;

    try {
      let cursor = collection.find(filter, options);

      if (sort) {
        cursor = cursor.sort(sort);
      }

      if (skip > 0) {
        cursor = cursor.skip(skip);
      }

      if (limit > 0) {
        cursor = cursor.limit(limit);
      }

      return await cursor.toArray();
    } catch (error) {
      throw new Error(`Failed to find documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a single document in a collection
   */
  async findOne(collectionName: string, filter: Filter<Document>): Promise<Document | null> {
    if (!this.connected) {
      await this.connect();
    }

    const collection = this.getCollection(collectionName);

    try {
      return await collection.findOne(filter);
    } catch (error) {
      throw new Error(`Failed to find document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Insert a document into a collection
   */
  async insertOne(collectionName: string, document: OptionalId<Document>): Promise<InsertResult> {
    if (!this.connected) {
      await this.connect();
    }

    const collection = this.getCollection(collectionName);

    try {
      const result = await collection.insertOne(document);
      return {
        acknowledged: result.acknowledged,
        insertedId: result.insertedId.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to insert document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Insert multiple documents into a collection
   */
  async insertMany(collectionName: string, documents: OptionalId<Document>[]): Promise<{ acknowledged: boolean; insertedCount: number; insertedIds: string[] }> {
    if (!this.connected) {
      await this.connect();
    }

    const collection = this.getCollection(collectionName);

    try {
      const result = await collection.insertMany(documents);
      return {
        acknowledged: result.acknowledged,
        insertedCount: result.insertedCount,
        insertedIds: Object.values(result.insertedIds).map(id => id.toString()),
      };
    } catch (error) {
      throw new Error(`Failed to insert documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a document in a collection
   */
  async updateOne(collectionName: string, filter: Filter<Document>, update: UpdateFilter<Document>): Promise<UpdateResult> {
    if (!this.connected) {
      await this.connect();
    }

    const collection = this.getCollection(collectionName);

    try {
      const result = await collection.updateOne(filter, update);
      return {
        acknowledged: result.acknowledged,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount || 0,
        upsertedId: result.upsertedId?.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update multiple documents in a collection
   */
  async updateMany(collectionName: string, filter: Filter<Document>, update: UpdateFilter<Document>): Promise<UpdateResult> {
    if (!this.connected) {
      await this.connect();
    }

    const collection = this.getCollection(collectionName);

    try {
      const result = await collection.updateMany(filter, update);
      return {
        acknowledged: result.acknowledged,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount || 0,
        upsertedId: result.upsertedId?.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to update documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a document from a collection
   */
  async deleteOne(collectionName: string, filter: Filter<Document>): Promise<DeleteResult> {
    if (!this.connected) {
      await this.connect();
    }

    const collection = this.getCollection(collectionName);

    try {
      const result = await collection.deleteOne(filter);
      return {
        acknowledged: result.acknowledged,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete multiple documents from a collection
   */
  async deleteMany(collectionName: string, filter: Filter<Document>): Promise<DeleteResult> {
    if (!this.connected) {
      await this.connect();
    }

    const collection = this.getCollection(collectionName);

    try {
      const result = await collection.deleteMany(filter);
      return {
        acknowledged: result.acknowledged,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      throw new Error(`Failed to delete documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Count documents in a collection
   */
  async countDocuments(collectionName: string, filter: Filter<Document> = {}): Promise<number> {
    if (!this.connected) {
      await this.connect();
    }

    const collection = this.getCollection(collectionName);

    try {
      return await collection.countDocuments(filter);
    } catch (error) {
      throw new Error(`Failed to count documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a collection
   */
  async createCollection(collectionName: string): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    const db = this.getDatabase();

    try {
      await db.createCollection(collectionName);
    } catch (error) {
      throw new Error(`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Drop a collection
   */
  async dropCollection(collectionName: string): Promise<boolean> {
    if (!this.connected) {
      await this.connect();
    }

    const db = this.getDatabase();

    try {
      return await db.dropCollection(collectionName);
    } catch (error) {
      throw new Error(`Failed to drop collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a collection exists
   */
  async collectionExists(collectionName: string): Promise<boolean> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      const collections = await this.listCollections();
      return collections.some(col => col.name === collectionName);
    } catch (error) {
      throw new Error(`Failed to check collection existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Aggregate documents in a collection
   */
  async aggregate(collectionName: string, pipeline: Document[]): Promise<Document[]> {
    if (!this.connected) {
      await this.connect();
    }

    const collection = this.getCollection(collectionName);

    try {
      return await collection.aggregate(pipeline).toArray();
    } catch (error) {
      throw new Error(`Failed to aggregate documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; connected: boolean; database: string }> {
    try {
      if (!this.connected) {
        await this.connect();
      }

      // Ping the database to verify connectivity
      await this.client.db().admin().ping();

      return {
        status: 'healthy',
        connected: true,
        database: this.credentials.databaseName,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        database: this.credentials.databaseName,
      };
    }
  }
}
