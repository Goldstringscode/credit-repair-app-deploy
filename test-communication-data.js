// Test script to add communication data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addTestData() {
  try {
    console.log('Adding test communication data...');

    // Add test user
    const { error: userError } = await supabase
      .from('mlm_users')
      .upsert({
        id: '550e8400-e29b-41d4-a716-446655440000',
        display_name: 'Test User',
        email: 'test@example.com',
        avatar_url: '/avatars/default.jpg',
        rank: 'member'
      });

    if (userError) {
      console.error('User error:', userError);
    } else {
      console.log('✅ Test user added');
    }

    // Add test channels
    const channels = [
      { id: 'channel-1', name: 'general', type: 'text', description: 'General team discussions', is_private: false, scope: 'team' },
      { id: 'channel-2', name: 'announcements', type: 'announcement', description: 'Important team announcements', is_private: false, scope: 'team' },
      { id: 'channel-3', name: 'training', type: 'text', description: 'Training and development discussions', is_private: false, scope: 'team' },
      { id: 'channel-4', name: 'leadership-team', type: 'text', description: 'Leadership team discussions', is_private: true, scope: 'team' },
      { id: 'channel-5', name: 'success-stories', type: 'text', description: 'Share your success stories', is_private: false, scope: 'team' }
    ];

    const { error: channelError } = await supabase
      .from('mlm_communication_channels')
      .upsert(channels);

    if (channelError) {
      console.error('Channel error:', channelError);
    } else {
      console.log('✅ Test channels added');
    }

    // Add channel members
    const members = channels.map(channel => ({
      channel_id: channel.id,
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      joined_at: new Date().toISOString()
    }));

    const { error: memberError } = await supabase
      .from('mlm_channel_members')
      .upsert(members, { onConflict: 'channel_id,user_id' });

    if (memberError) {
      console.error('Member error:', memberError);
    } else {
      console.log('✅ Channel members added');
    }

    // Add test messages
    const messages = [
      { id: 'msg-1', channel_id: 'channel-1', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: 'Welcome to the general channel! This is where we discuss team matters.', message_type: 'text' },
      { id: 'msg-2', channel_id: 'channel-1', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: 'How is everyone doing today?', message_type: 'text' },
      { id: 'msg-3', channel_id: 'channel-1', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: 'Great work on the recent project!', message_type: 'text' },
      { id: 'msg-4', channel_id: 'channel-2', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: '🎉 Monthly team meeting scheduled for Friday 3PM EST', message_type: 'announcement' },
      { id: 'msg-5', channel_id: 'channel-2', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: 'New training materials are now available in the portal', message_type: 'announcement' },
      { id: 'msg-6', channel_id: 'channel-3', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: 'Let\'s discuss the new sales techniques we learned', message_type: 'text' },
      { id: 'msg-7', channel_id: 'channel-3', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: 'Anyone have questions about the compensation plan?', message_type: 'text' },
      { id: 'msg-8', channel_id: 'channel-4', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: 'Strategy meeting notes from yesterday', message_type: 'text' },
      { id: 'msg-9', channel_id: 'channel-4', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: 'Budget planning for next quarter', message_type: 'text' },
      { id: 'msg-10', channel_id: 'channel-5', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: 'Just hit my monthly goal! 🎉', message_type: 'text' },
      { id: 'msg-11', channel_id: 'channel-5', sender_id: '550e8400-e29b-41d4-a716-446655440000', content: 'Team milestone achieved: 500+ active customers!', message_type: 'text' }
    ];

    const { error: messageError } = await supabase
      .from('mlm_messages')
      .upsert(messages, { onConflict: 'id' });

    if (messageError) {
      console.error('Message error:', messageError);
    } else {
      console.log('✅ Test messages added');
    }

    console.log('✅ All test data added successfully!');
  } catch (error) {
    console.error('Error adding test data:', error);
  }
}

addTestData();
