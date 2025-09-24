-- Fix database schema for MLM communication system
-- Add missing columns to mlm_users table
ALTER TABLE mlm_users 
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to mlm_messages table  
ALTER TABLE mlm_messages
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Update existing records to have proper timestamps
UPDATE mlm_users 
SET last_seen = NOW() 
WHERE last_seen IS NULL;

-- Verify the schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mlm_users' 
AND column_name IN ('last_seen', 'display_name', 'avatar_url');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mlm_messages' 
AND column_name IN ('attachments', 'content', 'channel_id', 'user_id');
