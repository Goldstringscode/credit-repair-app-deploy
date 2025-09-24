-- MLM Communication Database Setup
-- Run this script to set up the MLM communication tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create MLM channels table
CREATE TABLE IF NOT EXISTS mlm_channels (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('team', 'direct', 'group')),
    description TEXT,
    member_count INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create MLM messages table
CREATE TABLE IF NOT EXISTS mlm_messages (
    id VARCHAR(255) PRIMARY KEY,
    channel_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'image', 'file', 'system')),
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('text', 'image', 'file', 'system')),
    sender_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_avatar VARCHAR(500),
    sender_rank VARCHAR(100),
    sender_status VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    read_by TEXT[] DEFAULT '{}',
    FOREIGN KEY (channel_id) REFERENCES mlm_channels(id) ON DELETE CASCADE
);

-- Create MLM message attachments table (for voice messages)
CREATE TABLE IF NOT EXISTS mlm_message_attachments (
    id VARCHAR(255) PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    size INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES mlm_messages(id) ON DELETE CASCADE
);

-- Create MLM message reactions table
CREATE TABLE IF NOT EXISTS mlm_message_reactions (
    id VARCHAR(255) PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES mlm_messages(id) ON DELETE CASCADE
);

-- Create MLM channel members table
CREATE TABLE IF NOT EXISTS mlm_channel_members (
    id VARCHAR(255) PRIMARY KEY,
    channel_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE,
    is_moderator BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (channel_id) REFERENCES mlm_channels(id) ON DELETE CASCADE,
    UNIQUE(channel_id, user_id)
);

-- Insert some default channels for testing
INSERT INTO mlm_channels (id, name, type, description, member_count, unread_count, is_private, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'general', 'team', 'General team discussions', 8, 0, FALSE, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', 'announcements', 'team', 'Important announcements', 8, 0, FALSE, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', 'training', 'team', 'Training and development', 8, 0, FALSE, '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

-- Insert some default channel members
INSERT INTO mlm_channel_members (id, channel_id, user_id, is_admin) VALUES
('member-001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', TRUE),
('member-002', '550e8400-e29b-41d4-a716-446655440001', 'mlm-user-456', FALSE),
('member-003', '550e8400-e29b-41d4-a716-446655440001', 'mlm-user-789', FALSE),
('member-004', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', TRUE),
('member-005', '550e8400-e29b-41d4-a716-446655440002', 'mlm-user-456', FALSE),
('member-006', '550e8400-e29b-41d4-a716-446655440002', 'mlm-user-789', FALSE),
('member-007', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', TRUE),
('member-008', '550e8400-e29b-41d4-a716-446655440003', 'mlm-user-456', FALSE),
('member-009', '550e8400-e29b-41d4-a716-446655440003', 'mlm-user-789', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insert some sample messages
INSERT INTO mlm_messages (id, channel_id, content, type, message_type, sender_id, sender_name, sender_email, sender_avatar, sender_rank, sender_status) VALUES
('msg-001', '550e8400-e29b-41d4-a716-446655440001', 'Welcome to the MLM communication system!', 'text', 'text', '550e8400-e29b-41d4-a716-446655440000', 'John Smith', 'john@example.com', '/avatars/john.jpg', 'Diamond', 'online'),
('msg-002', '550e8400-e29b-41d4-a716-446655440001', 'This is a great platform for team communication!', 'text', 'text', 'mlm-user-456', 'Sarah Johnson', 'sarah@example.com', '/avatars/sarah.jpg', 'Gold', 'online'),
('msg-003', '550e8400-e29b-41d4-a716-446655440002', 'New commission structure announced!', 'text', 'text', '550e8400-e29b-41d4-a716-446655440000', 'John Smith', 'john@example.com', '/avatars/john.jpg', 'Diamond', 'online')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mlm_messages_channel_id ON mlm_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_timestamp ON mlm_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_mlm_messages_sender_id ON mlm_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_user_id ON mlm_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_channel_members_channel_id ON mlm_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_mlm_message_attachments_message_id ON mlm_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_mlm_message_reactions_message_id ON mlm_message_reactions(message_id);

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON mlm_channels TO your_app_user;
-- GRANT ALL PRIVILEGES ON mlm_messages TO your_app_user;
-- GRANT ALL PRIVILEGES ON mlm_message_attachments TO your_app_user;
-- GRANT ALL PRIVILEGES ON mlm_message_reactions TO your_app_user;
-- GRANT ALL PRIVILEGES ON mlm_channel_members TO your_app_user;
