
import { Router } from 'express';
import { createSuccessResponse, createErrorResponse, validateFieldNames } from '@github-manager/core';
import type { NodeType } from '@github-manager/core';

const router = Router();

// In-memory storage (replace with database in production)
let customNodeTypes: NodeType[] = [];

// GET /api/node-types - Get all custom node types
router.get('/', (req, res) => {
  res.json(createSuccessResponse(customNodeTypes));
});

// GET /api/node-types/:type - Get node type by type
router.get('/:type', (req, res) => {
  const nodeType = customNodeTypes.find(nt => nt.type === req.params.type);
  if (!nodeType) {
    return res.status(404).json(createErrorResponse('Node type not found'));
  }
  res.json(createSuccessResponse(nodeType));
});

// POST /api/node-types - Create new node type
router.post('/', (req, res) => {
  try {
    const nodeType: NodeType = req.body;
    
    // Validate required fields
    if (!nodeType.type || !nodeType.label || !nodeType.category) {
      return res.status(400).json(createErrorResponse('Missing required fields'));
    }
    
    // Check if type already exists
    if (customNodeTypes.some(nt => nt.type === nodeType.type)) {
      return res.status(409).json(createErrorResponse('Node type already exists'));
    }
    
    // Validate field names are unique
    if (nodeType.fields && !validateFieldNames(nodeType.fields)) {
      return res.status(400).json(createErrorResponse('Field names must be unique'));
    }
    
    customNodeTypes.push(nodeType);
    res.status(201).json(createSuccessResponse(nodeType));
  } catch (error) {
    res.status(400).json(createErrorResponse('Invalid node type data'));
  }
});

// PUT /api/node-types/:type - Update node type
router.put('/:type', (req, res) => {
  const index = customNodeTypes.findIndex(nt => nt.type === req.params.type);
  if (index === -1) {
    return res.status(404).json(createErrorResponse('Node type not found'));
  }
  
  const updatedNodeType = { ...customNodeTypes[index], ...req.body };
  
  // Validate field names are unique
  if (updatedNodeType.fields && !validateFieldNames(updatedNodeType.fields)) {
    return res.status(400).json(createErrorResponse('Field names must be unique'));
  }
  
  customNodeTypes[index] = updatedNodeType;
  res.json(createSuccessResponse(customNodeTypes[index]));
});

// DELETE /api/node-types/:type - Delete node type
router.delete('/:type', (req, res) => {
  const index = customNodeTypes.findIndex(nt => nt.type === req.params.type);
  if (index === -1) {
    return res.status(404).json(createErrorResponse('Node type not found'));
  }
  
  customNodeTypes.splice(index, 1);
  res.json(createSuccessResponse({ message: 'Node type deleted successfully' }));
});

export { router as nodeTypeRoutes };
