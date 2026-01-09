import { pgTable, uuid, varchar, text, timestamp, jsonb, real, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Telemetry Maps table
export const telemetryMaps = pgTable('telemetry_maps', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  tags: text('tags').array(),
  metadata: jsonb('metadata').default('{}').notNull(),
}, (table) => ({
  createdByIdx: index('idx_telemetry_maps_created_by').on(table.createdBy),
}));

// Telemetry Map Nodes table
export const telemetryMapNodes = pgTable('telemetry_map_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').notNull().references(() => telemetryMaps.id, { onDelete: 'cascade' }),
  nodeId: varchar('node_id', { length: 255 }).notNull(), // The node's ID from the diagram
  nodeType: varchar('node_type', { length: 100 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  description: text('description'),
  positionX: real('position_x').notNull(),
  positionY: real('position_y').notNull(),
  config: jsonb('config').default('{}').notNull(), // Node-specific configuration
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  mapIdIdx: index('idx_telemetry_map_nodes_map_id').on(table.mapId),
}));

// Telemetry Map Connections table
export const telemetryMapConnections = pgTable('telemetry_map_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  mapId: uuid('map_id').notNull().references(() => telemetryMaps.id, { onDelete: 'cascade' }),
  sourceNodeId: varchar('source_node_id', { length: 255 }).notNull(),
  targetNodeId: varchar('target_node_id', { length: 255 }).notNull(),
  connectionType: varchar('connection_type', { length: 100 }).default('default').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  mapIdIdx: index('idx_telemetry_map_connections_map_id').on(table.mapId),
}));

// Relations
export const telemetryMapsRelations = relations(telemetryMaps, ({ many }) => ({
  nodes: many(telemetryMapNodes),
  connections: many(telemetryMapConnections),
}));

export const telemetryMapNodesRelations = relations(telemetryMapNodes, ({ one }) => ({
  map: one(telemetryMaps, {
    fields: [telemetryMapNodes.mapId],
    references: [telemetryMaps.id],
  }),
}));

export const telemetryMapConnectionsRelations = relations(telemetryMapConnections, ({ one }) => ({
  map: one(telemetryMaps, {
    fields: [telemetryMapConnections.mapId],
    references: [telemetryMaps.id],
  }),
}));

// Export types
export type TelemetryMap = typeof telemetryMaps.$inferSelect;
export type InsertTelemetryMap = typeof telemetryMaps.$inferInsert;

export type TelemetryMapNode = typeof telemetryMapNodes.$inferSelect;
export type InsertTelemetryMapNode = typeof telemetryMapNodes.$inferInsert;

export type TelemetryMapConnection = typeof telemetryMapConnections.$inferSelect;
export type InsertTelemetryMapConnection = typeof telemetryMapConnections.$inferInsert;
