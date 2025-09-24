-- MLM Communication System Test Data - FINAL VERSION
-- This version uses proper UUIDs and minimal test data

-- First, create a system user for templates
INSERT INTO users (id, email, password_hash, first_name, last_name, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000000'::uuid, 'system@mlm.com', 'system_hash', 'System', 'User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create additional test users
INSERT INTO users (id, email, password_hash, first_name, last_name, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'user1@mlm.com', 'hash1', 'John', 'Doe', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222'::uuid, 'user2@mlm.com', 'hash2', 'Jane', 'Smith', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333'::uuid, 'user3@mlm.com', 'hash3', 'Bob', 'Johnson', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create the system MLM user
INSERT INTO mlm_users (id, user_id, mlm_code, rank_id, status, personal_volume, team_volume, total_earnings, current_month_earnings, active_downlines, total_downlines) 
VALUES 
('00000000-0000-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000000', 'SYSTEM', 'associate', 'active', 0.00, 0.00, 0.00, 0.00, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert test MLM users
INSERT INTO mlm_users (id, user_id, mlm_code, rank_id, status, personal_volume, team_volume, total_earnings, current_month_earnings, active_downlines, total_downlines) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111', 'MLM001', 'manager', 'active', 1500.00, 8500.00, 12500.00, 2500.00, 8, 15),
('22222222-2222-2222-2222-222222222222'::uuid, '22222222-2222-2222-2222-222222222222', 'MLM002', 'consultant', 'active', 800.00, 3200.00, 6800.00, 1200.00, 3, 7),
('33333333-3333-3333-3333-333333333333'::uuid, '33333333-3333-3333-3333-333333333333', 'MLM003', 'director', 'active', 2800.00, 18000.00, 25000.00, 4200.00, 12, 25)
ON CONFLICT (id) DO NOTHING;

-- Insert test MLM teams
INSERT INTO mlm_teams (id, name, description, leader_id, team_code, settings) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Alpha Warriors', 'Top performing team focused on excellence', '11111111-1111-1111-1111-111111111111', 'ALPHA001', '{"theme": "warrior", "motd": "Excellence is our standard"}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Beta Builders', 'Growth-focused team building the future', '22222222-2222-2222-2222-222222222222', 'BETA002', '{"theme": "builder", "motd": "Building success together"}')
ON CONFLICT (id) DO NOTHING;

-- Insert test communication channels
INSERT INTO mlm_communication_channels (id, name, description, type, scope, created_by, team_id, is_private, settings) VALUES
-- Global channels
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'General', 'General discussion for all MLM members', 'custom', 'global', '11111111-1111-1111-1111-111111111111', NULL, false, '{"allow_mentions": true, "allow_reactions": true}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Announcements', 'Important announcements from leadership', 'announcement', 'global', '11111111-1111-1111-1111-111111111111', NULL, false, '{"only_admins_can_post": true, "allow_reactions": true}'),
('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Success Stories', 'Share your wins and achievements', 'achievement', 'global', '11111111-1111-1111-1111-111111111111', NULL, false, '{"auto_celebrate": true, "allow_media": true}'),

-- Team-specific channels
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Alpha Warriors - Strategy', 'Strategic discussions for Alpha Warriors', 'team', 'team', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, '{"team_only": true, "confidential": true}'),
('llllllll-llll-llll-llll-llllllllllll'::uuid, 'Beta Builders - Growth', 'Growth strategies and tactics', 'team', 'team', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, '{"growth_focused": true}')
ON CONFLICT (id) DO NOTHING;

-- Insert channel members
INSERT INTO mlm_channel_members (channel_id, user_id, role, notification_settings) VALUES
-- General channel members
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'member', '{"mentions": true, "all_messages": false, "achievements": true, "announcements": true}'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'member', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),

-- Announcements channel members
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),

