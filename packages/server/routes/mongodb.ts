import { Router, type Request, Response } from "express";
import { serviceFactory } from "../services/service-factory";
import { MongoDBService, MockMongoDBService } from "../services";

const router = Router();

// Get MongoDB service instance (real or mock based on configuration)
let mongoDBService: MongoDBService | MockMongoDBService | null = null;

/**
 * Validate and sanitize collection name to prevent injection attacks
 * MongoDB collection names must follow certain rules
 */
const validateCollectionName = (name: string): boolean => {
  // Collection names must be strings, non-empty, and follow MongoDB naming rules
  if (!name || typeof name !== 'string') return false;
  
  // MongoDB collection names cannot:
  // - Be empty
  // - Contain null character
  // - Start with "system."
  // - Contain $
  if (name.length === 0 || 
      name.includes('\0') || 
      name.startsWith('system.') ||
      name.includes('$')) {
    return false;
  }
  
  // Additional security: only allow alphanumeric, underscore, and hyphen
  // This is more restrictive than MongoDB but safer
  const safeNamePattern = /^[a-zA-Z0-9_-]+$/;
  return safeNamePattern.test(name);
};

/**
 * Basic validation for filter objects to prevent NoSQL injection
 * This is a conservative approach - reject filters with suspicious operators
 */
const validateFilter = (filter: any): boolean => {
  if (!filter || typeof filter !== 'object') return true; // Empty filter is OK
  
  // Check for potentially dangerous operators at root level
  // We allow standard MongoDB query operators but want to ensure they're used properly
  const dangerousPatterns = ['$where', '$function', '$accumulator'];
  
  const checkObject = (obj: any, depth: number = 0): boolean => {
    // Prevent extremely deep nesting (potential DoS)
    if (depth > 10) return false;
    
    for (const key of Object.keys(obj)) {
      // Check for dangerous operators
      if (dangerousPatterns.some(pattern => key.includes(pattern))) {
        return false;
      }
      
      // Recursively check nested objects
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        if (!checkObject(obj[key], depth + 1)) return false;
      }
    }
    return true;
  };
  
  return checkObject(filter);
};

// Middleware to ensure MongoDB service is initialized
const ensureMongoDBService = (req: Request, res: Response, next: any) => {
  if (!mongoDBService) {
    try {
      mongoDBService = serviceFactory.createMongoDBService();
      console.log(`MongoDB service initialized (using ${serviceFactory.isUsingMocks() ? 'mock' : 'real'} implementation)`);
    } catch (error) {
      console.error('Failed to initialize MongoDB service:', error);
      return res.status(500).json({ 
        error: 'Failed to initialize MongoDB service. Check your configuration.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  next();
};

/**
 * Health check endpoint
 * GET /api/mongodb/health
 */
router.get("/health", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const health = await mongoDBService!.healthCheck();
    res.json(health);
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      error: 'Health check failed',
      details: error.message 
    });
  }
});

/**
 * List all databases
 * GET /api/mongodb/databases
 */
router.get("/databases", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const databases = await mongoDBService!.listDatabases();
    res.json(databases);
  } catch (error: any) {
    console.error('Error listing databases:', error);
    res.status(500).json({ 
      error: 'Failed to list databases',
      details: error.message 
    });
  }
});

/**
 * List all collections in the current database
 * GET /api/mongodb/collections
 */
router.get("/collections", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const collections = await mongoDBService!.listCollections();
    res.json(collections);
  } catch (error: any) {
    console.error('Error listing collections:', error);
    res.status(500).json({ 
      error: 'Failed to list collections',
      details: error.message 
    });
  }
});

/**
 * Create a new collection
 * POST /api/mongodb/collections
 * Body: { "name": "collection_name" }
 */
router.post("/collections", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (!validateCollectionName(name)) {
      return res.status(400).json({ error: 'Invalid collection name. Use only alphanumeric characters, underscores, and hyphens.' });
    }

    await mongoDBService!.createCollection(name);
    res.json({ success: true, message: `Collection '${name}' created successfully` });
  } catch (error: any) {
    console.error('Error creating collection:', error);
    res.status(500).json({ 
      error: 'Failed to create collection',
      details: error.message 
    });
  }
});

