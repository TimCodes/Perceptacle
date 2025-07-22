
import { z } from 'zod';

// Custom field schema
export const customFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['text', 'number', 'select', 'textarea', 'url']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  defaultValue: z.string().optional(),
  placeholder: z.string().optional(),
});

// Component type schema
export const componentTypeSchema = z.object({
  type: z.string().min(1, 'Component type is required'),
  label: z.string().min(1, 'Label is required'),
  category: z.enum(['Compute', 'Storage', 'Database', 'Networking', 'Security', 'Serverless']),
  icon: z.string().default('Box'),
  fields: z.array(customFieldSchema).optional(),
});

// Diagram node schema
export const diagramNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z.string(),
    category: z.string(),
    fields: z.record(z.any()).optional(),
  }).passthrough(),
});

// Diagram edge schema
export const diagramEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
  data: z.record(z.any()).optional(),
});

// Diagram schema
export const diagramSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Diagram name is required'),
  nodes: z.array(diagramNodeSchema),
  edges: z.array(diagramEdgeSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// API schemas
export const createComponentTypeSchema = componentTypeSchema.omit({ icon: true });
export const updateComponentTypeSchema = componentTypeSchema.partial();

export const createDiagramSchema = z.object({
  name: z.string().min(1, 'Diagram name is required'),
  nodes: z.array(diagramNodeSchema).default([]),
  edges: z.array(diagramEdgeSchema).default([]),
});

export const updateDiagramSchema = createDiagramSchema.partial();

// Schema-specific type exports (avoiding conflicts with types/index.ts)
export type CreateComponentType = z.infer<typeof createComponentTypeSchema>;
export type UpdateComponentType = z.infer<typeof updateComponentTypeSchema>;
export type CreateDiagram = z.infer<typeof createDiagramSchema>;
export type UpdateDiagram = z.infer<typeof updateDiagramSchema>;
