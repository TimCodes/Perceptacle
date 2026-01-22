/**
 * Database Migration Rollback: Revert nodeType to VARCHAR
 * 
 * This rollback script reverts the changes made in migration 001.
 * It restores the original VARCHAR nodeType column using the _legacy_type backup.
 * 
 * Migration Version: 001_rollback
 * Created: January 21, 2026
 */

-- Step 1: Add back the VARCHAR column
ALTER TABLE telemetry_map_nodes 
  ADD COLUMN IF NOT EXISTS node_type_old VARCHAR(255);

-- Step 2: Restore from _legacy_type if available, otherwise convert from JSONB
UPDATE telemetry_map_nodes
SET node_type_old = COALESCE(
  _legacy_type,
  -- If no legacy type, convert JSONB back to string
  CASE 
    -- Try to build legacy format from JSONB
    WHEN node_type->>'variant' IS NOT NULL THEN 
      (node_type->>'type') || '-' || (node_type->>'subtype') || '-' || (node_type->>'variant')
    ELSE 
      (node_type->>'type') || '-' || (node_type->>'subtype')
  END
);

-- Step 3: Verify rollback data
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM telemetry_map_nodes
  WHERE node_type_old IS NULL;
  
  IF null_count > 0 THEN
    RAISE EXCEPTION 'Rollback failed: % rows have NULL node_type_old', null_count;
  END IF;
  
  RAISE NOTICE 'Rollback verification passed: All rows restored successfully';
END $$;

-- Step 4: Drop the JSONB column and indexes
DROP INDEX IF EXISTS idx_telemetry_map_nodes_node_type_type;
DROP INDEX IF EXISTS idx_telemetry_map_nodes_node_type_subtype;

ALTER TABLE telemetry_map_nodes 
  DROP COLUMN node_type;

-- Step 5: Rename old column back to node_type
ALTER TABLE telemetry_map_nodes 
  RENAME COLUMN node_type_old TO node_type;

-- Step 6: Add NOT NULL constraint
ALTER TABLE telemetry_map_nodes 
  ALTER COLUMN node_type SET NOT NULL;

-- Step 7: Drop _legacy_type column (optional - keep for safety)
-- ALTER TABLE telemetry_map_nodes DROP COLUMN _legacy_type;

-- Rollback complete
RAISE NOTICE 'Rollback completed successfully. Database restored to VARCHAR nodeType format.';
