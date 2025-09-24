-- MLM Communication System Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends existing user system)
CREATE TABLE IF NOT EXISTS mlm_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mlm_code VARCHAR(20) UNIQUE NOT NULL,
    sponsor_id UUID REFERENCES mlm_users(id),
    upline_id UUID REFERENCES mlm_users(id),
    rank VARCHAR(50) NOT NULL DEFAULT 'associate',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channels table
CREATE TABLE IF NOT EXISTS mlm_communication_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('team', 'direct', 'group', 'announcement')),
    description TEXT,
    created_by UUID NOT NULL REFERENCES mlm_users(id),
    is_private BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    scope VARCHAR(20) NOT NULL DEFAULT 'team',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing scope constraint if it exists and add the correct one
ALTER TABLE mlm_communication_channels DROP CONSTRAINT IF EXISTS mlm_communication_channels_scope_check;
ALTER TABLE mlm_communication_channels ADD CONSTRAINT mlm_communication_channels_scope_check 
CHECK (scope IN ('team', 'direct', 'group', 'announcement'));

-- Channel members table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS mlm_channel_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES mlm_communication_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT FALSE,
    UNIQUE(channel_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS mlm_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES mlm_communication_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES mlm_users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'announcement')),
    parent_message_id UUID REFERENCES mlm_messages(id),
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Message attachments table
CREATE TABLE IF NOT EXISTS mlm_message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES mlm_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions table
CREATE TABLE IF NOT EXISTS mlm_message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES mlm_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Message read receipts table
CREATE TABLE IF NOT EXISTS mlm_message_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES mlm_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Typing indicators table (temporary data)
CREATE TABLE IF NOT EXISTS mlm_typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES mlm_communication_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mlm_users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 seconds'),
    UNIQUE(channel_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mlm_messages_channel_id ON mlm_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_sender_id ON mlm_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_created_at ON mlm_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_parent_id ON mlm_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_message_attachments_message_id ON mlm_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_message_reactions_message_id ON mlm_message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_message_read_receipts_message_id ON mlm_message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_channel_id ON mlm_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_user_id ON mlm_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_typing_indicators_channel_id ON mlm_typing_indicators(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_typing_indicators_expires_at ON mlm_typing_indicators(expires_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_mlm_users_updated_at ON mlm_users;
DROP TRIGGER IF EXISTS update_mlm_communication_channels_updated_at ON mlm_communication_channels;
DROP TRIGGER IF EXISTS update_mlm_messages_updated_at ON mlm_messages;

CREATE TRIGGER update_mlm_users_updated_at BEFORE UPDATE ON mlm_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mlm_communication_channels_updated_at BEFORE UPDATE ON mlm_communication_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mlm_messages_updated_at BEFORE UPDATE ON mlm_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Clean up expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_expired_typing_indicators()
RETURNS void AS $$
BEGIN
    DELETE FROM mlm_typing_indicators WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_channel_messages(UUID, UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_user_channels(UUID);

-- Create a function to get channel messages with pagination
CREATE OR REPLACE FUNCTION get_channel_messages(
    p_channel_id UUID,
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    channel_id UUID,
    sender_id UUID,
    content TEXT,
    message_type VARCHAR(20),
    parent_message_id UUID,
    is_edited BOOLEAN,
    is_deleted BOOLEAN,
    is_pinned BOOLEAN,
    is_flagged BOOLEAN,
    is_starred BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    sender_name VARCHAR(255),
    sender_avatar TEXT,
    sender_rank VARCHAR(50),
    attachments JSONB,
    reactions JSONB,
    read_by_me BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.channel_id,
        m.sender_id,
        m.content,
        m.message_type,
        m.parent_message_id,
        m.is_edited,
        m.is_deleted,
        m.is_pinned,
        m.is_flagged,
        m.is_starred,
        m.created_at,
        m.updated_at,
        COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Test User') as sender_name,
        COALESCE(u.avatar_url, '/avatars/default.jpg') as sender_avatar,
        mu.rank as sender_rank,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', a.id,
                    'name', a.file_name,
                    'size', a.file_size,
                    'type', a.file_type,
                    'url', a.file_url,
                    'thumbnail', a.thumbnail_url
                )
            ) FROM mlm_message_attachments a WHERE a.message_id = m.id),
            '[]'::jsonb
        ) as attachments,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'emoji', r.emoji,
                    'count', COUNT(*),
                    'users', jsonb_agg(DISTINCT r.user_id)
                )
            ) FROM mlm_message_reactions r WHERE r.message_id = m.id GROUP BY r.emoji),
            '[]'::jsonb
        ) as reactions,
        EXISTS(
            SELECT 1 FROM mlm_message_read_receipts rr 
            WHERE rr.message_id = m.id AND rr.user_id = p_user_id
        ) as read_by_me
    FROM mlm_messages m
    LEFT JOIN mlm_users mu ON m.sender_id = mu.id
    LEFT JOIN auth.users u ON mu.user_id = u.id
    WHERE m.channel_id = p_channel_id
        AND m.is_deleted = FALSE
        AND EXISTS (
            SELECT 1 FROM mlm_channel_members cm 
            WHERE cm.channel_id = p_channel_id AND cm.user_id = p_user_id
        )
    ORDER BY m.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get user channels
