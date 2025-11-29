import request from 'supertest';
import express, { type Express } from 'express';
import mongodbRoutes from '../routes/mongodb';

// Mock the service factory at the module level
const mockMongoDBService = {
  healthCheck: jest.fn(),
  listDatabases: jest.fn(),
  listCollections: jest.fn(),
  createCollection: jest.fn(),
  dropCollection: jest.fn(),
  collectionExists: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  insertOne: jest.fn(),
  insertMany: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
};

jest.mock('../services/service-factory', () => ({
  serviceFactory: {
    createMongoDBService: jest.fn(() => mockMongoDBService),
    isUsingMocks: jest.fn().mockReturnValue(true),
  },
}));

describe('MongoDB Routes', () => {
  let app: Express;

  beforeAll(() => {
    // Create Express app once
    app = express();
    app.use(express.json());
    app.use('/api/mongodb', mongodbRoutes);
  });

  beforeEach(() => {
    // Reset all mock implementations before each test
    jest.clearAllMocks();

    // Set default mock implementations
    mockMongoDBService.healthCheck.mockResolvedValue({
      status: 'healthy',
      connected: true,
      database: 'test-db',
    });
    mockMongoDBService.listDatabases.mockResolvedValue([
      { name: 'test-db', sizeOnDisk: 1024000, empty: false },
      { name: 'admin', sizeOnDisk: 32768, empty: false },
    ]);
    mockMongoDBService.listCollections.mockResolvedValue([
      { name: 'users', type: 'collection', options: {}, info: { readOnly: false } },
      { name: 'products', type: 'collection', options: {}, info: { readOnly: false } },
    ]);
    mockMongoDBService.createCollection.mockResolvedValue(undefined);
    mockMongoDBService.dropCollection.mockResolvedValue(true);
    mockMongoDBService.collectionExists.mockResolvedValue(true);
    mockMongoDBService.find.mockResolvedValue([
      { _id: '1', name: 'Test User 1', email: 'user1@example.com' },
      { _id: '2', name: 'Test User 2', email: 'user2@example.com' },
    ]);
    mockMongoDBService.findOne.mockResolvedValue({
      _id: '1',
      name: 'Test User 1',
      email: 'user1@example.com',
    });
    mockMongoDBService.insertOne.mockResolvedValue({
      acknowledged: true,
      insertedId: 'mock-id-123',
    });
    mockMongoDBService.insertMany.mockResolvedValue({
      acknowledged: true,
      insertedCount: 2,
      insertedIds: ['mock-id-1', 'mock-id-2'],
    });
    mockMongoDBService.updateOne.mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
    });
    mockMongoDBService.updateMany.mockResolvedValue({
      acknowledged: true,
      matchedCount: 2,
      modifiedCount: 2,
      upsertedCount: 0,
    });
    mockMongoDBService.deleteOne.mockResolvedValue({
      acknowledged: true,
      deletedCount: 1,
    });
    mockMongoDBService.deleteMany.mockResolvedValue({
      acknowledged: true,
      deletedCount: 2,
    });
    mockMongoDBService.countDocuments.mockResolvedValue(5);
    mockMongoDBService.aggregate.mockResolvedValue([
      { _id: 'Electronics', total: 1029.98 },
    ]);
  });

  describe('GET /api/mongodb/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/mongodb/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'healthy',
        connected: true,
        database: 'test-db',
      });
      expect(mockMongoDBService.healthCheck).toHaveBeenCalled();
    });

    it('should handle health check errors', async () => {
      mockMongoDBService.healthCheck.mockRejectedValueOnce(
        new Error('Connection failed')
      );

      const response = await request(app).get('/api/mongodb/health');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/mongodb/databases', () => {
    it('should list all databases', async () => {
      const response = await request(app).get('/api/mongodb/databases');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'test-db');
      expect(mockMongoDBService.listDatabases).toHaveBeenCalled();
    });

    it('should handle errors when listing databases', async () => {
      mockMongoDBService.listDatabases.mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await request(app).get('/api/mongodb/databases');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/mongodb/collections', () => {
    it('should list all collections', async () => {
      const response = await request(app).get('/api/mongodb/collections');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'users');
      expect(mockMongoDBService.listCollections).toHaveBeenCalled();
    });
  });

  describe('POST /api/mongodb/collections', () => {
    it('should create a new collection', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections')
        .send({ name: 'new-collection' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(mockMongoDBService.createCollection).toHaveBeenCalledWith('new-collection');
    });

    it('should return error if collection name is missing', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/mongodb/collections/:collectionName', () => {
    it('should drop a collection', async () => {
      const response = await request(app).delete('/api/mongodb/collections/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(mockMongoDBService.dropCollection).toHaveBeenCalledWith('users');
    });
  });

  describe('GET /api/mongodb/collections/:collectionName/exists', () => {
    it('should check if collection exists', async () => {
      const response = await request(app).get('/api/mongodb/collections/users/exists');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('exists', true);
      expect(mockMongoDBService.collectionExists).toHaveBeenCalledWith('users');
    });
  });

  describe('POST /api/mongodb/collections/:collectionName/find', () => {
    it('should find documents in a collection', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections/users/find')
        .send({
          filter: { name: 'Test User 1' },
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(mockMongoDBService.find).toHaveBeenCalledWith('users', {
        filter: { name: 'Test User 1' },
        limit: 10,
        skip: undefined,
        sort: undefined,
      });
    });

    it('should return error if collection name is missing', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections//find')
        .send({ filter: {} });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/mongodb/collections/:collectionName/findOne', () => {
    it('should find one document', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections/users/findOne')
        .send({ filter: { _id: '1' } });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', '1');
      expect(mockMongoDBService.findOne).toHaveBeenCalledWith('users', { _id: '1' });
    });
  });

  describe('POST /api/mongodb/collections/:collectionName/insertOne', () => {
    it('should insert one document', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections/users/insertOne')
        .send({
          document: {
            name: 'New User',
            email: 'newuser@example.com',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('acknowledged', true);
      expect(response.body).toHaveProperty('insertedId', 'mock-id-123');
      expect(mockMongoDBService.insertOne).toHaveBeenCalledWith('users', {
        name: 'New User',
        email: 'newuser@example.com',
      });
    });

    it('should return error if document is missing', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections/users/insertOne')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/mongodb/collections/:collectionName/insertMany', () => {
    it('should insert many documents', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections/users/insertMany')
        .send({
          documents: [
            { name: 'User 1', email: 'user1@example.com' },
            { name: 'User 2', email: 'user2@example.com' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('acknowledged', true);
      expect(response.body).toHaveProperty('insertedCount', 2);
    });

    it('should return error if documents array is missing', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections/users/insertMany')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/mongodb/collections/:collectionName/updateOne', () => {
    it('should update one document', async () => {
      const response = await request(app)
        .patch('/api/mongodb/collections/users/updateOne')
        .send({
          filter: { _id: '1' },
          update: { $set: { name: 'Updated Name' } },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('matchedCount', 1);
      expect(response.body).toHaveProperty('modifiedCount', 1);
      expect(mockMongoDBService.updateOne).toHaveBeenCalledWith(
        'users',
        { _id: '1' },
        { $set: { name: 'Updated Name' } }
      );
    });

    it('should return error if filter is missing', async () => {
      const response = await request(app)
        .patch('/api/mongodb/collections/users/updateOne')
        .send({ update: { $set: { name: 'Updated Name' } } });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/mongodb/collections/:collectionName/updateMany', () => {
    it('should update many documents', async () => {
      const response = await request(app)
        .patch('/api/mongodb/collections/users/updateMany')
        .send({
          filter: { role: 'user' },
          update: { $set: { active: true } },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('matchedCount', 2);
      expect(response.body).toHaveProperty('modifiedCount', 2);
    });
  });

  describe('DELETE /api/mongodb/collections/:collectionName/deleteOne', () => {
    it('should delete one document', async () => {
      const response = await request(app)
        .delete('/api/mongodb/collections/users/deleteOne')
        .send({ filter: { _id: '1' } });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deletedCount', 1);
      expect(mockMongoDBService.deleteOne).toHaveBeenCalledWith('users', { _id: '1' });
    });

    it('should return error if filter is missing', async () => {
      const response = await request(app)
        .delete('/api/mongodb/collections/users/deleteOne')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/mongodb/collections/:collectionName/deleteMany', () => {
    it('should delete many documents', async () => {
      const response = await request(app)
        .delete('/api/mongodb/collections/users/deleteMany')
        .send({ filter: { active: false } });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deletedCount', 2);
    });
  });

  describe('POST /api/mongodb/collections/:collectionName/count', () => {
    it('should count documents', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections/users/count')
        .send({ filter: { role: 'user' } });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count', 5);
      expect(mockMongoDBService.countDocuments).toHaveBeenCalledWith('users', {
        role: 'user',
      });
    });
  });

  describe('POST /api/mongodb/collections/:collectionName/aggregate', () => {
    it('should aggregate documents', async () => {
      const pipeline = [
        { $match: { category: 'Electronics' } },
        { $group: { _id: '$category', total: { $sum: '$price' } } },
      ];

      const response = await request(app)
        .post('/api/mongodb/collections/products/aggregate')
        .send({ pipeline });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('_id', 'Electronics');
      expect(mockMongoDBService.aggregate).toHaveBeenCalledWith('products', pipeline);
    });

    it('should return error if pipeline is missing', async () => {
      const response = await request(app)
        .post('/api/mongodb/collections/products/aggregate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
