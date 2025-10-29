import {
  MongoDBCredentials,
  QueryParams,
  InsertResult,
  UpdateResult,
  DeleteResult,
  DatabaseInfo,
  CollectionInfo,
} from './mongodb';
import { Document, Filter, OptionalId, UpdateFilter } from 'mongodb';

/**
 * Mock MongoDB Service for testing and development
 * Simulates MongoDB operations without requiring a real database connection
 */
export class MockMongoDBService {
  private credentials: MongoDBCredentials;
  private connected: boolean = false;
  private mockData: Map<string, Map<string, Document>> = new Map();
  private idCounter: number = 1000;

  constructor(credentials: MongoDBCredentials) {
    this.credentials = credentials;
    this.initializeMockData();
  }

  /**
   * Initialize mock data with sample collections
   */
  private initializeMockData() {
    // Create a sample users collection
    const usersCollection = new Map<string, Document>();
    usersCollection.set('user1', {
      _id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      role: 'admin',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z'),
    });
    usersCollection.set('user2', {
      _id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 28,
      role: 'user',
      createdAt: new Date('2024-01-05T00:00:00Z'),
      updatedAt: new Date('2024-01-10T14:20:00Z'),
    });
    usersCollection.set('user3', {
      _id: 'user3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      age: 35,
      role: 'user',
      createdAt: new Date('2024-01-10T00:00:00Z'),
      updatedAt: new Date('2024-01-20T08:45:00Z'),
    });
    this.mockData.set('users', usersCollection);

    // Create a sample products collection
    const productsCollection = new Map<string, Document>();
    productsCollection.set('prod1', {
      _id: 'prod1',
      name: 'Laptop',
      category: 'Electronics',
      price: 999.99,
      stock: 50,
      tags: ['electronics', 'computers', 'portable'],
      createdAt: new Date('2024-01-01T00:00:00Z'),
    });
    productsCollection.set('prod2', {
      _id: 'prod2',
      name: 'Wireless Mouse',
      category: 'Electronics',
      price: 29.99,
      stock: 200,
      tags: ['electronics', 'accessories', 'wireless'],
      createdAt: new Date('2024-01-02T00:00:00Z'),
    });
    productsCollection.set('prod3', {
      _id: 'prod3',
      name: 'Office Chair',
      category: 'Furniture',
      price: 199.99,
      stock: 30,
      tags: ['furniture', 'office', 'ergonomic'],
      createdAt: new Date('2024-01-03T00:00:00Z'),
    });
    this.mockData.set('products', productsCollection);

    // Create a sample orders collection
    const ordersCollection = new Map<string, Document>();
    ordersCollection.set('order1', {
      _id: 'order1',
      userId: 'user1',
      items: [
        { productId: 'prod1', quantity: 1, price: 999.99 },
        { productId: 'prod2', quantity: 2, price: 29.99 },
      ],
      total: 1059.97,
      status: 'completed',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    });
    ordersCollection.set('order2', {
      _id: 'order2',
      userId: 'user2',
      items: [
        { productId: 'prod3', quantity: 1, price: 199.99 },
      ],
      total: 199.99,
      status: 'pending',
      createdAt: new Date('2024-01-20T14:30:00Z'),
    });
    this.mockData.set('orders', ordersCollection);
  }

  /**
   * Create MongoDB service instance from credentials
   */
  static fromCredentials(credentials: MongoDBCredentials): MockMongoDBService {
    return new MockMongoDBService(credentials);
  }

  /**
   * Create MongoDB service instance from connection string and database name
   */
  static fromConnectionString(connectionString: string, databaseName: string): MockMongoDBService {
    return new MockMongoDBService({ connectionString, databaseName });
  }