CREATE OR REPLACE FUNCTION get_user_channels(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    type VARCHAR(20),
    description TEXT,
    is_private BOOLEAN,
    is_archived BOOLEAN,
    is_pinned BOOLEAN,
    scope VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    member_count BIGINT,
    unread_count BIGINT,
    last_message JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.type,
        c.description,
        c.is_private,
        c.is_archived,
        c.is_pinned,
        c.scope,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT cm.user_id) as member_count,
        COUNT(DISTINCT CASE 
            WHEN m.created_at > COALESCE(cm.last_read_at, '1970-01-01'::timestamp) 
            THEN m.id 
        END) as unread_count,
        COALESCE(
            (SELECT jsonb_build_object(
                'id', lm.id,
                'content', lm.content,
                'type', lm.message_type,
                'created_at', lm.created_at,
                'sender_name', COALESCE(u.raw_user_meta_data->>'full_name', u.email, 'Test User')
            )
            FROM mlm_messages lm
            LEFT JOIN mlm_users mu ON lm.sender_id = mu.id
            LEFT JOIN auth.users u ON mu.user_id = u.id
            WHERE lm.channel_id = c.id AND lm.is_deleted = FALSE
            ORDER BY lm.created_at DESC
            LIMIT 1),
            'null'::jsonb
        ) as last_message
    FROM mlm_communication_channels c
    LEFT JOIN mlm_channel_members cm ON c.id = cm.channel_id
    LEFT JOIN mlm_messages m ON c.id = m.channel_id AND m.is_deleted = FALSE
    WHERE EXISTS (
        SELECT 1 FROM mlm_channel_members cm2 
        WHERE cm2.channel_id = c.id AND cm2.user_id = p_user_id
    )
    GROUP BY c.id, c.name, c.type, c.description, c.is_private, c.is_archived, c.is_pinned, c.created_at, c.updated_at
    ORDER BY c.is_pinned DESC, c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert initial data
-- Note: In production, you would create users through Supabase Auth first
-- For development, we'll create the MLM user without the foreign key constraint
-- You can manually create a user in Supabase Auth and update the user_id later

-- Temporarily disable the foreign key constraint for development
ALTER TABLE mlm_users DROP CONSTRAINT IF EXISTS mlm_users_user_id_fkey;

-- Create a test MLM user (without foreign key constraint for now)
INSERT INTO mlm_users (id, user_id, mlm_code, rank, status) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    '550e8400-e29b-41d4-a716-446655440000', 
    'MLM123', 
    'diamond', 
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Re-enable the foreign key constraint
-- ALTER TABLE mlm_users ADD CONSTRAINT mlm_users_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create initial channels
INSERT INTO mlm_communication_channels (id, name, type, description, created_by, is_private, scope) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'General', 'team', 'General team discussions', '550e8400-e29b-41d4-a716-446655440000', false, 'team'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Announcements', 'announcement', 'Important announcements and updates', '550e8400-e29b-41d4-a716-446655440000', false, 'announcement'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Training', 'team', 'Training materials and discussions', '550e8400-e29b-41d4-a716-446655440000', false, 'team')
ON CONFLICT (id) DO NOTHING;

