-- MLM COMMUNICATION SYSTEM SCHEMA
-- Run in Supabase SQL Editor. Safe to run multiple times.
-- Note: Uses mlm_ prefix to avoid conflicts with existing direct_messages table.

-- Core channels table
CREATE TABLE IF NOT EXISTS mlm_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  channel_type VARCHAR(20) DEFAULT 'global'
    CHECK (channel_type IN ('global','team','rank','genealogy','direct')),
  created_by UUID,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS mlm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES mlm_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text'
    CHECK (message_type IN ('text','file','system','achievement')),
  attachment_url TEXT,
  attachment_name TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel members (tracks who is in which channel and their read position)
CREATE TABLE IF NOT EXISTS mlm_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES mlm_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- MLM-specific direct messages (separate from existing direct_messages table)
CREATE TABLE IF NOT EXISTS mlm_direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mlm_messages_channel
  ON mlm_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_sender
  ON mlm_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_user
  ON mlm_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_direct_messages_to
  ON mlm_direct_messages(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mlm_direct_messages_from
  ON mlm_direct_messages(from_user_id, created_at DESC);

-- Seed 5 default channels (skip if already exist)
INSERT INTO mlm_channels (name, description, channel_type) VALUES
  ('general',       'General discussion for all members',     'global'),
  ('announcements', 'Important announcements from leadership','global'),
  ('training',      'Training resources and tips',            'global'),
  ('wins',          'Share your wins and successes!',         'global'),
  ('support',       'Get help from the community',            'global')
ON CONFLICT DO NOTHING;

-- Enable Supabase Realtime on message tables
ALTER TABLE mlm_messages REPLICA IDENTITY FULL;
ALTER TABLE mlm_direct_messages REPLICA IDENTITY FULL;

-- Unread count helper function
CREATE OR REPLACE FUNCTION get_channel_unread_count(p_channel_id UUID, p_user_id UUID)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM mlm_messages m
  WHERE m.channel_id = p_channel_id
    AND m.is_deleted = FALSE
    AND m.sender_id != p_user_id
    AND m.created_at > COALESCE(
      (SELECT last_read_at FROM mlm_channel_members
       WHERE channel_id = p_channel_id AND user_id = p_user_id),
      '1970-01-01'::TIMESTAMPTZ
    );
  RETURN COALESCE(cnt, 0);
END;
$$;