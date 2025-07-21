
// Component categories
export const COMPONENT_CATEGORIES = [
  'Compute',
  'Storage',
  'Database',
  'Networking',
  'Security',
  'Serverless',
  'Containers',
] as const;

// Field types
export const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'url', label: 'URL' },
] as const;

// API endpoints
export const API_ENDPOINTS = {
  DIAGRAMS: '/api/diagrams',
  NODE_TYPES: '/api/node-types',
  HEALTH: '/api/health',
} as const;

// Default values
export const DEFAULT_NODE_SIZE = {
  width: 150,
  height: 60,
} as const;

export const DEFAULT_GRID_SIZE = 20;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_TYPE: 'Invalid component type',
  DUPLICATE_FIELD: 'Field names must be unique',
  COMPONENT_EXISTS: 'Component type already exists',
} as const;
