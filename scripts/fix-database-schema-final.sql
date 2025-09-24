-- Fix database schema for MLM communication system
-- This script addresses all the missing columns and schema issues

-- First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'mlm_%';

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

-- Test inserting a sample message
INSERT INTO mlm_messages (
  channel_id, 
  sender_id, 
  content, 
  message_type, 
  is_edited, 
  is_deleted, 
  is_pinned, 
  is_flagged, 
  is_starred
) VALUES (
  'test-channel-1',
  '550e8400-e29b-41d4-a716-446655440000',
  'Test message from database',
  'text',
  false,
  false,
  false,
  false,
  false
) ON CONFLICT DO NOTHING;

-- Verify the message was inserted
SELECT * FROM mlm_messages WHERE content = 'Test message from database';