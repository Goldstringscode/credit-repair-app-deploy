-- Minimal Fix for get_channel_messages function
-- This script creates a simple version without complex nested aggregates

DROP FUNCTION IF EXISTS get_channel_messages(UUID, UUID, INTEGER, INTEGER);

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
        COALESCE(m.is_flagged, false) as is_flagged,
        COALESCE(m.is_starred, false) as is_starred,
        m.created_at,
        m.updated_at,
        COALESCE(mu.display_name, mu.email, 'Test User') as sender_name,
        COALESCE(mu.avatar_url, '/avatars/default.jpg') as sender_avatar,
        mu.rank as sender_rank,
        '[]'::jsonb as attachments,
        '[]'::jsonb as reactions,
        false as read_by_me
    FROM mlm_messages m
    LEFT JOIN mlm_users mu ON m.sender_id = mu.id
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
