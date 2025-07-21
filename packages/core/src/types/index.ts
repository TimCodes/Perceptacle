
import { z } from 'zod';

// Node/Component types
export interface NodeType {
  type: string;
  label: string;
  icon: string;
  category: string;
  fields?: CustomField[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'url';
  required: boolean;
  options?: string[];
  defaultValue?: string;
  placeholder?: string;
}

// Diagram types
export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    [key: string]: any;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Diagram {
  id: string;
  name: string;
  description?: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  createdAt: Date;
  updatedAt: Date;
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