-- Add the test user as a member of all channels
INSERT INTO mlm_channel_members (channel_id, user_id, role) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'admin')
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- Create a welcome message
INSERT INTO mlm_messages (id, channel_id, sender_id, content, message_type) 
VALUES ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Welcome to the MLM Communication System! 🎉', 'system')
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) policies
ALTER TABLE mlm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mlm_communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE mlm_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE mlm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mlm_message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mlm_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mlm_message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mlm_typing_indicators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own MLM profile" ON mlm_users;
DROP POLICY IF EXISTS "Users can update their own MLM profile" ON mlm_users;
DROP POLICY IF EXISTS "Users can view channels they are members of" ON mlm_communication_channels;
DROP POLICY IF EXISTS "Users can view channel members" ON mlm_channel_members;
DROP POLICY IF EXISTS "Users can view messages in channels they are members of" ON mlm_messages;
DROP POLICY IF EXISTS "Users can insert messages in channels they are members of" ON mlm_messages;
DROP POLICY IF EXISTS "Users can view attachments for messages they can see" ON mlm_message_attachments;
DROP POLICY IF EXISTS "Users can view reactions for messages they can see" ON mlm_message_reactions;
DROP POLICY IF EXISTS "Users can add reactions to messages they can see" ON mlm_message_reactions;
DROP POLICY IF EXISTS "Users can view read receipts for messages they can see" ON mlm_message_read_receipts;
DROP POLICY IF EXISTS "Users can add read receipts for messages they can see" ON mlm_message_read_receipts;
DROP POLICY IF EXISTS "Users can view typing indicators in channels they are members of" ON mlm_typing_indicators;
DROP POLICY IF EXISTS "Users can manage their own typing indicators" ON mlm_typing_indicators;

-- Create RLS policies for mlm_users
CREATE POLICY "Users can view their own MLM profile" ON mlm_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own MLM profile" ON mlm_users
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for mlm_communication_channels
CREATE POLICY "Users can view channels they are members of" ON mlm_communication_channels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mlm_channel_members cm 
            WHERE cm.channel_id = id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

-- Create RLS policies for mlm_channel_members
CREATE POLICY "Users can view channel members" ON mlm_channel_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mlm_channel_members cm 
            WHERE cm.channel_id = channel_id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

-- Create RLS policies for mlm_messages
CREATE POLICY "Users can view messages in channels they are members of" ON mlm_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mlm_channel_members cm 
            WHERE cm.channel_id = channel_id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages in channels they are members of" ON mlm_messages
    FOR INSERT WITH CHECK (
        sender_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM mlm_channel_members cm 
            WHERE cm.channel_id = channel_id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

-- Create RLS policies for mlm_message_attachments
CREATE POLICY "Users can view attachments for messages they can see" ON mlm_message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mlm_messages m
            JOIN mlm_channel_members cm ON m.channel_id = cm.channel_id
            WHERE m.id = message_id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

-- Create RLS policies for mlm_message_reactions
CREATE POLICY "Users can view reactions for messages they can see" ON mlm_message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mlm_messages m
            JOIN mlm_channel_members cm ON m.channel_id = cm.channel_id
            WHERE m.id = message_id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can add reactions to messages they can see" ON mlm_message_reactions
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM mlm_messages m
            JOIN mlm_channel_members cm ON m.channel_id = cm.channel_id
            WHERE m.id = message_id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

-- Create RLS policies for mlm_message_read_receipts
CREATE POLICY "Users can view read receipts for messages they can see" ON mlm_message_read_receipts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mlm_messages m
            JOIN mlm_channel_members cm ON m.channel_id = cm.channel_id
            WHERE m.id = message_id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can add read receipts for messages they can see" ON mlm_message_read_receipts
    FOR INSERT WITH CHECK (
        user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM mlm_messages m
            JOIN mlm_channel_members cm ON m.channel_id = cm.channel_id
            WHERE m.id = message_id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

-- Create RLS policies for mlm_typing_indicators
CREATE POLICY "Users can view typing indicators in channels they are members of" ON mlm_typing_indicators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mlm_channel_members cm 
            WHERE cm.channel_id = channel_id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage their own typing indicators" ON mlm_typing_indicators
    FOR ALL USING (
        user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid()) AND
        EXISTS (
            SELECT 1 FROM mlm_channel_members cm 
            WHERE cm.channel_id = channel_id AND cm.user_id = (SELECT id FROM mlm_users WHERE user_id = auth.uid())
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'MLM Communication System database setup completed successfully!' as status;
