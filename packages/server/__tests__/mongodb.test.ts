import { MongoDBService, MongoDBCredentials } from '../services/mongodb';
import { MongoClient, ObjectId } from 'mongodb';

// Mock the MongoDB client
jest.mock('mongodb', () => {
  const mockCollection = {
    find: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
        { _id: '1', name: 'Test Document 1', value: 100 },
        { _id: '2', name: 'Test Document 2', value: 200 },
      ]),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    }),
    findOne: jest.fn().mockResolvedValue({
      _id: '1',
      name: 'Test Document 1',
      value: 100,
    }),
    insertOne: jest.fn().mockResolvedValue({
      acknowledged: true,
      insertedId: 'mock-id-123',
    }),
    insertMany: jest.fn().mockResolvedValue({
      acknowledged: true,
      insertedCount: 2,
      insertedIds: { 0: 'mock-id-1', 1: 'mock-id-2' },
    }),
    updateOne: jest.fn().mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
    }),
    updateMany: jest.fn().mockResolvedValue({
      acknowledged: true,
      matchedCount: 2,
      modifiedCount: 2,
      upsertedCount: 0,
    }),
    deleteOne: jest.fn().mockResolvedValue({
      acknowledged: true,
      deletedCount: 1,
    }),
    deleteMany: jest.fn().mockResolvedValue({
      acknowledged: true,
      deletedCount: 2,
    }),
    countDocuments: jest.fn().mockResolvedValue(5),
    aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
        { _id: 'Electronics', total: 1029.98 },
      ]),
    }),
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
    admin: jest.fn().mockReturnValue({
      listDatabases: jest.fn().mockResolvedValue({
        databases: [
          { name: 'test-db', sizeOnDisk: 1024000, empty: false },
          { name: 'admin', sizeOnDisk: 32768, empty: false },
        ],
      }),
      ping: jest.fn().mockResolvedValue({}),
    }),
    command: jest.fn().mockReturnValue({ ns: 'test-db.users', count: 10, size: 1024 }),
    listCollections: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
        { name: 'users', type: 'collection', options: {}, info: { readOnly: false } },
        { name: 'products', type: 'collection', options: {}, info: { readOnly: false } },
        { name: 'system.profile', type: 'collection', options: {}, info: { readOnly: true } },
      ]),
    }),
    createCollection: jest.fn().mockResolvedValue({}),
    dropCollection: jest.fn().mockResolvedValue(true),
  };

  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    db: jest.fn().mockReturnValue(mockDb),
  };

  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
  };
});