  /**
   * Simulate connection delay
   */
  private async simulateDelay(ms: number = 50): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if a document matches a filter
   */
  private matchesFilter(doc: Document, filter: Filter<Document>): boolean {
    if (!filter || Object.keys(filter).length === 0) {
      return true;
    }

    for (const [key, value] of Object.entries(filter)) {
      if (key === '$or') {
        // Handle $or operator
        const conditions = value as Filter<Document>[];
        const matches = conditions.some(condition => this.matchesFilter(doc, condition));
        if (!matches) return false;
      } else if (key === '$and') {
        // Handle $and operator
        const conditions = value as Filter<Document>[];
        const matches = conditions.every(condition => this.matchesFilter(doc, condition));
        if (!matches) return false;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
        // Handle operators like $gt, $lt, $gte, $lte, $ne, $in, $nin
        const operators = value as Record<string, any>;
        for (const [op, opValue] of Object.entries(operators)) {
          const docValue = doc[key];
          switch (op) {
            case '$gt':
              if (!(docValue > opValue)) return false;
              break;
            case '$gte':
              if (!(docValue >= opValue)) return false;
              break;
            case '$lt':
              if (!(docValue < opValue)) return false;
              break;
            case '$lte':
              if (!(docValue <= opValue)) return false;
              break;
            case '$ne':
              if (docValue === opValue) return false;
              break;
            case '$in':
              if (!Array.isArray(opValue) || !opValue.includes(docValue)) return false;
              break;
            case '$nin':
              if (!Array.isArray(opValue) || opValue.includes(docValue)) return false;
              break;
            case '$regex':
              if (typeof docValue !== 'string') return false;
              const regex = new RegExp(opValue);
              if (!regex.test(docValue)) return false;
              break;
            default:
              // Unknown operator, skip
              break;
          }
        }
      } else {
        // Simple equality check
        if (doc[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Apply sort to documents
   */
  private applySort(docs: Document[], sort?: Record<string, 1 | -1>): Document[] {
    if (!sort || Object.keys(sort).length === 0) {
      return docs;
    }

    return [...docs].sort((a, b) => {
      for (const [key, direction] of Object.entries(sort)) {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal === bVal) continue;
        
        if (aVal === undefined) return direction === 1 ? 1 : -1;
        if (bVal === undefined) return direction === 1 ? -1 : 1;
        
        if (aVal < bVal) return direction === 1 ? -1 : 1;
        if (aVal > bVal) return direction === 1 ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Apply update to a document
   */
  private applyUpdate(doc: Document, update: UpdateFilter<Document>): Document {
    const updated = { ...doc };

    for (const [operator, fields] of Object.entries(update)) {
      if (operator === '$set') {
        Object.assign(updated, fields);
      } else if (operator === '$unset') {
        for (const key of Object.keys(fields as object)) {
          delete updated[key];
        }
      } else if (operator === '$inc') {
        for (const [key, value] of Object.entries(fields as object)) {
          updated[key] = (updated[key] || 0) + (value as number);
        }
      } else if (operator === '$push') {
        for (const [key, value] of Object.entries(fields as object)) {
          if (!Array.isArray(updated[key])) {
            updated[key] = [];
          }
          updated[key].push(value);
        }
      } else if (operator === '$pull') {
        for (const [key, value] of Object.entries(fields as object)) {
          if (Array.isArray(updated[key])) {
            updated[key] = updated[key].filter((item: any) => item !== value);
          }
        }
      }
    }

    return updated;
  }

  /**
   * Connect to MongoDB (mock)
   */
  async connect(): Promise<void> {
    await this.simulateDelay(100);
    this.connected = true;
    console.log(`[MOCK] Connected to MongoDB database: ${this.credentials.databaseName}`);
  }

  /**
   * Disconnect from MongoDB (mock)
   */
  async disconnect(): Promise<void> {
    await this.simulateDelay(50);
    this.connected = false;
    console.log('[MOCK] Disconnected from MongoDB');
  }

  /**
   * Check if connected to MongoDB
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * List all databases (mock)
   */
  async listDatabases(): Promise<DatabaseInfo[]> {
    await this.simulateDelay();
    
    return [
      { name: this.credentials.databaseName, sizeOnDisk: 1024000, empty: false },
      { name: 'admin', sizeOnDisk: 32768, empty: false },
      { name: 'config', sizeOnDisk: 65536, empty: false },
      { name: 'test', sizeOnDisk: 0, empty: true },
    ];
  }

  /**
   * List all collections (mock)
   */
  async listCollections(): Promise<CollectionInfo[]> {
    await this.simulateDelay();
    
    const collections: CollectionInfo[] = [];
    for (const [name] of this.mockData) {
      collections.push({
        name,
        type: 'collection',
        options: {},
        info: { readOnly: false },
      });
    }
    
    return collections;
  }

  /**
   * Find documents in a collection (mock)
   */
  async find(collectionName: string, params: QueryParams = {}): Promise<Document[]> {
    await this.simulateDelay();
    
    const collection = this.mockData.get(collectionName);
    if (!collection) {
      return [];
    }

    const { filter = {}, limit = 100, skip = 0, sort } = params;
    
    let documents = Array.from(collection.values()).filter(doc => 
      this.matchesFilter(doc, filter)
    );

    if (sort) {
      documents = this.applySort(documents, sort);
    }

    if (skip > 0) {
      documents = documents.slice(skip);
    }

    if (limit > 0) {
      documents = documents.slice(0, limit);
    }

    return documents;
  }

  /**
   * Find a single document (mock)
   */
  async findOne(collectionName: string, filter: Filter<Document>): Promise<Document | null> {
    await this.simulateDelay();
    
    const collection = this.mockData.get(collectionName);
    if (!collection) {
      return null;
    }

    for (const doc of collection.values()) {
      if (this.matchesFilter(doc, filter)) {
        return doc;
      }
    }

    return null;
  }

  /**
   * Insert a document (mock)
   */
  async insertOne(collectionName: string, document: OptionalId<Document>): Promise<InsertResult> {
    await this.simulateDelay();
    
    let collection = this.mockData.get(collectionName);
    if (!collection) {
      collection = new Map();
      this.mockData.set(collectionName, collection);
    }

    const id = document._id || `mock_${this.idCounter++}`;
    const newDoc = { ...document, _id: id };
    collection.set(id.toString(), newDoc);

    return {
      acknowledged: true,
      insertedId: id.toString(),
    };
  }

  /**
   * Insert multiple documents (mock)
   */
  async insertMany(collectionName: string, documents: OptionalId<Document>[]): Promise<{ acknowledged: boolean; insertedCount: number; insertedIds: string[] }> {
    await this.simulateDelay();
    
    let collection = this.mockData.get(collectionName);
    if (!collection) {
      collection = new Map();
      this.mockData.set(collectionName, collection);
    }

    const insertedIds: string[] = [];
    for (const document of documents) {
      const id = document._id || `mock_${this.idCounter++}`;
      const newDoc = { ...document, _id: id };
      collection.set(id.toString(), newDoc);
      insertedIds.push(id.toString());
    }

    return {
      acknowledged: true,
      insertedCount: documents.length,
      insertedIds,
    };
  }

  /**
   * Update a document (mock)
   */
  async updateOne(collectionName: string, filter: Filter<Document>, update: UpdateFilter<Document>): Promise<UpdateResult> {
    await this.simulateDelay();
    
    const collection = this.mockData.get(collectionName);
    if (!collection) {
      return {
        acknowledged: true,
        matchedCount: 0,
        modifiedCount: 0,
        upsertedCount: 0,
      };
    }

    for (const [id, doc] of collection.entries()) {
      if (this.matchesFilter(doc, filter)) {
        const updated = this.applyUpdate(doc, update);
        collection.set(id, updated);
        return {
          acknowledged: true,
          matchedCount: 1,
          modifiedCount: 1,
          upsertedCount: 0,
        };
      }
    }

    return {
      acknowledged: true,
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
    };
  }

  /**
   * Update multiple documents (mock)
   */
  async updateMany(collectionName: string, filter: Filter<Document>, update: UpdateFilter<Document>): Promise<UpdateResult> {
    await this.simulateDelay();
    
    const collection = this.mockData.get(collectionName);
    if (!collection) {
      return {
        acknowledged: true,
        matchedCount: 0,
        modifiedCount: 0,
        upsertedCount: 0,
      };
    }

    let matchedCount = 0;
    let modifiedCount = 0;

    for (const [id, doc] of collection.entries()) {
      if (this.matchesFilter(doc, filter)) {
        matchedCount++;
        const updated = this.applyUpdate(doc, update);
        collection.set(id, updated);
        modifiedCount++;
      }
    }

    return {
      acknowledged: true,
      matchedCount,
      modifiedCount,
      upsertedCount: 0,
    };
  }

  /**
   * Delete a document (mock)
   */
  async deleteOne(collectionName: string, filter: Filter<Document>): Promise<DeleteResult> {
    await this.simulateDelay();
    
    const collection = this.mockData.get(collectionName);
    if (!collection) {
      return {
        acknowledged: true,
        deletedCount: 0,
      };
    }

    for (const [id, doc] of collection.entries()) {
      if (this.matchesFilter(doc, filter)) {
        collection.delete(id);
        return {
          acknowledged: true,
          deletedCount: 1,
        };
      }
    }

    return {
      acknowledged: true,
      deletedCount: 0,
    };
  }

  /**
   * Delete multiple documents (mock)
   */
  async deleteMany(collectionName: string, filter: Filter<Document>): Promise<DeleteResult> {
    await this.simulateDelay();
    
    const collection = this.mockData.get(collectionName);
    if (!collection) {
      return {
        acknowledged: true,
        deletedCount: 0,
      };
    }

    let deletedCount = 0;
    const idsToDelete: string[] = [];

    for (const [id, doc] of collection.entries()) {
      if (this.matchesFilter(doc, filter)) {
        idsToDelete.push(id);
      }
    }

    for (const id of idsToDelete) {
      collection.delete(id);
      deletedCount++;
    }

    return {
      acknowledged: true,
      deletedCount,
    };
  }

  /**
   * Count documents (mock)
   */
  async countDocuments(collectionName: string, filter: Filter<Document> = {}): Promise<number> {
    await this.simulateDelay();
    
    const collection = this.mockData.get(collectionName);
    if (!collection) {
      return 0;
    }

    let count = 0;
    for (const doc of collection.values()) {
      if (this.matchesFilter(doc, filter)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Create a collection (mock)
   */
  async createCollection(collectionName: string): Promise<void> {
    await this.simulateDelay();
    
    if (!this.mockData.has(collectionName)) {
      this.mockData.set(collectionName, new Map());
    }
  }

  /**
   * Drop a collection (mock)
   */
  async dropCollection(collectionName: string): Promise<boolean> {
    await this.simulateDelay();
    
    return this.mockData.delete(collectionName);
  }

  /**
   * Check if a collection exists (mock)
   */
  async collectionExists(collectionName: string): Promise<boolean> {
    await this.simulateDelay();
    
    return this.mockData.has(collectionName);
  }

  /**
   * Aggregate documents (mock - simplified)
   */
  async aggregate(collectionName: string, pipeline: Document[]): Promise<Document[]> {
    await this.simulateDelay();
    
    const collection = this.mockData.get(collectionName);
    if (!collection) {
      return [];
    }

    let documents = Array.from(collection.values());

    // Simple implementation of common pipeline stages
    for (const stage of pipeline) {
      if (stage.$match) {
        documents = documents.filter(doc => this.matchesFilter(doc, stage.$match));
      } else if (stage.$limit) {
        documents = documents.slice(0, stage.$limit);
      } else if (stage.$skip) {
        documents = documents.slice(stage.$skip);
      } else if (stage.$sort) {
        documents = this.applySort(documents, stage.$sort);
      }
      // Note: $group, $project, etc. would need more complex implementation
    }

    return documents;
  }

  /**
   * Health check (mock)
   */
  async healthCheck(): Promise<{ status: string; connected: boolean; database: string }> {
    await this.simulateDelay();
    
    return {
      status: 'healthy',
      connected: this.connected,
      database: this.credentials.databaseName,
    };
  }
}