/**
 * Drop a collection
 * DELETE /api/mongodb/collections/:collectionName
 */
router.delete("/collections/:collectionName", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (!validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    const result = await mongoDBService!.dropCollection(collectionName);
    res.json({ success: result, message: result ? `Collection '${collectionName}' dropped successfully` : `Collection '${collectionName}' not found` });
  } catch (error: any) {
    console.error('Error dropping collection:', error);
    res.status(500).json({ 
      error: 'Failed to drop collection',
      details: error.message 
    });
  }
});

/**
 * Check if a collection exists
 * GET /api/mongodb/collections/:collectionName/exists
 */
router.get("/collections/:collectionName/exists", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    const exists = await mongoDBService!.collectionExists(collectionName);
    res.json({ exists });
  } catch (error: any) {
    console.error('Error checking collection existence:', error);
    res.status(500).json({ 
      error: 'Failed to check collection existence',
      details: error.message 
    });
  }
});

/**
 * Find documents in a collection
 * POST /api/mongodb/collections/:collectionName/find
 * Body: { "filter": {...}, "limit": 100, "skip": 0, "sort": {...} }
 */
router.post("/collections/:collectionName/find", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { filter, limit, skip, sort } = req.body;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (filter && !validateFilter(filter)) {
      return res.status(400).json({ error: 'Invalid filter. Dangerous operators are not allowed.' });
    }

    const documents = await mongoDBService!.find(collectionName, {
      filter,
      limit,
      skip,
      sort
    });

    res.json(documents);
  } catch (error: any) {
    console.error('Error finding documents:', error);
    res.status(500).json({ 
      error: 'Failed to find documents',
      details: error.message 
    });
  }
});

/**
 * Find one document in a collection
 * POST /api/mongodb/collections/:collectionName/findOne
 * Body: { "filter": {...} }
 */
router.post("/collections/:collectionName/findOne", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { filter } = req.body;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (filter && !validateFilter(filter)) {
      return res.status(400).json({ error: 'Invalid filter. Dangerous operators are not allowed.' });
    }

    const document = await mongoDBService!.findOne(collectionName, filter || {});
    res.json(document);
  } catch (error: any) {
    console.error('Error finding document:', error);
    res.status(500).json({ 
      error: 'Failed to find document',
      details: error.message 
    });
  }
});

/**
 * Insert a document into a collection
 * POST /api/mongodb/collections/:collectionName/insertOne
 * Body: { "document": {...} }
 */
router.post("/collections/:collectionName/insertOne", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { document } = req.body;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (!document) {
      return res.status(400).json({ error: 'Document is required' });
    }

    const result = await mongoDBService!.insertOne(collectionName, document);
    res.json(result);
  } catch (error: any) {
    console.error('Error inserting document:', error);
    res.status(500).json({ 
      error: 'Failed to insert document',
      details: error.message 
    });
  }
});

/**
 * Insert multiple documents into a collection
 * POST /api/mongodb/collections/:collectionName/insertMany
 * Body: { "documents": [...] }
 */
router.post("/collections/:collectionName/insertMany", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { documents } = req.body;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents array is required' });
    }

    const result = await mongoDBService!.insertMany(collectionName, documents);
    res.json(result);
  } catch (error: any) {
    console.error('Error inserting documents:', error);
    res.status(500).json({ 
      error: 'Failed to insert documents',
      details: error.message 
    });
  }
});

/**
 * Update a document in a collection
 * PATCH /api/mongodb/collections/:collectionName/updateOne
 * Body: { "filter": {...}, "update": {...} }
 */
