-- MLM Communication & Messaging System Database Schema
-- Comprehensive schema for superior MLM communications platform
-- Phase 1: Database Schema Enhancement

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. MLM Teams Table (for team-based communication)
CREATE TABLE IF NOT EXISTS mlm_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL REFERENCES mlm_users(id),
    team_code VARCHAR(20) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MLM Communication Channels
CREATE TABLE IF NOT EXISTS mlm_communication_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('team', 'genealogy', 'rank', 'custom', 'announcement', 'training', 'achievement')),
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('global', 'team', 'rank', 'custom', 'genealogy')),
    created_by UUID NOT NULL REFERENCES mlm_users(id),
    team_id UUID REFERENCES mlm_teams(id),
    rank_requirement VARCHAR(50) REFERENCES mlm_ranks(id),
    genealogy_level INTEGER, -- For genealogy-based channels
    is_private BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    member_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MLM Messages
CREATE TABLE IF NOT EXISTS mlm_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES mlm_communication_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES mlm_users(id),
    parent_message_id UUID REFERENCES mlm_messages(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'video', 'audio', 'announcement', 'achievement', 'system', 'poll', 'event')),
    metadata JSONB DEFAULT '{}',
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_pinned BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_count INTEGER DEFAULT 0,
    reaction_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MLM Message Reactions
CREATE TABLE IF NOT EXISTS mlm_message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES mlm_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mlm_users(id),
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- 5. MLM Message Reads
CREATE TABLE IF NOT EXISTS mlm_message_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES mlm_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mlm_users(id),
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- 6. MLM Channel Members
CREATE TABLE IF NOT EXISTS mlm_channel_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES mlm_communication_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES mlm_users(id),
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_settings JSONB DEFAULT '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}',
    is_muted BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    UNIQUE(channel_id, user_id)
);

-- 7. MLM Direct Messages
CREATE TABLE IF NOT EXISTS mlm_direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES mlm_users(id),
    recipient_id UUID NOT NULL REFERENCES mlm_users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'video', 'audio')),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MLM Communication Templates
CREATE TABLE IF NOT EXISTS mlm_communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('welcome', 'achievement', 'training', 'announcement', 'motivation', 'reminder', 'custom')),
    category VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    created_by UUID NOT NULL REFERENCES mlm_users(id),
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. MLM Communication Analytics
CREATE TABLE IF NOT EXISTS mlm_communication_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mlm_users(id),
    channel_id UUID REFERENCES mlm_communication_channels(id),
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('messages_sent', 'messages_read', 'reactions_given', 'reactions_received', 'channels_joined', 'time_spent', 'engagement_score')),
    metric_value DECIMAL(12,2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. MLM Communication Events (for real-time features)
CREATE TABLE IF NOT EXISTS mlm_communication_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mlm_users(id),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('typing', 'online', 'offline', 'message_sent', 'message_read', 'reaction_added', 'channel_joined', 'channel_left')),
    channel_id UUID REFERENCES mlm_communication_channels(id),
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. MLM Message Attachments
CREATE TABLE IF NOT EXISTS mlm_message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES mlm_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. MLM Communication Permissions
CREATE TABLE IF NOT EXISTS mlm_communication_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES mlm_users(id),
    permission_type VARCHAR(50) NOT NULL CHECK (permission_type IN ('create_channels', 'manage_channels', 'send_announcements', 'moderate_content', 'view_analytics', 'export_data')),
    is_granted BOOLEAN DEFAULT false,
    granted_by UUID REFERENCES mlm_users(id),
    granted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_mlm_teams_leader_id ON mlm_teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_mlm_teams_team_code ON mlm_teams(team_code);
CREATE INDEX IF NOT EXISTS idx_mlm_teams_is_active ON mlm_teams(is_active);

CREATE INDEX IF NOT EXISTS idx_mlm_channels_type ON mlm_communication_channels(type);
CREATE INDEX IF NOT EXISTS idx_mlm_channels_scope ON mlm_communication_channels(scope);
CREATE INDEX IF NOT EXISTS idx_mlm_channels_team_id ON mlm_communication_channels(team_id);
CREATE INDEX IF NOT EXISTS idx_mlm_channels_rank_requirement ON mlm_communication_channels(rank_requirement);
CREATE INDEX IF NOT EXISTS idx_mlm_channels_created_by ON mlm_communication_channels(created_by);
CREATE INDEX IF NOT EXISTS idx_mlm_channels_is_archived ON mlm_communication_channels(is_archived);
CREATE INDEX IF NOT EXISTS idx_mlm_channels_last_message_at ON mlm_communication_channels(last_message_at);

