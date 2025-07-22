
// Node categories
export const NODE_CATEGORIES = [
  'Compute',
  'Storage', 
  'Database',
  'Networking',
  'Security',
  'Serverless',
] as const;

// Field types for dynamic forms
export const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'url', label: 'URL' },
] as const;

// Default component icons
export const DEFAULT_ICONS = {
  Compute: 'Server',
  Storage: 'Database',
  Database: 'Database',
  Networking: 'Network',
  Security: 'Shield',
  Serverless: 'Zap',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  DIAGRAMS: '/api/diagrams',
  NODE_TYPES: '/api/node-types',
  COMPONENTS: '/api/components',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  CUSTOM_COMPONENTS: 'customComponents',
  DIAGRAMS: 'diagrams',
  THEME: 'theme',
  SETTINGS: 'settings',
} as const;

// Default diagram settings
export const DEFAULT_DIAGRAM_SETTINGS = {
  snapToGrid: true,
  showMinimap: false,
  gridSize: 20,
  zoom: 1,
} as const;

// Color schemes for components
export const COMPONENT_COLORS = {
  Compute: '#4285f4',
  Storage: '#34a853', 
  Database: '#ea4335',
  Networking: '#fbbc04',
  Security: '#9aa0a6',
  Serverless: '#ff6d01',
} as const;
