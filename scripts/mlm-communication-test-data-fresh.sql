-- MLM Communication & Messaging System - Fresh Test Data
-- This file provides sample data for the fresh schema

-- Insert test users (if they don't exist)
INSERT INTO users (id, email, first_name, last_name, created_at) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'john.doe@example.com', 'John', 'Doe', NOW()),
('22222222-2222-2222-2222-222222222222'::uuid, 'jane.smith@example.com', 'Jane', 'Smith', NOW()),
('33333333-3333-3333-3333-333333333333'::uuid, 'mike.johnson@example.com', 'Mike', 'Johnson', NOW()),
('44444444-4444-4444-4444-444444444444'::uuid, 'sarah.wilson@example.com', 'Sarah', 'Wilson', NOW()),
('55555555-5555-5555-5555-555555555555'::uuid, 'david.brown@example.com', 'David', 'Brown', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test MLM users
INSERT INTO mlm_users (id, user_id, mlm_id, rank, status, personal_volume, team_volume, total_volume, commission_rate, sponsor_id, upline_path) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111', 'MLM001', 'gold', 'active', 1500.00, 8500.00, 10000.00, 20.00, NULL, ''),
('22222222-2222-2222-2222-222222222222'::uuid, '22222222-2222-2222-2222-222222222222', 'MLM002', 'silver', 'active', 800.00, 3200.00, 4000.00, 15.00, '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
('33333333-3333-3333-3333-333333333333'::uuid, '33333333-3333-3333-3333-333333333333', 'MLM003', 'bronze', 'active', 300.00, 1200.00, 1500.00, 10.00, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111,22222222-2222-2222-2222-222222222222'),
('44444444-4444-4444-4444-444444444444'::uuid, '44444444-4444-4444-4444-444444444444', 'MLM004', 'associate', 'active', 100.00, 0.00, 100.00, 5.00, '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111,22222222-2222-2222-2222-222222222222,33333333-3333-3333-3333-333333333333'),
('55555555-5555-5555-5555-555555555555'::uuid, '55555555-5555-5555-5555-555555555555', 'MLM005', 'platinum', 'active', 3000.00, 15000.00, 18000.00, 25.00, NULL, '')
ON CONFLICT (id) DO NOTHING;

-- Insert test teams
INSERT INTO mlm_teams (id, name, description, leader_id, team_code, settings) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Alpha Warriors', 'Top performing team focused on excellence', '11111111-1111-1111-1111-111111111111', 'ALPHA001', '{"theme": "warrior", "motd": "Excellence is our standard"}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Beta Builders', 'Growth-focused team building the future', '55555555-5555-5555-5555-555555555555', 'BETA002', '{"theme": "builder", "motd": "Building success together"}')
ON CONFLICT (id) DO NOTHING;

-- Insert test communication channels
INSERT INTO mlm_communication_channels (id, name, description, type, scope, created_by, team_id, is_private, settings) VALUES
-- Global channels
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'General', 'General discussion for all MLM members', 'custom', 'global', '11111111-1111-1111-1111-111111111111', NULL, false, '{"allow_mentions": true, "allow_reactions": true}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Announcements', 'Important announcements from leadership', 'announcement', 'global', '11111111-1111-1111-1111-111111111111', NULL, false, '{"only_admins_can_post": true, "allow_reactions": true}'),
('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Success Stories', 'Share your wins and achievements', 'achievement', 'global', '11111111-1111-1111-1111-111111111111', NULL, false, '{"auto_celebrate": true, "allow_media": true}'),

-- Team-specific channels
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Alpha Warriors - Strategy', 'Strategic discussions for Alpha Warriors', 'team', 'team', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, '{"team_only": true, "confidential": true}'),
('llllllll-llll-llll-llll-llllllllllll'::uuid, 'Beta Builders - Growth', 'Growth strategies and tactics', 'team', 'team', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, '{"growth_focused": true}')
ON CONFLICT (id) DO NOTHING;

-- Insert channel members
INSERT INTO mlm_channel_members (channel_id, user_id, role, notification_settings) VALUES
-- General channel members
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'member', '{"mentions": true, "all_messages": false, "achievements": true, "announcements": true}'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'member', '{"mentions": true, "all_messages": false, "achievements": true, "announcements": true}'),

-- Announcements channel members
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),