CREATE INDEX IF NOT EXISTS idx_mlm_messages_channel_id ON mlm_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_sender_id ON mlm_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_parent_message_id ON mlm_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_message_type ON mlm_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_created_at ON mlm_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_is_deleted ON mlm_messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_is_pinned ON mlm_messages(is_pinned);

CREATE INDEX IF NOT EXISTS idx_mlm_message_reactions_message_id ON mlm_message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_message_reactions_user_id ON mlm_message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_message_reactions_emoji ON mlm_message_reactions(emoji);

CREATE INDEX IF NOT EXISTS idx_mlm_message_reads_message_id ON mlm_message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_message_reads_user_id ON mlm_message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_message_reads_read_at ON mlm_message_reads(read_at);

CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_channel_id ON mlm_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_user_id ON mlm_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_role ON mlm_channel_members(role);
CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_is_muted ON mlm_channel_members(is_muted);

CREATE INDEX IF NOT EXISTS idx_mlm_direct_messages_sender_id ON mlm_direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mlm_direct_messages_recipient_id ON mlm_direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_mlm_direct_messages_created_at ON mlm_direct_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_mlm_direct_messages_is_read ON mlm_direct_messages(is_read);

CREATE INDEX IF NOT EXISTS idx_mlm_templates_type ON mlm_communication_templates(type);
CREATE INDEX IF NOT EXISTS idx_mlm_templates_category ON mlm_communication_templates(category);
CREATE INDEX IF NOT EXISTS idx_mlm_templates_created_by ON mlm_communication_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_mlm_templates_is_public ON mlm_communication_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_mlm_templates_is_active ON mlm_communication_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_mlm_analytics_user_id ON mlm_communication_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_analytics_channel_id ON mlm_communication_analytics(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_analytics_metric_type ON mlm_communication_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_mlm_analytics_recorded_at ON mlm_communication_analytics(recorded_at);

CREATE INDEX IF NOT EXISTS idx_mlm_events_user_id ON mlm_communication_events(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_events_event_type ON mlm_communication_events(event_type);
CREATE INDEX IF NOT EXISTS idx_mlm_events_channel_id ON mlm_communication_events(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_events_expires_at ON mlm_communication_events(expires_at);

CREATE INDEX IF NOT EXISTS idx_mlm_attachments_message_id ON mlm_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_attachments_file_type ON mlm_message_attachments(file_type);

CREATE INDEX IF NOT EXISTS idx_mlm_permissions_user_id ON mlm_communication_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_permissions_permission_type ON mlm_communication_permissions(permission_type);
CREATE INDEX IF NOT EXISTS idx_mlm_permissions_is_granted ON mlm_communication_permissions(is_granted);

-- Triggers for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mlm_teams_updated_at BEFORE UPDATE ON mlm_teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_channels_updated_at BEFORE UPDATE ON mlm_communication_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mlm_templates_updated_at BEFORE UPDATE ON mlm_communication_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for Message Counts
CREATE OR REPLACE FUNCTION update_message_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update channel member count
        UPDATE mlm_communication_channels 
        SET member_count = (
            SELECT COUNT(*) FROM mlm_channel_members 
            WHERE channel_id = NEW.channel_id AND is_archived = false
        ),
        last_message_at = NEW.created_at
        WHERE id = NEW.channel_id;
        
        -- Update message counts
        UPDATE mlm_messages 
        SET read_count = (
            SELECT COUNT(*) FROM mlm_message_reads 
            WHERE message_id = NEW.id
        ),
        reaction_count = (
            SELECT COUNT(*) FROM mlm_message_reactions 
            WHERE message_id = NEW.id
        ),
        reply_count = (
            SELECT COUNT(*) FROM mlm_messages 
            WHERE parent_message_id = NEW.id AND is_deleted = false
        )
        WHERE id = NEW.id;
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update message counts if message is edited
        IF OLD.content != NEW.content THEN
            UPDATE mlm_messages 
            SET is_edited = true, edited_at = NOW()
            WHERE id = NEW.id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update channel member count
        UPDATE mlm_communication_channels 
        SET member_count = (
            SELECT COUNT(*) FROM mlm_channel_members 
            WHERE channel_id = OLD.channel_id AND is_archived = false
        )
        WHERE id = OLD.channel_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_message_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON mlm_messages
    FOR EACH ROW EXECUTE FUNCTION update_message_counts();

-- Triggers for Reaction Counts
CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE mlm_messages 
        SET reaction_count = reaction_count + 1
        WHERE id = NEW.message_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE mlm_messages 
        SET reaction_count = GREATEST(reaction_count - 1, 0)
        WHERE id = OLD.message_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reaction_counts_trigger
    AFTER INSERT OR DELETE ON mlm_message_reactions
    FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();

-- Triggers for Read Counts
CREATE OR REPLACE FUNCTION update_read_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE mlm_messages 
        SET read_count = read_count + 1
        WHERE id = NEW.message_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE mlm_messages 
        SET read_count = GREATEST(read_count - 1, 0)
        WHERE id = OLD.message_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_read_counts_trigger
    AFTER INSERT OR DELETE ON mlm_message_reads
    FOR EACH ROW EXECUTE FUNCTION update_read_counts();

-- Views for Common Queries
CREATE VIEW mlm_channel_summary AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.type,
    c.scope,
    c.member_count,
    c.last_message_at,
    c.created_at,
    u.mlm_code as created_by_code,
    u.rank_id as created_by_rank,
    t.name as team_name
FROM mlm_communication_channels c
LEFT JOIN mlm_users u ON c.created_by = u.id
LEFT JOIN mlm_teams t ON c.team_id = t.id
WHERE c.is_archived = false;

CREATE VIEW mlm_message_summary AS
SELECT 
    m.id,
    m.channel_id,
    m.sender_id,
    m.content,
    m.message_type,
    m.is_pinned,
    m.priority,
    m.read_count,
    m.reaction_count,
    m.reply_count,
    m.created_at,
    u.mlm_code as sender_code,
    u.rank_id as sender_rank,
    c.name as channel_name
FROM mlm_messages m
LEFT JOIN mlm_users u ON m.sender_id = u.id
LEFT JOIN mlm_communication_channels c ON m.channel_id = c.id
WHERE m.is_deleted = false;

CREATE VIEW mlm_user_communication_stats AS
SELECT 
    u.id as user_id,
    u.mlm_code,
    u.rank_id,
    COUNT(DISTINCT cm.channel_id) as channels_joined,
    COUNT(DISTINCT m.id) as messages_sent,
    COUNT(DISTINCT mr.id) as reactions_given,
    COUNT(DISTINCT mread.id) as messages_read,
    MAX(m.created_at) as last_message_sent,
    MAX(mread.read_at) as last_message_read
FROM mlm_users u
LEFT JOIN mlm_channel_members cm ON u.id = cm.user_id AND cm.is_archived = false
LEFT JOIN mlm_messages m ON u.id = m.sender_id AND m.is_deleted = false
LEFT JOIN mlm_message_reactions mr ON u.id = mr.user_id
LEFT JOIN mlm_message_reads mread ON u.id = mread.user_id
GROUP BY u.id, u.mlm_code, u.rank_id;

-- Insert Default Communication Templates
INSERT INTO mlm_communication_templates (name, type, category, content, variables, created_by, is_public) VALUES
('Welcome New Team Member', 'welcome', 'onboarding', 'Welcome to the team, {{member_name}}! 🎉 We''re excited to have you join our {{team_name}} family. Your sponsor {{sponsor_name}} will be your guide as you start your journey.', '["member_name", "team_name", "sponsor_name"]', (SELECT id FROM mlm_users LIMIT 1), true),

('Achievement Celebration', 'achievement', 'recognition', '🎊 Congratulations {{member_name}}! You''ve just achieved {{achievement_name}}! This is a huge milestone and we''re all proud of your dedication and hard work. Keep up the amazing work!', '["member_name", "achievement_name"]', (SELECT id FROM mlm_users LIMIT 1), true),

('Training Reminder', 'reminder', 'education', '📚 Don''t forget! You have a training session scheduled for {{training_name}} on {{date}} at {{time}}. This is an important step in your development journey.', '["training_name", "date", "time"]', (SELECT id FROM mlm_users LIMIT 1), true),

('Monthly Goal Update', 'motivation', 'goals', '💪 We''re halfway through the month! How are you progressing toward your {{goal_type}} goal? Remember, every step forward counts. You''ve got this!', '["goal_type"]', (SELECT id FROM mlm_users LIMIT 1), true),

('Team Announcement', 'announcement', 'general', '📢 Important Update: {{announcement_title}}\n\n{{announcement_content}}\n\nPlease review and let us know if you have any questions.', '["announcement_title", "announcement_content"]', (SELECT id FROM mlm_users LIMIT 1), true);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
