-- MLM Communication System Test Data - STANDALONE VERSION
-- This version creates all necessary users and data without dependencies

-- First, create a system user for templates
INSERT INTO users (id, email, password_hash, first_name, last_name, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000000'::uuid, 'system@mlm.com', 'system_hash', 'System', 'User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create additional test users
INSERT INTO users (id, email, password_hash, first_name, last_name, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'user1@mlm.com', 'hash1', 'John', 'Doe', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222'::uuid, 'user2@mlm.com', 'hash2', 'Jane', 'Smith', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333'::uuid, 'user3@mlm.com', 'hash3', 'Bob', 'Johnson', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444'::uuid, 'user4@mlm.com', 'hash4', 'Alice', 'Brown', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555'::uuid, 'user5@mlm.com', 'hash5', 'Charlie', 'Wilson', NOW(), NOW()),
('66666666-6666-6666-6666-666666666666'::uuid, 'user6@mlm.com', 'hash6', 'Diana', 'Davis', NOW(), NOW()),
('77777777-7777-7777-7777-777777777777'::uuid, 'user7@mlm.com', 'hash7', 'Eve', 'Miller', NOW(), NOW())
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
('33333333-3333-3333-3333-333333333333'::uuid, '33333333-3333-3333-3333-333333333333', 'MLM003', 'director', 'active', 2800.00, 18000.00, 25000.00, 4200.00, 12, 25),
('44444444-4444-4444-4444-444444444444'::uuid, '44444444-4444-4444-4444-444444444444', 'MLM004', 'associate', 'active', 200.00, 200.00, 800.00, 300.00, 0, 1),
('55555555-5555-5555-5555-555555555555'::uuid, '55555555-5555-5555-5555-555555555555', 'MLM005', 'consultant', 'active', 750.00, 2800.00, 5200.00, 950.00, 2, 5),
('66666666-6666-6666-6666-666666666666'::uuid, '66666666-6666-6666-6666-666666666666', 'MLM006', 'associate', 'active', 150.00, 150.00, 450.00, 200.00, 0, 0),
('77777777-7777-7777-7777-777777777777'::uuid, '77777777-7777-7777-7777-777777777777', 'MLM007', 'manager', 'active', 1200.00, 6500.00, 9800.00, 1800.00, 6, 12)
ON CONFLICT (id) DO NOTHING;

-- Insert test MLM teams
INSERT INTO mlm_teams (id, name, description, leader_id, team_code, settings) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Alpha Warriors', 'Top performing team focused on excellence', '11111111-1111-1111-1111-111111111111', 'ALPHA001', '{"theme": "warrior", "motd": "Excellence is our standard"}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Beta Builders', 'Growth-focused team building the future', '22222222-2222-2222-2222-222222222222', 'BETA002', '{"theme": "builder", "motd": "Building success together"}'),
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Gamma Leaders', 'Leadership development team', '33333333-3333-3333-3333-333333333333', 'GAMMA003', '{"theme": "leader", "motd": "Leading by example"}')
ON CONFLICT (id) DO NOTHING;

-- Insert test communication channels
INSERT INTO mlm_communication_channels (id, name, description, type, scope, created_by, team_id, is_private, settings) VALUES
-- Global channels
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'General', 'General discussion for all MLM members', 'custom', 'global', '11111111-1111-1111-1111-111111111111', NULL, false, '{"allow_mentions": true, "allow_reactions": true}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Announcements', 'Important announcements from leadership', 'announcement', 'global', '11111111-1111-1111-1111-111111111111', NULL, false, '{"only_admins_can_post": true, "allow_reactions": true}'),
('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, 'Success Stories', 'Share your wins and achievements', 'achievement', 'global', '11111111-1111-1111-1111-111111111111', NULL, false, '{"auto_celebrate": true, "allow_media": true}'),
('gggggggg-gggg-gggg-gggg-gggggggggggg'::uuid, 'Training Hub', 'Educational content and training discussions', 'training', 'global', '11111111-1111-1111-1111-111111111111', NULL, false, '{"allow_file_sharing": true, "pinned_resources": true}'),

-- Team-specific channels
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'::uuid, 'Alpha Warriors - Strategy', 'Strategic discussions for Alpha Warriors', 'team', 'team', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, '{"team_only": true, "confidential": true}'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii'::uuid, 'Alpha Warriors - Daily', 'Daily check-ins and updates', 'team', 'team', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', false, '{"daily_standup": true}'),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj'::uuid, 'Beta Builders - Growth', 'Growth strategies and tactics', 'team', 'team', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, '{"growth_focused": true}'),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk'::uuid, 'Beta Builders - Support', 'Team support and encouragement', 'team', 'team', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', false, '{"supportive": true}'),