-- Team channels
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('llllllll-llll-llll-llll-llllllllllll', '55555555-5555-5555-5555-555555555555', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}')
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- Insert test messages
INSERT INTO mlm_messages (id, channel_id, sender_id, content, message_type, priority, created_at) VALUES
-- General channel messages
('pppppppp-pppp-pppp-pppp-pppppppppppp'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Welcome everyone to our new communication system! 🎉 This is going to revolutionize how we connect and collaborate.', 'text', 'normal', NOW() - INTERVAL '2 hours'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'This is amazing! I can already see how this will help us stay connected and motivated. 💪', 'text', 'normal', NOW() - INTERVAL '1 hour 30 minutes'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Looking forward to sharing success stories here! 🏆', 'text', 'normal', NOW() - INTERVAL '1 hour'),

-- Announcement messages
('ssssssss-ssss-ssss-ssss-ssssssssssss'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', '📢 IMPORTANT: New commission structure effective next month. Check your dashboard for details.', 'announcement', 'high', NOW() - INTERVAL '3 hours'),
('tttttttt-tttt-tttt-tttt-tttttttttttt'::uuid, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', '🎯 Monthly team challenge starts tomorrow! Top performer gets a bonus. Let''s go!', 'announcement', 'normal', NOW() - INTERVAL '2 hours 30 minutes'),

-- Team channel messages
('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu'::uuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Alpha Warriors strategy meeting tomorrow at 2 PM. Prepare your quarterly reports.', 'text', 'normal', NOW() - INTERVAL '4 hours'),
('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv'::uuid, 'llllllll-llll-llll-llll-llllllllllll', '55555555-5555-5555-5555-555555555555', 'Beta Builders growth session this Friday. New training materials available.', 'text', 'normal', NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert message reactions
INSERT INTO mlm_message_reactions (message_id, user_id, reaction_type) VALUES
('pppppppp-pppp-pppp-pppp-pppppppppppp', '22222222-2222-2222-2222-222222222222', 'like'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', '33333333-3333-3333-3333-333333333333', 'love'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', '44444444-4444-4444-4444-444444444444', 'like'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '11111111-1111-1111-1111-111111111111', 'like'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '33333333-3333-3333-3333-333333333333', 'love'),
('ssssssss-ssss-ssss-ssss-ssssssssssss', '22222222-2222-2222-2222-222222222222', 'wow'),
('ssssssss-ssss-ssss-ssss-ssssssssssss', '33333333-3333-3333-3333-333333333333', 'like'),
('tttttttt-tttt-tttt-tttt-tttttttttttt', '11111111-1111-1111-1111-111111111111', 'love'),
('tttttttt-tttt-tttt-tttt-tttttttttttt', '22222222-2222-2222-2222-222222222222', 'like')
ON CONFLICT (message_id, user_id, reaction_type) DO NOTHING;

-- Insert message reads
INSERT INTO mlm_message_reads (message_id, user_id, read_at) VALUES
('pppppppp-pppp-pppp-pppp-pppppppppppp', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 hours'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 hour 45 minutes'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 hour 15 minutes'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 hour 30 minutes'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 hour 25 minutes'),
('ssssssss-ssss-ssss-ssss-ssssssssssss', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '3 hours'),
('ssssssss-ssss-ssss-ssss-ssssssssssss', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '2 hours 45 minutes'),
('ssssssss-ssss-ssss-ssss-ssssssssssss', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 hours 30 minutes')
ON CONFLICT (message_id, user_id) DO NOTHING;

-- Insert direct messages
INSERT INTO mlm_direct_messages (sender_id, recipient_id, content, message_type, is_read, read_at, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Hey Jane, great work on the presentation today! 👏', 'text', true, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '45 minutes'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Thank you John! Couldn''t have done it without your support. 🙏', 'text', true, NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '40 minutes'),
('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Welcome to the team Sarah! Let me know if you need any help getting started.', 'text', false, NULL, NOW() - INTERVAL '1 hour'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'John, let''s discuss the new strategy for Q4. When are you free?', 'text', true, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '20 minutes')
ON CONFLICT DO NOTHING;

-- Insert communication analytics
INSERT INTO mlm_communication_analytics (channel_id, user_id, metric_type, metric_value, period_start, period_end, metadata) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'message_count', 5.00, NOW() - INTERVAL '7 days', NOW(), '{"engagement_score": 85.5}'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'message_count', 3.00, NOW() - INTERVAL '7 days', NOW(), '{"engagement_score": 72.3}'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'message_count', 2.00, NOW() - INTERVAL '7 days', NOW(), '{"engagement_score": 68.1}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, 'message_count', 2.00, NOW() - INTERVAL '7 days', NOW(), '{"total_views": 15, "engagement_rate": 0.8}'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'message_count', 1.00, NOW() - INTERVAL '7 days', NOW(), '{"team_engagement": 90.0}')
ON CONFLICT DO NOTHING;

-- Insert communication events
INSERT INTO mlm_communication_events (event_type, user_id, channel_id, message_id, metadata, created_at) VALUES
('message_sent', '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'pppppppp-pppp-pppp-pppp-pppppppppppp', '{"word_count": 25, "has_emoji": true}', NOW() - INTERVAL '2 hours'),
('reaction_added', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'pppppppp-pppp-pppp-pppp-pppppppppppp', '{"reaction_type": "like"}', NOW() - INTERVAL '1 hour 45 minutes'),
('user_mentioned', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', '{"mentioned_user": "11111111-1111-1111-1111-111111111111"}', NOW() - INTERVAL '1 hour 30 minutes'),
('channel_joined', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, '{"invited_by": "33333333-3333-3333-3333-333333333333"}', NOW() - INTERVAL '1 hour'),
('message_sent', '55555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'tttttttt-tttt-tttt-tttt-tttttttttttt', '{"word_count": 18, "has_emoji": true, "priority": "normal"}', NOW() - INTERVAL '2 hours 30 minutes')
ON CONFLICT DO NOTHING;

-- Insert message attachments (sample)
INSERT INTO mlm_message_attachments (message_id, file_name, file_type, file_size, file_url, thumbnail_url, metadata) VALUES
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'welcome_guide.pdf', 'application/pdf', 2048576, 'https://storage.example.com/attachments/welcome_guide.pdf', NULL, '{"pages": 15, "version": "1.0"}'),
('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'strategy_presentation.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 5242880, 'https://storage.example.com/attachments/strategy_presentation.pptx', 'https://storage.example.com/thumbnails/strategy_presentation.jpg', '{"slides": 25, "last_modified": "2024-01-15"}')
ON CONFLICT DO NOTHING;

-- Insert communication permissions
INSERT INTO mlm_communication_permissions (user_id, permission_type, resource_type, resource_id, granted_by, expires_at) VALUES
('11111111-1111-1111-1111-111111111111', 'can_send_messages', 'global', NULL, NULL, NULL),
('11111111-1111-1111-1111-111111111111', 'can_create_channels', 'global', NULL, NULL, NULL),
('11111111-1111-1111-1111-111111111111', 'can_manage_team', 'team', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, NULL),
('11111111-1111-1111-1111-111111111111', 'can_send_announcements', 'global', NULL, NULL, NULL),
('55555555-5555-5555-5555-555555555555', 'can_send_messages', 'global', NULL, NULL, NULL),
('55555555-5555-5555-5555-555555555555', 'can_create_channels', 'global', NULL, NULL, NULL),
('55555555-5555-5555-5555-555555555555', 'can_manage_team', 'team', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, NULL),
('55555555-5555-5555-5555-555555555555', 'can_send_announcements', 'global', NULL, NULL, NULL),
('22222222-2222-2222-2222-222222222222', 'can_send_messages', 'global', NULL, '11111111-1111-1111-1111-111111111111', NULL),
('33333333-3333-3333-3333-333333333333', 'can_send_messages', 'global', NULL, '22222222-2222-2222-2222-222222222222', NULL),
('44444444-4444-4444-4444-444444444444', 'can_send_messages', 'global', NULL, '33333333-3333-3333-3333-333333333333', NULL)
ON CONFLICT DO NOTHING;
