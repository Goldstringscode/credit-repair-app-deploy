-- Final Fix for get_channel_messages function
-- This script fixes the column type mismatch issue

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
        m.id::UUID,
        m.channel_id::UUID,
        m.sender_id::UUID,
        m.content::TEXT,
        m.message_type::VARCHAR(20),
        m.parent_message_id::UUID,
        COALESCE(m.is_edited, false)::BOOLEAN,
        COALESCE(m.is_deleted, false)::BOOLEAN,
        COALESCE(m.is_pinned, false)::BOOLEAN,
        COALESCE(m.is_flagged, false)::BOOLEAN,
        COALESCE(m.is_starred, false)::BOOLEAN,
        m.created_at::TIMESTAMP WITH TIME ZONE,
        m.updated_at::TIMESTAMP WITH TIME ZONE,
        COALESCE(mu.display_name, mu.email, 'Test User')::TEXT as sender_name,
        COALESCE(mu.avatar_url, '/avatars/default.jpg')::TEXT as sender_avatar,
        COALESCE(mu.rank, 'member')::VARCHAR(20) as sender_rank,
        '[]'::JSONB as attachments,
        '[]'::JSONB as reactions,
        false::BOOLEAN as read_by_me
    FROM mlm_messages m
    LEFT JOIN mlm_users mu ON m.sender_id = mu.id
    WHERE m.channel_id = p_channel_id
        AND COALESCE(m.is_deleted, false) = false
        AND EXISTS (
            SELECT 1 FROM mlm_channel_members cm 
            WHERE cm.channel_id = p_channel_id AND cm.user_id = p_user_id
        )
    ORDER BY m.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
