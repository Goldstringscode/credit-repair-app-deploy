-- Add test data for MLM Communication System
-- This script adds test channels and messages

-- First, ensure we have a test user
INSERT INTO mlm_users (id, display_name, email, avatar_url, rank)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Test User', 'test@example.com', '/avatars/default.jpg', 'member')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email,
  avatar_url = EXCLUDED.avatar_url,
  rank = EXCLUDED.rank;

-- Add test channels
INSERT INTO mlm_communication_channels (id, name, type, description, is_private, scope)
VALUES 
  ('channel-1', 'general', 'text', 'General team discussions', false, 'team'),
  ('channel-2', 'announcements', 'announcement', 'Important team announcements', false, 'team'),
  ('channel-3', 'training', 'text', 'Training and development discussions', false, 'team'),
  ('channel-4', 'leadership-team', 'text', 'Leadership team discussions', true, 'team'),
  ('channel-5', 'success-stories', 'text', 'Share your success stories', false, 'team')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  is_private = EXCLUDED.is_private,
  scope = EXCLUDED.scope;

-- Add test user to all channels
INSERT INTO mlm_channel_members (channel_id, user_id, joined_at)
VALUES 
  ('channel-1', '550e8400-e29b-41d4-a716-446655440000', NOW()),
  ('channel-2', '550e8400-e29b-41d4-a716-446655440000', NOW()),
  ('channel-3', '550e8400-e29b-41d4-a716-446655440000', NOW()),
  ('channel-4', '550e8400-e29b-41d4-a716-446655440000', NOW()),
  ('channel-5', '550e8400-e29b-41d4-a716-446655440000', NOW())
ON CONFLICT (channel_id, user_id) DO NOTHING;

-- Add test messages for different channels
INSERT INTO mlm_messages (id, channel_id, sender_id, content, message_type, created_at)
VALUES 
  -- General channel messages
  ('msg-1', 'channel-1', '550e8400-e29b-41d4-a716-446655440000', 'Welcome to the general channel! This is where we discuss team matters.', 'text', NOW() - INTERVAL '2 hours'),
  ('msg-2', 'channel-1', '550e8400-e29b-41d4-a716-446655440000', 'How is everyone doing today?', 'text', NOW() - INTERVAL '1 hour'),
  ('msg-3', 'channel-1', '550e8400-e29b-41d4-a716-446655440000', 'Great work on the recent project!', 'text', NOW() - INTERVAL '30 minutes'),
  
  -- Announcements channel messages
  ('msg-4', 'channel-2', '550e8400-e29b-41d4-a716-446655440000', '🎉 Monthly team meeting scheduled for Friday 3PM EST', 'announcement', NOW() - INTERVAL '3 hours'),
  ('msg-5', 'channel-2', '550e8400-e29b-41d4-a716-446655440000', 'New training materials are now available in the portal', 'announcement', NOW() - INTERVAL '1 day'),
  
  -- Training channel messages
  ('msg-6', 'channel-3', '550e8400-e29b-41d4-a716-446655440000', 'Let\'s discuss the new sales techniques we learned', 'text', NOW() - INTERVAL '4 hours'),
  ('msg-7', 'channel-3', '550e8400-e29b-41d4-a716-446655440000', 'Anyone have questions about the compensation plan?', 'text', NOW() - INTERVAL '2 hours'),
  
  -- Leadership team messages
  ('msg-8', 'channel-4', '550e8400-e29b-41d4-a716-446655440000', 'Strategy meeting notes from yesterday', 'text', NOW() - INTERVAL '5 hours'),
  ('msg-9', 'channel-4', '550e8400-e29b-41d4-a716-446655440000', 'Budget planning for next quarter', 'text', NOW() - INTERVAL '1 day'),
  
  -- Success stories messages
  ('msg-10', 'channel-5', '550e8400-e29b-41d4-a716-446655440000', 'Just hit my monthly goal! 🎉', 'text', NOW() - INTERVAL '6 hours'),
  ('msg-11', 'channel-5', '550e8400-e29b-41d4-a716-446655440000', 'Team milestone achieved: 500+ active customers!', 'text', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Update channel updated_at timestamps
UPDATE mlm_communication_channels 
SET updated_at = NOW() 
WHERE id IN ('channel-1', 'channel-2', 'channel-3', 'channel-4', 'channel-5');
