/**
 * Database Migration: Update nodeType to support NodeTypeDefinition
 * 
 * This migration updates the telemetry_map_nodes table to:
 * 1. Change nodeType from VARCHAR to JSONB to support structured types
 * 2. Add _legacyType column to store original string types for rollback
 * 3. Migrate existing data to new format
 * 
 * Migration Version: 001
 * Created: January 21, 2026
 */

-- Step 1: Add new columns (temporary approach for safe migration)
ALTER TABLE telemetry_map_nodes 
  ADD COLUMN IF NOT EXISTS node_type_new JSONB,
  ADD COLUMN IF NOT EXISTS _legacy_type VARCHAR(255);

-- Step 2: Migrate existing data
-- Convert existing string nodeType to JSONB NodeTypeDefinition format
UPDATE telemetry_map_nodes
SET 
  _legacy_type = node_type,
  node_type_new = CASE
    -- Azure Function App
    WHEN node_type IN ('azure-function-app', 'FunctionApp') THEN 
      '{"type": "azure", "subtype": "function-app"}'::jsonb
    
    -- Azure Service Bus
    WHEN node_type = 'ServiceBusQueue' THEN 
      '{"type": "azure", "subtype": "service-bus", "variant": "queue"}'::jsonb
    WHEN node_type = 'ServiceBusTopic' THEN 
      '{"type": "azure", "subtype": "service-bus", "variant": "topic"}'::jsonb
    WHEN node_type = 'azure-service-bus' THEN 
      '{"type": "azure", "subtype": "service-bus"}'::jsonb
    
    -- Azure Cosmos DB
    WHEN node_type IN ('azure-cosmos-db', 'CosmosDB') THEN 
      '{"type": "azure", "subtype": "cosmos-db"}'::jsonb
    
    -- Azure App Service
    WHEN node_type = 'azure-app-service' THEN 
      '{"type": "azure", "subtype": "app-service"}'::jsonb
    
    -- Kubernetes Pod
    WHEN node_type IN ('k8s-pod', 'pod') THEN 
      '{"type": "kubernetes", "subtype": "pod"}'::jsonb
    
    -- Kubernetes Deployment
    WHEN node_type IN ('k8s-deployment', 'deployment') THEN 
      '{"type": "kubernetes", "subtype": "deployment"}'::jsonb
    
    -- Kubernetes Service
    WHEN node_type IN ('k8s-service', 'service') THEN 
      '{"type": "kubernetes", "subtype": "service"}'::jsonb
    
    -- Kafka Topic
    WHEN node_type = 'kafka-topic' THEN 
      '{"type": "kafka", "subtype": "topic"}'::jsonb
    
    -- Kafka Producer
    WHEN node_type = 'kafka-producer' THEN 
      '{"type": "kafka", "subtype": "producer"}'::jsonb
    
    -- Kafka Consumer
    WHEN node_type = 'kafka-consumer' THEN 
      '{"type": "kafka", "subtype": "consumer"}'::jsonb
    
    -- Kafka Broker
    WHEN node_type = 'kafka-broker' THEN 
      '{"type": "kafka", "subtype": "broker"}'::jsonb
    
    -- GCP Compute Engine
    WHEN node_type = 'gcp-compute-engine' THEN 
      '{"type": "gcp", "subtype": "compute-engine"}'::jsonb
    
    -- GCP Cloud Function
    WHEN node_type = 'gcp-cloud-function' THEN 
      '{"type": "gcp", "subtype": "cloud-function"}'::jsonb
    
    -- GCP Cloud Run
    WHEN node_type = 'gcp-cloud-run' THEN 
      '{"type": "gcp", "subtype": "cloud-run"}'::jsonb
    
    -- GCP Cloud Storage
    WHEN node_type = 'gcp-cloud-storage' THEN 
      '{"type": "gcp", "subtype": "cloud-storage"}'::jsonb
    
    -- Default/Generic - try to parse pattern
    WHEN node_type LIKE '%-%' THEN
      -- Parse "type-subtype" pattern
      jsonb_build_object(
        'type', split_part(node_type, '-', 1),
        'subtype', substring(node_type from position('-' in node_type) + 1)
      )
    
    -- Fallback to generic
    ELSE 
      jsonb_build_object(
        'type', 'generic',
        'subtype', 'custom',
        'variant', node_type
      )
  END
WHERE node_type_new IS NULL;

-- Step 3: Verify migration (check for any NULL values)
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM telemetry_map_nodes
  WHERE node_type_new IS NULL;
  
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % rows have NULL node_type_new', null_count;
  END IF;
  
  RAISE NOTICE 'Migration verification passed: All rows migrated successfully';
END $$;

-- Step 4: Drop old column and rename new column
ALTER TABLE telemetry_map_nodes 
  DROP COLUMN node_type;

ALTER TABLE telemetry_map_nodes 
  RENAME COLUMN node_type_new TO node_type;

-- Step 5: Add NOT NULL constraint to new column
ALTER TABLE telemetry_map_nodes 
  ALTER COLUMN node_type SET NOT NULL;

-- Step 6: Create index on node_type for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_telemetry_map_nodes_node_type_type 
  ON telemetry_map_nodes ((node_type->>'type'));

CREATE INDEX IF NOT EXISTS idx_telemetry_map_nodes_node_type_subtype 
  ON telemetry_map_nodes ((node_type->>'subtype'));

-- Migration complete
-- Note: Keep _legacy_type column for potential rollback scenarios