-- Rank-based channels
('llllllll-llll-llll-llll-llllllllllll'::uuid, 'Managers & Above', 'Exclusive channel for managers and higher ranks', 'rank', 'rank', '11111111-1111-1111-1111-111111111111', NULL, true, '{"min_rank": "manager", "leadership_focus": true}'),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm'::uuid, 'Directors & Above', 'Leadership channel for directors and executives', 'rank', 'rank', '11111111-1111-1111-1111-111111111111', NULL, true, '{"min_rank": "director", "executive_focus": true}'),

-- Genealogy channels
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn'::uuid, 'Level 1 Downline', 'Direct recruits communication', 'genealogy', 'genealogy', '11111111-1111-1111-1111-111111111111', NULL, false, '{"genealogy_level": 1, "mentor_mentee": true}'),
('oooooooo-oooo-oooo-oooo-oooooooooooo'::uuid, 'Level 2-3 Downline', 'Second and third level team communication', 'genealogy', 'genealogy', '11111111-1111-1111-1111-111111111111', NULL, false, '{"genealogy_levels": [2, 3]}')
ON CONFLICT (id) DO NOTHING;

-- Insert channel members
INSERT INTO mlm_channel_members (channel_id, user_id, role, notification_settings) VALUES
-- General channel members
('channel-001', 'mlm-user-001', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('channel-001', 'mlm-user-002', 'member', '{"mentions": true, "all_messages": false, "achievements": true, "announcements": true}'),
('channel-001', 'mlm-user-003', 'member', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('channel-001', 'mlm-user-004', 'member', '{"mentions": true, "all_messages": false, "achievements": false, "announcements": true}'),
('channel-001', 'mlm-user-005', 'member', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),

-- Announcements channel members
('channel-002', 'mlm-user-001', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('channel-002', 'mlm-user-002', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('channel-002', 'mlm-user-003', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('channel-002', 'mlm-user-004', 'member', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('channel-002', 'mlm-user-005', 'member', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),

-- Team channels
('channel-005', 'mlm-user-001', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('channel-005', 'mlm-user-004', 'member', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('channel-005', 'mlm-user-005', 'member', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),

('channel-007', 'mlm-user-002', 'admin', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('channel-007', 'mlm-user-006', 'member', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}'),
('channel-007', 'mlm-user-007', 'member', '{"mentions": true, "all_messages": true, "achievements": true, "announcements": true}')
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- Insert test messages
INSERT INTO mlm_messages (id, channel_id, sender_id, content, message_type, priority, created_at) VALUES
-- General channel messages
('msg-001', 'channel-001', 'mlm-user-001', 'Welcome everyone to our new communication system! 🎉 This is going to revolutionize how we connect and collaborate.', 'text', 'normal', NOW() - INTERVAL '2 hours'),
('msg-002', 'channel-001', 'mlm-user-002', 'This is amazing! I can already see how this will help us stay connected and motivated. 💪', 'text', 'normal', NOW() - INTERVAL '1 hour 45 minutes'),
('msg-003', 'channel-001', 'mlm-user-003', 'The real-time features are incredible. No more missing important updates! ⚡', 'text', 'normal', NOW() - INTERVAL '1 hour 30 minutes'),
('msg-004', 'channel-001', 'mlm-user-004', 'Quick question - how do I invite new team members to specific channels?', 'text', 'normal', NOW() - INTERVAL '1 hour'),
('msg-005', 'channel-001', 'mlm-user-001', 'Great question! You can use the @mention feature or send them a direct message with the channel link. I''ll create a quick guide for everyone.', 'text', 'normal', NOW() - INTERVAL '45 minutes'),

-- Announcement messages
('msg-006', 'channel-002', 'mlm-user-001', '🚨 IMPORTANT: New commission structure effective next month. Please review the updated compensation plan in your dashboard.', 'announcement', 'urgent', NOW() - INTERVAL '3 hours'),
('msg-007', 'channel-002', 'mlm-user-002', '📅 Team training session scheduled for this Friday at 2 PM. All managers and above are required to attend.', 'announcement', 'high', NOW() - INTERVAL '2 hours 30 minutes'),

-- Success story messages
('msg-008', 'channel-003', 'mlm-user-004', '🎊 Just hit my first $10K month! Thanks to everyone who supported me along the way. Special shoutout to @mlm-user-001 for the mentorship!', 'achievement', 'normal', NOW() - INTERVAL '4 hours'),
('msg-009', 'channel-003', 'mlm-user-005', '🏆 Team milestone achieved! We just crossed 500 active customers. Bonus pool is now active for all team members!', 'achievement', 'high', NOW() - INTERVAL '3 hours 30 minutes'),

-- Training messages
('msg-010', 'channel-004', 'mlm-user-001', '📚 New training module uploaded: "Advanced Sales Techniques". This 45-minute course covers objection handling and closing strategies.', 'text', 'normal', NOW() - INTERVAL '5 hours'),
('msg-011', 'channel-004', 'mlm-user-003', 'Just completed the sales techniques module. The objection handling section was particularly helpful. Highly recommend!', 'text', 'normal', NOW() - INTERVAL '2 hours 15 minutes'),

-- Team strategy messages
('msg-012', 'channel-005', 'mlm-user-001', 'Team, let''s discuss our Q4 strategy. I''m seeing some great opportunities in the holiday season market.', 'text', 'normal', NOW() - INTERVAL '6 hours'),
('msg-013', 'channel-005', 'mlm-user-004', 'I''ve been researching holiday marketing tactics. We could leverage social media campaigns and referral bonuses.', 'text', 'normal', NOW() - INTERVAL '5 hours 30 minutes'),

-- Direct messages
('msg-014', 'channel-001', 'mlm-user-002', 'Hey @mlm-user-001, can we schedule a quick call to discuss the new training program?', 'text', 'normal', NOW() - INTERVAL '30 minutes'),
('msg-015', 'channel-001', 'mlm-user-001', 'Absolutely! How about tomorrow at 10 AM? I''ll send you a calendar invite.', 'text', 'normal', NOW() - INTERVAL '25 minutes')
ON CONFLICT (id) DO NOTHING;

-- Insert message reactions
INSERT INTO mlm_message_reactions (message_id, user_id, emoji) VALUES
('msg-001', 'mlm-user-002', '🎉'),
('msg-001', 'mlm-user-003', '🎉'),
('msg-001', 'mlm-user-004', '🎉'),
('msg-001', 'mlm-user-005', '🎉'),
('msg-002', 'mlm-user-001', '💪'),
('msg-002', 'mlm-user-003', '💪'),
('msg-004', 'mlm-user-001', '👍'),
('msg-008', 'mlm-user-001', '🎊'),
('msg-008', 'mlm-user-002', '🎊'),
('msg-008', 'mlm-user-003', '🎊'),
('msg-008', 'mlm-user-005', '🎊'),
('msg-009', 'mlm-user-001', '🏆'),
('msg-009', 'mlm-user-002', '🏆'),
('msg-009', 'mlm-user-003', '🏆'),
('msg-009', 'mlm-user-004', '🏆'),
('msg-011', 'mlm-user-001', '👍'),
('msg-011', 'mlm-user-002', '👍')
ON CONFLICT (message_id, user_id, emoji) DO NOTHING;

-- Insert message reads
INSERT INTO mlm_message_reads (message_id, user_id, read_at) VALUES
-- User 1 has read all messages
('msg-001', 'mlm-user-001', NOW() - INTERVAL '2 hours'),
('msg-002', 'mlm-user-001', NOW() - INTERVAL '1 hour 45 minutes'),
('msg-003', 'mlm-user-001', NOW() - INTERVAL '1 hour 30 minutes'),
('msg-004', 'mlm-user-001', NOW() - INTERVAL '1 hour'),
('msg-005', 'mlm-user-001', NOW() - INTERVAL '45 minutes'),
('msg-006', 'mlm-user-001', NOW() - INTERVAL '3 hours'),
('msg-007', 'mlm-user-001', NOW() - INTERVAL '2 hours 30 minutes'),
('msg-008', 'mlm-user-001', NOW() - INTERVAL '4 hours'),
('msg-009', 'mlm-user-001', NOW() - INTERVAL '3 hours 30 minutes'),
('msg-010', 'mlm-user-001', NOW() - INTERVAL '5 hours'),
('msg-011', 'mlm-user-001', NOW() - INTERVAL '2 hours 15 minutes'),
('msg-012', 'mlm-user-001', NOW() - INTERVAL '6 hours'),
('msg-013', 'mlm-user-001', NOW() - INTERVAL '5 hours 30 minutes'),
('msg-014', 'mlm-user-001', NOW() - INTERVAL '30 minutes'),
('msg-015', 'mlm-user-001', NOW() - INTERVAL '25 minutes'),

-- User 2 has read most messages
('msg-001', 'mlm-user-002', NOW() - INTERVAL '1 hour 50 minutes'),
('msg-002', 'mlm-user-002', NOW() - INTERVAL '1 hour 45 minutes'),
('msg-003', 'mlm-user-002', NOW() - INTERVAL '1 hour 30 minutes'),
('msg-004', 'mlm-user-002', NOW() - INTERVAL '1 hour'),
('msg-005', 'mlm-user-002', NOW() - INTERVAL '45 minutes'),
('msg-006', 'mlm-user-002', NOW() - INTERVAL '3 hours'),
('msg-007', 'mlm-user-002', NOW() - INTERVAL '2 hours 30 minutes'),
('msg-008', 'mlm-user-002', NOW() - INTERVAL '4 hours'),
('msg-009', 'mlm-user-002', NOW() - INTERVAL '3 hours 30 minutes'),
('msg-010', 'mlm-user-002', NOW() - INTERVAL '5 hours'),
('msg-011', 'mlm-user-002', NOW() - INTERVAL '2 hours 15 minutes'),
('msg-012', 'mlm-user-002', NOW() - INTERVAL '6 hours'),
('msg-013', 'mlm-user-002', NOW() - INTERVAL '5 hours 30 minutes'),
('msg-014', 'mlm-user-002', NOW() - INTERVAL '30 minutes'),
('msg-015', 'mlm-user-002', NOW() - INTERVAL '25 minutes'),

-- User 3 has read some messages
('msg-001', 'mlm-user-003', NOW() - INTERVAL '1 hour 30 minutes'),
('msg-002', 'mlm-user-003', NOW() - INTERVAL '1 hour 25 minutes'),
('msg-003', 'mlm-user-003', NOW() - INTERVAL '1 hour 30 minutes'),
('msg-006', 'mlm-user-003', NOW() - INTERVAL '3 hours'),
('msg-007', 'mlm-user-003', NOW() - INTERVAL '2 hours 30 minutes'),
('msg-008', 'mlm-user-003', NOW() - INTERVAL '4 hours'),
('msg-009', 'mlm-user-003', NOW() - INTERVAL '3 hours 30 minutes'),
('msg-010', 'mlm-user-003', NOW() - INTERVAL '5 hours'),
('msg-011', 'mlm-user-003', NOW() - INTERVAL '2 hours 15 minutes'),

-- User 4 has read fewer messages
('msg-001', 'mlm-user-004', NOW() - INTERVAL '1 hour'),
('msg-002', 'mlm-user-004', NOW() - INTERVAL '55 minutes'),
('msg-004', 'mlm-user-004', NOW() - INTERVAL '1 hour'),
('msg-005', 'mlm-user-004', NOW() - INTERVAL '45 minutes'),
('msg-006', 'mlm-user-004', NOW() - INTERVAL '3 hours'),
('msg-008', 'mlm-user-004', NOW() - INTERVAL '4 hours'),
('msg-012', 'mlm-user-004', NOW() - INTERVAL '6 hours'),
('msg-013', 'mlm-user-004', NOW() - INTERVAL '5 hours 30 minutes'),

-- User 5 has read some messages
('msg-001', 'mlm-user-005', NOW() - INTERVAL '1 hour 15 minutes'),
('msg-002', 'mlm-user-005', NOW() - INTERVAL '1 hour 10 minutes'),
('msg-003', 'mlm-user-005', NOW() - INTERVAL '1 hour 5 minutes'),
('msg-006', 'mlm-user-005', NOW() - INTERVAL '3 hours'),
('msg-008', 'mlm-user-005', NOW() - INTERVAL '4 hours'),
('msg-009', 'mlm-user-005', NOW() - INTERVAL '3 hours 30 minutes'),
('msg-010', 'mlm-user-005', NOW() - INTERVAL '5 hours')
ON CONFLICT (message_id, user_id) DO NOTHING;

-- Insert direct messages
INSERT INTO mlm_direct_messages (sender_id, recipient_id, content, message_type, is_read, created_at) VALUES
('mlm-user-001', 'mlm-user-002', 'Hey! How are things going with your new recruits?', 'text', true, NOW() - INTERVAL '1 day'),
('mlm-user-002', 'mlm-user-001', 'Great! They''re really engaged with the new training materials. Thanks for the resources!', 'text', true, NOW() - INTERVAL '23 hours'),
('mlm-user-001', 'mlm-user-003', 'Can we schedule a team call for this week?', 'text', false, NOW() - INTERVAL '2 hours'),
('mlm-user-003', 'mlm-user-004', 'Congratulations on hitting your monthly goal! 🎉', 'text', true, NOW() - INTERVAL '3 hours'),
('mlm-user-004', 'mlm-user-003', 'Thank you! Couldn''t have done it without the team support.', 'text', true, NOW() - INTERVAL '2 hours 45 minutes'),
('mlm-user-002', 'mlm-user-005', 'The new communication system is working perfectly for our team coordination.', 'text', false, NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Insert communication analytics
INSERT INTO mlm_communication_analytics (user_id, channel_id, metric_type, metric_value, recorded_at) VALUES
('mlm-user-001', 'channel-001', 'messages_sent', 15, NOW() - INTERVAL '1 day'),
('mlm-user-001', 'channel-002', 'messages_sent', 8, NOW() - INTERVAL '1 day'),
('mlm-user-001', 'channel-005', 'messages_sent', 12, NOW() - INTERVAL '1 day'),
('mlm-user-002', 'channel-001', 'messages_sent', 10, NOW() - INTERVAL '1 day'),
('mlm-user-002', 'channel-007', 'messages_sent', 6, NOW() - INTERVAL '1 day'),
('mlm-user-003', 'channel-001', 'messages_sent', 7, NOW() - INTERVAL '1 day'),
('mlm-user-003', 'channel-004', 'messages_sent', 5, NOW() - INTERVAL '1 day'),
('mlm-user-004', 'channel-001', 'messages_sent', 4, NOW() - INTERVAL '1 day'),
('mlm-user-004', 'channel-003', 'messages_sent', 3, NOW() - INTERVAL '1 day'),
('mlm-user-005', 'channel-001', 'messages_sent', 6, NOW() - INTERVAL '1 day'),
('mlm-user-005', 'channel-003', 'messages_sent', 2, NOW() - INTERVAL '1 day'),

-- Engagement scores
('mlm-user-001', NULL, 'engagement_score', 95.5, NOW() - INTERVAL '1 day'),
('mlm-user-002', NULL, 'engagement_score', 87.2, NOW() - INTERVAL '1 day'),
('mlm-user-003', NULL, 'engagement_score', 78.9, NOW() - INTERVAL '1 day'),
('mlm-user-004', NULL, 'engagement_score', 82.1, NOW() - INTERVAL '1 day'),
('mlm-user-005', NULL, 'engagement_score', 75.3, NOW() - INTERVAL '1 day'),

-- Time spent metrics
('mlm-user-001', 'channel-001', 'time_spent', 120.5, NOW() - INTERVAL '1 day'),
('mlm-user-001', 'channel-005', 'time_spent', 85.2, NOW() - INTERVAL '1 day'),
('mlm-user-002', 'channel-001', 'time_spent', 95.8, NOW() - INTERVAL '1 day'),
('mlm-user-002', 'channel-007', 'time_spent', 65.4, NOW() - INTERVAL '1 day'),
('mlm-user-003', 'channel-001', 'time_spent', 70.1, NOW() - INTERVAL '1 day'),
('mlm-user-003', 'channel-004', 'time_spent', 45.3, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Insert communication events (for real-time features)
INSERT INTO mlm_communication_events (user_id, event_type, channel_id, metadata, expires_at) VALUES
('mlm-user-001', 'online', NULL, '{"last_seen": "2024-01-15T10:30:00Z"}', NOW() + INTERVAL '1 hour'),
('mlm-user-002', 'online', NULL, '{"last_seen": "2024-01-15T10:25:00Z"}', NOW() + INTERVAL '1 hour'),
('mlm-user-003', 'online', NULL, '{"last_seen": "2024-01-15T10:20:00Z"}', NOW() + INTERVAL '1 hour'),
('mlm-user-004', 'offline', NULL, '{"last_seen": "2024-01-15T09:45:00Z"}', NOW() + INTERVAL '30 minutes'),
('mlm-user-005', 'online', NULL, '{"last_seen": "2024-01-15T10:15:00Z"}', NOW() + INTERVAL '1 hour'),
('mlm-user-001', 'typing', 'channel-001', '{"typing_since": "2024-01-15T10:30:00Z"}', NOW() + INTERVAL '30 seconds'),
('mlm-user-002', 'typing', 'channel-001', '{"typing_since": "2024-01-15T10:28:00Z"}', NOW() + INTERVAL '30 seconds')
ON CONFLICT (id) DO NOTHING;

-- Insert some message attachments (for file sharing)
INSERT INTO mlm_message_attachments (message_id, file_name, file_size, file_type, file_url, thumbnail_url) VALUES
('msg-010', 'advanced-sales-techniques.pdf', 2048576, 'application/pdf', '/uploads/training/advanced-sales-techniques.pdf', '/uploads/thumbnails/advanced-sales-techniques.jpg'),
('msg-011', 'objection-handling-checklist.pdf', 512000, 'application/pdf', '/uploads/training/objection-handling-checklist.pdf', '/uploads/thumbnails/objection-handling-checklist.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert communication permissions
INSERT INTO mlm_communication_permissions (user_id, permission_type, is_granted, granted_by, granted_at) VALUES
('mlm-user-001', 'create_channels', true, 'mlm-user-001', NOW() - INTERVAL '30 days'),
('mlm-user-001', 'manage_channels', true, 'mlm-user-001', NOW() - INTERVAL '30 days'),
('mlm-user-001', 'send_announcements', true, 'mlm-user-001', NOW() - INTERVAL '30 days'),
('mlm-user-001', 'moderate_content', true, 'mlm-user-001', NOW() - INTERVAL '30 days'),
('mlm-user-001', 'view_analytics', true, 'mlm-user-001', NOW() - INTERVAL '30 days'),
('mlm-user-002', 'create_channels', true, 'mlm-user-001', NOW() - INTERVAL '25 days'),
('mlm-user-002', 'send_announcements', true, 'mlm-user-001', NOW() - INTERVAL '25 days'),
('mlm-user-002', 'view_analytics', true, 'mlm-user-001', NOW() - INTERVAL '25 days'),
('mlm-user-003', 'create_channels', true, 'mlm-user-001', NOW() - INTERVAL '20 days'),
('mlm-user-003', 'view_analytics', true, 'mlm-user-001', NOW() - INTERVAL '20 days')
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