describe('MongoDBService', () => {
  let service: MongoDBService;
  const credentials: MongoDBCredentials = {
    connectionString: 'mongodb://localhost:27017',
    databaseName: 'test-db',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MongoDBService(credentials);
  });

  describe('Connection Management', () => {
    it('should create a service instance from credentials', () => {
      const newService = MongoDBService.fromCredentials(credentials);
      expect(newService).toBeInstanceOf(MongoDBService);
    });

    it('should create a service instance from connection string', () => {
      const newService = MongoDBService.fromConnectionString(
        'mongodb://localhost:27017',
        'test-db'
      );
      expect(newService).toBeInstanceOf(MongoDBService);
    });

    it('should connect to MongoDB', async () => {
      await service.connect();
      expect(service.isConnected()).toBe(true);
    });

    it('should disconnect from MongoDB', async () => {
      await service.connect();
      await service.disconnect();
      expect(service.isConnected()).toBe(false);
    });

    it('should not connect if already connected', async () => {
      await service.connect();
      await service.connect(); // Second call should be no-op
      expect(service.isConnected()).toBe(true);
    });
  });

  describe('Database Operations', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('should list all databases', async () => {
      const databases = await service.listDatabases();

      expect(databases).toHaveLength(2);
      expect(databases[0]).toHaveProperty('name', 'test-db');
      expect(databases[0]).toHaveProperty('sizeOnDisk');
      expect(databases[0]).toHaveProperty('empty');
    });

    it('should list all collections', async () => {
      const collections = await service.listCollections();

      expect(collections).toHaveLength(3);
      expect(collections[0]).toHaveProperty('name', 'users');
      expect(collections[1]).toHaveProperty('name', 'products');
    });

    it('should create a collection', async () => {
      await service.createCollection('new-collection');
      // Verify the method was called without errors
    });

    it('should drop a collection', async () => {
      const result = await service.dropCollection('users');
      expect(result).toBe(true);
    });

    it('should check if a collection exists', async () => {
      const exists = await service.collectionExists('users');
      expect(exists).toBe(true);
    });

    it('should get collection stats', async () => {
      const stats = await service.getCollectionStats('users');
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('ns', 'test-db.users');
      expect(stats).toHaveProperty('count', 10);
    });
  });

  describe('Find Operations', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('should find documents with filter', async () => {
      const documents = await service.find('users', {
        filter: { value: { $gt: 50 } },
        limit: 10,
      });

      expect(documents).toHaveLength(2);
      expect(documents[0]).toHaveProperty('_id', '1');
      expect(documents[0]).toHaveProperty('name', 'Test Document 1');
    });

    it('should find one document', async () => {
      const document = await service.findOne('users', { name: 'Test Document 1' });

      expect(document).toBeDefined();
      expect(document).toHaveProperty('_id', '1');
      expect(document).toHaveProperty('name', 'Test Document 1');
    });

    it('should count documents', async () => {
      const count = await service.countDocuments('users', { value: { $gt: 50 } });
      expect(count).toBe(5);
    });

    it('should get slow query logs', async () => {
      const logs = await service.getSlowQueryLogs(10);
      expect(logs).toBeDefined();
      expect(Array.isArray(logs)).toBe(true);
      // Since our mock returns existing docs
      expect(logs).toHaveLength(2);
    });
  });

  describe('Insert Operations', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('should insert one document', async () => {
      const result = await service.insertOne('users', {
        name: 'New User',
        email: 'newuser@example.com',
      });

      expect(result.acknowledged).toBe(true);
      expect(result.insertedId).toBe('mock-id-123');
    });

    it('should insert many documents', async () => {
      const result = await service.insertMany('users', [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' },
      ]);

      expect(result.acknowledged).toBe(true);
      expect(result.insertedCount).toBe(2);
      expect(result.insertedIds).toHaveLength(2);
    });
  });

  describe('Update Operations', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('should update one document', async () => {
      const result = await service.updateOne(
        'users',
        { name: 'Test Document 1' },
        { $set: { name: 'Updated Name' } }
      );

      expect(result.acknowledged).toBe(true);
      expect(result.matchedCount).toBe(1);
      expect(result.modifiedCount).toBe(1);
    });

    it('should update many documents', async () => {
      const result = await service.updateMany(
        'users',
        { value: { $lt: 100 } },
        { $inc: { value: 10 } }
      );

      expect(result.acknowledged).toBe(true);
      expect(result.matchedCount).toBe(2);
      expect(result.modifiedCount).toBe(2);
    });
  });

  describe('Delete Operations', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('should delete one document', async () => {
      const result = await service.deleteOne('users', { name: 'Test Document 1' });

      expect(result.acknowledged).toBe(true);
      expect(result.deletedCount).toBe(1);
    });

    it('should delete many documents', async () => {
      const result = await service.deleteMany('users', { value: { $lt: 100 } });

      expect(result.acknowledged).toBe(true);
      expect(result.deletedCount).toBe(2);
    });
  });

  describe('Aggregation Operations', () => {
    beforeEach(async () => {
      await service.connect();
    });

    it('should aggregate documents', async () => {
      const pipeline = [
        { $match: { category: 'Electronics' } },
        { $group: { _id: '$category', total: { $sum: '$price' } } },
      ];

      const result = await service.aggregate('products', pipeline);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('_id', 'Electronics');
      expect(result[0]).toHaveProperty('total', 1029.98);
    });
  });

  describe('Health Check', () => {
    it('should perform health check when connected', async () => {
      await service.connect();
      const health = await service.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.connected).toBe(true);
      expect(health.database).toBe('test-db');
    });

    it('should return unhealthy status on error', async () => {
      // Create a new service to get a fresh mock client
      const newService = MongoDBService.fromCredentials(credentials);

      // Access the private client directly
      const client = (newService as any).client;

      (client.db as jest.Mock)
        .mockReturnValueOnce({
          admin: jest.fn().mockReturnValue({
            ping: jest.fn().mockRejectedValue(new Error('Connection failed')),
          }),
        })
        .mockReturnValueOnce({
          admin: jest.fn().mockReturnValue({
            ping: jest.fn().mockRejectedValue(new Error('Connection failed')),
          }),
        });

      const health = await newService.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.connected).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when performing operations without connection', async () => {
      const newService = MongoDBService.fromCredentials(credentials);

      // Access the private client directly
      const client = (newService as any).client;
      (client.connect as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));

      await expect(newService.connect()).rejects.toThrow('MongoDB connection failed');
    });
  });
});