-- Team channels
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('llllllll-llll-llll-llll-llllllllllll', '22222222-2222-2222-2222-222222222222', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}')
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- Insert test messages
INSERT INTO mlm_messages (id, channel_id, sender_id, content, message_type, priority, created_at) VALUES
-- General channel messages
('pppppppp-pppp-pppp-pppp-pppppppppppp'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Welcome everyone to our new communication system! 🎉 This is going to revolutionize how we connect and collaborate.', 'text', 'normal', NOW() - INTERVAL '2 hours'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'This is amazing! I can already see how this will help us stay connected and motivated. 💪', 'text', 'normal', NOW() - INTERVAL '1 hour 45 minutes'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'The real-time features are incredible. No more missing important updates! ⚡', 'text', 'normal', NOW() - INTERVAL '1 hour 30 minutes'),

-- Announcement messages
('ssssssss-ssss-ssss-ssss-ssssssssssss'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', '🚨 IMPORTANT: New commission structure effective next month. Please review the updated compensation plan in your dashboard.', 'announcement', 'urgent', NOW() - INTERVAL '3 hours'),

-- Success story messages
('tttttttt-tttt-tttt-tttt-tttttttttttt'::uuid, 'ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', '🎊 Just hit my first $10K month! Thanks to everyone who supported me along the way.', 'achievement', 'normal', NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert message reactions
INSERT INTO mlm_message_reactions (message_id, user_id, emoji) VALUES
('pppppppp-pppp-pppp-pppp-pppppppppppp', '22222222-2222-2222-2222-222222222222', '🎉'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', '33333333-3333-3333-3333-333333333333', '🎉'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '11111111-1111-1111-1111-111111111111', '💪'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '33333333-3333-3333-3333-333333333333', '💪'),
('tttttttt-tttt-tttt-tttt-tttttttttttt', '11111111-1111-1111-1111-111111111111', '🎊'),
('tttttttt-tttt-tttt-tttt-tttttttttttt', '33333333-3333-3333-3333-333333333333', '🎊')
ON CONFLICT (message_id, user_id, emoji) DO NOTHING;

-- Insert message reads
INSERT INTO mlm_message_reads (message_id, user_id, read_at) VALUES
-- User 1 has read all messages
('pppppppp-pppp-pppp-pppp-pppppppppppp', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 hours'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 hour 45 minutes'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 hour 30 minutes'),
('ssssssss-ssss-ssss-ssss-ssssssssssss', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '3 hours'),
('tttttttt-tttt-tttt-tttt-tttttttttttt', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '4 hours'),

-- User 2 has read most messages
('pppppppp-pppp-pppp-pppp-pppppppppppp', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 hour 50 minutes'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 hour 45 minutes'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 hour 30 minutes'),
('ssssssss-ssss-ssss-ssss-ssssssssssss', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 hours'),
('tttttttt-tttt-tttt-tttt-tttttttttttt', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '4 hours'),

-- User 3 has read some messages
('pppppppp-pppp-pppp-pppp-pppppppppppp', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 hour 30 minutes'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 hour 30 minutes'),
('ssssssss-ssss-ssss-ssss-ssssssssssss', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '3 hours'),
('tttttttt-tttt-tttt-tttt-tttttttttttt', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '4 hours')
ON CONFLICT (message_id, user_id) DO NOTHING;

-- Insert direct messages
INSERT INTO mlm_direct_messages (sender_id, recipient_id, content, message_type, is_read, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Hey! How are things going with your new recruits?', 'text', true, NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Great! They''re really engaged with the new training materials. Thanks for the resources!', 'text', true, NOW() - INTERVAL '23 hours'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Can we schedule a team call for this week?', 'text', false, NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert communication analytics
INSERT INTO mlm_communication_analytics (user_id, channel_id, metric_type, metric_value, recorded_at) VALUES
('11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'messages_sent', 5, NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'messages_sent', 3, NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'messages_sent', 4, NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'messages_sent', 2, NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'messages_sent', 3, NOW() - INTERVAL '1 day'),

-- Engagement scores
('11111111-1111-1111-1111-111111111111', NULL, 'engagement_score', 95.5, NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', NULL, 'engagement_score', 87.2, NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333333', NULL, 'engagement_score', 78.9, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Insert communication events (for real-time features)
INSERT INTO mlm_communication_events (user_id, event_type, channel_id, metadata, expires_at) VALUES
('11111111-1111-1111-1111-111111111111', 'online', NULL, '{"last_seen": "2024-01-15T10:30:00Z"}', NOW() + INTERVAL '1 hour'),
('22222222-2222-2222-2222-222222222222', 'online', NULL, '{"last_seen": "2024-01-15T10:25:00Z"}', NOW() + INTERVAL '1 hour'),
('33333333-3333-3333-3333-333333333333', 'online', NULL, '{"last_seen": "2024-01-15T10:20:00Z"}', NOW() + INTERVAL '1 hour'),
('11111111-1111-1111-1111-111111111111', 'typing', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '{"typing_since": "2024-01-15T10:30:00Z"}', NOW() + INTERVAL '30 seconds')
ON CONFLICT (id) DO NOTHING;

-- Insert communication permissions
INSERT INTO mlm_communication_permissions (user_id, permission_type, is_granted, granted_by, granted_at) VALUES
('11111111-1111-1111-1111-111111111111', 'create_channels', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 days'),
('11111111-1111-1111-1111-111111111111', 'manage_channels', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 days'),
('11111111-1111-1111-1111-111111111111', 'send_announcements', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 days'),
('11111111-1111-1111-1111-111111111111', 'moderate_content', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 days'),
('11111111-1111-1111-1111-111111111111', 'view_analytics', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 days'),
('22222222-2222-2222-2222-222222222222', 'create_channels', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '25 days'),
('22222222-2222-2222-2222-222222222222', 'send_announcements', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '25 days'),
('22222222-2222-2222-2222-222222222222', 'view_analytics', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '25 days'),
('33333333-3333-3333-3333-333333333333', 'create_channels', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '20 days'),
('33333333-3333-3333-3333-333333333333', 'view_analytics', true, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- Update channel member counts and last message times
UPDATE mlm_communication_channels SET 
    member_count = (
        SELECT COUNT(*) FROM mlm_channel_members 
        WHERE channel_id = mlm_communication_channels.id AND is_archived = false
    ),
    last_message_at = (
        SELECT MAX(created_at) FROM mlm_messages 
        WHERE channel_id = mlm_communication_channels.id AND is_deleted = false
    );

-- Update message counts
UPDATE mlm_messages SET 
    read_count = (
        SELECT COUNT(*) FROM mlm_message_reads 
        WHERE message_id = mlm_messages.id
    ),
    reaction_count = (
        SELECT COUNT(*) FROM mlm_message_reactions 
        WHERE message_id = mlm_messages.id
    ),
    reply_count = (
        SELECT COUNT(*) FROM mlm_messages m2 
        WHERE m2.parent_message_id = mlm_messages.id AND m2.is_deleted = false
    );

COMMIT;
