
// Diagram types
export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    category: string;
    fields?: Record<string, any>;
    [key: string]: any;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, any>;
}

export interface Diagram {
  id: string;
  name: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  createdAt: Date;
  updatedAt: Date;
}

// Component types
export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'url';
  required: boolean;
  options?: string[];
  defaultValue?: string;
  placeholder?: string;
}

export interface ComponentType {
  type: string;
  label: string;
  category: string;
  icon: string;
  fields?: CustomField[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Node type categories
export type NodeCategory = 
  | 'Compute' 
  | 'Storage' 
  | 'Database' 
  | 'Networking' 
  | 'Security' 
  | 'Serverless';

// Field types for dynamic forms
export type FieldType = 'text' | 'number' | 'select' | 'textarea' | 'url';

export interface FieldTypeOption {
  value: FieldType;
  label: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';
