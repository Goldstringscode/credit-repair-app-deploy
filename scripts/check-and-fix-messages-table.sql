-- Check and fix mlm_messages table structure
-- This script ensures the mlm_messages table has all required columns

-- Add missing columns if they don't exist
ALTER TABLE mlm_messages ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE mlm_messages ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'mlm_messages' 
ORDER BY ordinal_position;
