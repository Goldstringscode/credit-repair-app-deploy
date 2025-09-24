-- Simple Fix for Supabase Functions
-- This script only fixes the column reference issue without changing function signatures

-- The problem is that the functions reference u.first_name and u.last_name
-- which don't exist in Supabase's auth.users table.
-- We'll update the existing functions to use the correct column references.

-- Fix 1: Update the get_channel_messages function to use correct column references
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
    sender_name TEXT,
    sender_avatar TEXT,
    sender_rank VARCHAR(20),
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

-- Fix 2: Update the get_user_channels function to use correct column references
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
    GROUP BY c.id, c.name, c.type, c.description, c.is_private, c.is_archived, c.is_pinned, c.scope, c.created_at, c.updated_at
    ORDER BY c.is_pinned DESC, c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;
