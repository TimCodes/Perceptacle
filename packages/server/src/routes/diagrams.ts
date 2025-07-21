
import { Router } from 'express';
import { 
  diagramSchema, 
  createDiagramSchema, 
  updateDiagramSchema,
  type Diagram,
  type CreateDiagram,
  type UpdateDiagram,
  generateId,
  storage
} from '@github-manager/core';

const router = Router();

// In-memory storage for demo (replace with database in production)
let diagrams: Diagram[] = [];

// GET /api/diagrams - Get all diagrams
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: diagrams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch diagrams'
    });
  }
});

// GET /api/diagrams/:id - Get diagram by ID
router.get('/:id', (req, res) => {
  try {
    const diagram = diagrams.find(d => d.id === req.params.id);
    
    if (!diagram) {
      return res.status(404).json({
        success: false,
        error: 'Diagram not found'
      });
    }

    res.json({
      success: true,
      data: diagram
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch diagram'
    });
  }
});

// POST /api/diagrams - Create new diagram
router.post('/', (req, res) => {
  try {
    const result = createDiagramSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid diagram data',
        details: result.error.errors
      });
    }

    const now = new Date();
    const diagram: Diagram = {
      id: generateId(),
      ...result.data,
      createdAt: now,
      updatedAt: now
    };

    diagrams.push(diagram);

    res.status(201).json({
      success: true,
      data: diagram
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create diagram'
    });
  }
});

// PUT /api/diagrams/:id - Update diagram
router.put('/:id', (req, res) => {
  try {
    const diagramIndex = diagrams.findIndex(d => d.id === req.params.id);
    
    if (diagramIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Diagram not found'
      });
    }

    const result = updateDiagramSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid diagram data',
        details: result.error.errors
      });
    }

    const updatedDiagram: Diagram = {
      ...diagrams[diagramIndex],
      ...result.data,
      updatedAt: new Date()
    };

    diagrams[diagramIndex] = updatedDiagram;

    res.json({
      success: true,
      data: updatedDiagram
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update diagram'
    });
  }
});

// DELETE /api/diagrams/:id - Delete diagram
router.delete('/:id', (req, res) => {
  try {
    const diagramIndex = diagrams.findIndex(d => d.id === req.params.id);
    
    if (diagramIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Diagram not found'
      });
    }

    diagrams.splice(diagramIndex, 1);

    res.json({
      success: true,
      message: 'Diagram deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete diagram'
    });
  }
});

export default router;
