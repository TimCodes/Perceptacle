
import { Router } from 'express';
import { createSuccessResponse, createErrorResponse } from '@github-manager/core';
import type { Diagram } from '@github-manager/core';

const router = Router();

// In-memory storage (replace with database in production)
let diagrams: Diagram[] = [];

// GET /api/diagrams - Get all diagrams
router.get('/', (req, res) => {
  res.json(createSuccessResponse(diagrams));
});

// GET /api/diagrams/:id - Get diagram by ID
router.get('/:id', (req, res) => {
  const diagram = diagrams.find(d => d.id === req.params.id);
  if (!diagram) {
    return res.status(404).json(createErrorResponse('Diagram not found'));
  }
  res.json(createSuccessResponse(diagram));
});

// POST /api/diagrams - Create new diagram
router.post('/', (req, res) => {
  try {
    const diagram: Diagram = {
      ...req.body,
      id: `diagram-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    diagrams.push(diagram);
    res.status(201).json(createSuccessResponse(diagram));
  } catch (error) {
    res.status(400).json(createErrorResponse('Invalid diagram data'));
  }
});

// PUT /api/diagrams/:id - Update diagram
router.put('/:id', (req, res) => {
  const index = diagrams.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json(createErrorResponse('Diagram not found'));
  }
  
  diagrams[index] = {
    ...diagrams[index],
    ...req.body,
    updatedAt: new Date(),
  };
  
  res.json(createSuccessResponse(diagrams[index]));
});

// DELETE /api/diagrams/:id - Delete diagram
router.delete('/:id', (req, res) => {
  const index = diagrams.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json(createErrorResponse('Diagram not found'));
  }
  
  diagrams.splice(index, 1);
  res.json(createSuccessResponse({ message: 'Diagram deleted successfully' }));
});

export { router as diagramRoutes };
