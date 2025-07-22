
import { Router } from 'express';
import { 
  componentTypeSchema,
  createComponentTypeSchema,
  updateComponentTypeSchema,
  type ComponentType,
  type CreateComponentType,
  type UpdateComponentType,
  generateId,
  validateUniqueFieldNames,
  getComponentIcon
} from '@github-manager/core';

const router = Router();

// In-memory storage for demo (replace with database in production)
let customComponents: ComponentType[] = [];

// GET /api/node-types - Get all custom component types
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: customComponents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch node types'
    });
  }
});

// GET /api/node-types/:type - Get component type by type
router.get('/:type', (req, res) => {
  try {
    const component = customComponents.find(c => c.type === req.params.type);
    
    if (!component) {
      return res.status(404).json({
        success: false,
        error: 'Component type not found'
      });
    }

    res.json({
      success: true,
      data: component
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch component type'
    });
  }
});

// POST /api/node-types - Create new component type
router.post('/', (req, res) => {
  try {
    const result = createComponentTypeSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid component type data',
        details: result.error.errors
      });
    }

    // Check if type already exists
    const exists = customComponents.some(c => c.type === result.data.type);
    if (exists) {
      return res.status(409).json({
        success: false,
        error: 'Component type already exists'
      });
    }

    // Validate field names are unique
    if (result.data.fields && !validateUniqueFieldNames(result.data.fields)) {
      return res.status(400).json({
        success: false,
        error: 'Field names must be unique'
      });
    }

    const component: ComponentType = {
      ...result.data,
      icon: getComponentIcon(result.data.category)
    };

    customComponents.push(component);

    res.status(201).json({
      success: true,
      data: component
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create component type'
    });
  }
});

// PUT /api/node-types/:type - Update component type
router.put('/:type', (req, res) => {
  try {
    const componentIndex = customComponents.findIndex(c => c.type === req.params.type);
    
    if (componentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Component type not found'
      });
    }

    const result = updateComponentTypeSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid component type data',
        details: result.error.errors
      });
    }

    // Validate field names are unique if fields are being updated
    if (result.data.fields && !validateUniqueFieldNames(result.data.fields)) {
      return res.status(400).json({
        success: false,
        error: 'Field names must be unique'
      });
    }

    const updatedComponent: ComponentType = {
      ...customComponents[componentIndex],
      ...result.data
    };

    customComponents[componentIndex] = updatedComponent;

    res.json({
      success: true,
      data: updatedComponent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update component type'
    });
  }
});

// DELETE /api/node-types/:type - Delete component type
router.delete('/:type', (req, res) => {
  try {
    const componentIndex = customComponents.findIndex(c => c.type === req.params.type);
    
    if (componentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Component type not found'
      });
    }

    customComponents.splice(componentIndex, 1);

    res.json({
      success: true,
      message: 'Component type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete component type'
    });
  }
});

export default router;
