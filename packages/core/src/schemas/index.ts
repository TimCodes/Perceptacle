
import { z } from 'zod';

// Custom field schema
export const CustomFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['text', 'number', 'select', 'textarea', 'url']),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  defaultValue: z.string().optional(),
  placeholder: z.string().optional(),
});

// Node type schema
export const NodeTypeSchema = z.object({
  type: z.string().min(1, 'Component type is required'),
  label: z.string().min(1, 'Display name is required'),
  icon: z.string(),
  category: z.string().min(1, 'Category is required'),
  fields: z.array(CustomFieldSchema).optional(),
});

// Diagram node schema
export const DiagramNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()),
});

// Diagram edge schema
export const DiagramEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
});

// Diagram schema
export const DiagramSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Diagram name is required'),
  description: z.string().optional(),
  nodes: z.array(DiagramNodeSchema),
  edges: z.array(DiagramEdgeSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// API response schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});