router.patch("/collections/:collectionName/updateOne", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { filter, update } = req.body;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (!filter) {
      return res.status(400).json({ error: 'Filter is required' });
    }

    if (filter && !validateFilter(filter)) {
      return res.status(400).json({ error: 'Invalid filter. Dangerous operators are not allowed.' });
    }

    if (!update) {
      return res.status(400).json({ error: 'Update is required' });
    }

    const result = await mongoDBService!.updateOne(collectionName, filter, update);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating document:', error);
    res.status(500).json({ 
      error: 'Failed to update document',
      details: error.message 
    });
  }
});

/**
 * Update multiple documents in a collection
 * PATCH /api/mongodb/collections/:collectionName/updateMany
 * Body: { "filter": {...}, "update": {...} }
 */
router.patch("/collections/:collectionName/updateMany", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { filter, update } = req.body;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (!filter) {
      return res.status(400).json({ error: 'Filter is required' });
    }

    if (filter && !validateFilter(filter)) {
      return res.status(400).json({ error: 'Invalid filter. Dangerous operators are not allowed.' });
    }

    if (!update) {
      return res.status(400).json({ error: 'Update is required' });
    }

    const result = await mongoDBService!.updateMany(collectionName, filter, update);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating documents:', error);
    res.status(500).json({ 
      error: 'Failed to update documents',
      details: error.message 
    });
  }
});

/**
 * Delete a document from a collection
 * DELETE /api/mongodb/collections/:collectionName/deleteOne
 * Body: { "filter": {...} }
 */
router.delete("/collections/:collectionName/deleteOne", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { filter } = req.body;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (!filter) {
      return res.status(400).json({ error: 'Filter is required' });
    }

    if (filter && !validateFilter(filter)) {
      return res.status(400).json({ error: 'Invalid filter. Dangerous operators are not allowed.' });
    }

    const result = await mongoDBService!.deleteOne(collectionName, filter);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting document:', error);
    res.status(500).json({ 
      error: 'Failed to delete document',
      details: error.message 
    });
  }
});

/**
 * Delete multiple documents from a collection
 * DELETE /api/mongodb/collections/:collectionName/deleteMany
 * Body: { "filter": {...} }
 */
router.delete("/collections/:collectionName/deleteMany", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { filter } = req.body;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (!filter) {
      return res.status(400).json({ error: 'Filter is required' });
    }

    if (filter && !validateFilter(filter)) {
      return res.status(400).json({ error: 'Invalid filter. Dangerous operators are not allowed.' });
    }

    const result = await mongoDBService!.deleteMany(collectionName, filter);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting documents:', error);
    res.status(500).json({ 
      error: 'Failed to delete documents',
      details: error.message 
    });
  }
});

/**
 * Count documents in a collection
 * POST /api/mongodb/collections/:collectionName/count
 * Body: { "filter": {...} }
 */
router.post("/collections/:collectionName/count", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { filter } = req.body;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (filter && !validateFilter(filter)) {
      return res.status(400).json({ error: 'Invalid filter. Dangerous operators are not allowed.' });
    }

    const count = await mongoDBService!.countDocuments(collectionName, filter || {});
    res.json({ count });
  } catch (error: any) {
    console.error('Error counting documents:', error);
    res.status(500).json({ 
      error: 'Failed to count documents',
      details: error.message 
    });
  }
});

/**
 * Aggregate documents in a collection
 * POST /api/mongodb/collections/:collectionName/aggregate
 * Body: { "pipeline": [...] }
 */
router.post("/collections/:collectionName/aggregate", ensureMongoDBService, async (req: Request, res: Response) => {
  try {
    const { collectionName } = req.params;
    const { pipeline } = req.body;

    if (!collectionName || !validateCollectionName(collectionName)) {
      return res.status(400).json({ error: 'Invalid collection name' });
    }

    if (!pipeline || !Array.isArray(pipeline)) {
      return res.status(400).json({ error: 'Pipeline array is required' });
    }

    const result = await mongoDBService!.aggregate(collectionName, pipeline);
    res.json(result);
  } catch (error: any) {
    console.error('Error aggregating documents:', error);
    res.status(500).json({ 
      error: 'Failed to aggregate documents',
      details: error.message 
    });
  }
});

export default router;
