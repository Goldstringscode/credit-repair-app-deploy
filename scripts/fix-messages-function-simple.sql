-- Fix get_channel_messages function - Simple version
-- This script fixes the nested aggregate function issue

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
                    'count', r_count.count,
                    'users', r_users.users
                )
            ) FROM (
                SELECT 
                    r.emoji,
                    COUNT(*) as count,
                    jsonb_agg(DISTINCT r.user_id) as users
                FROM mlm_message_reactions r 
                WHERE r.message_id = m.id 
                GROUP BY r.emoji
            ) r_count
            CROSS JOIN LATERAL (
                SELECT jsonb_agg(DISTINCT r2.user_id) as users
                FROM mlm_message_reactions r2 
                WHERE r2.message_id = m.id AND r2.emoji = r_count.emoji
            ) r_users),
            '[]'::jsonb
        ) as reactions,
        EXISTS(
            SELECT 1 FROM mlm_message_read_receipts rr 
            WHERE rr.message_id = m.id AND rr.user_id = p_user_id
        ) as read_by_me
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
