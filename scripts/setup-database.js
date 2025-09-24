#!/usr/bin/env node

/**
 * Database Setup Script for MLM Communication System
 * This script sets up the database schema and initial data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up MLM Communication Database...');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'lib', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing database schema...');
    
    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error executing schema:', error);
      throw error;
    }

    console.log('✅ Database schema created successfully');

    // Create initial channels
    console.log('📝 Creating initial channels...');
    
    const initialChannels = [
      {
        name: 'General',
        type: 'team',
        description: 'General team discussions',
        created_by: 'mlm-user-123',
        is_private: false
      },
      {
        name: 'Announcements',
        type: 'announcement',
        description: 'Important announcements and updates',
        created_by: 'mlm-user-123',
        is_private: false
      },
      {
        name: 'Training',
        type: 'team',
        description: 'Training materials and discussions',
        created_by: 'mlm-user-123',
        is_private: false
      }
    ];

    for (const channelData of initialChannels) {
      const { data: channel, error: channelError } = await supabase
        .from('mlm_channels')
        .insert(channelData)
        .select()
        .single();

      if (channelError) {
        console.error(`❌ Error creating channel ${channelData.name}:`, channelError);
        continue;
      }

      console.log(`✅ Created channel: ${channel.name}`);

      // Add the creator as an admin member
      const { error: memberError } = await supabase
        .from('mlm_channel_members')
        .insert({
          channel_id: channel.id,
          user_id: 'mlm-user-123',
          role: 'admin'
        });

      if (memberError) {
        console.error(`❌ Error adding member to channel ${channel.name}:`, memberError);
      }
    }

    // Create initial MLM user
    console.log('👤 Creating initial MLM user...');
    
    const { data: mlmUser, error: userError } = await supabase
      .from('mlm_users')
      .insert({
        id: 'mlm-user-123',
        user_id: 'mlm-user-123', // This would be a real user ID in production
        mlm_code: 'MLM123',
        rank: 'diamond',
        status: 'active'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creating MLM user:', userError);
    } else {
      console.log('✅ Created MLM user:', mlmUser.mlm_code);
    }

    // Create a welcome message
    console.log('💬 Creating welcome message...');
    
    const { data: welcomeMessage, error: messageError } = await supabase
      .from('mlm_messages')
      .insert({
        channel_id: (await supabase.from('mlm_channels').select('id').eq('name', 'General').single()).data.id,
        sender_id: 'mlm-user-123',
        content: 'Welcome to the MLM Communication System! 🎉',
        message_type: 'system'
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Error creating welcome message:', messageError);
    } else {
      console.log('✅ Created welcome message');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Update your environment variables');
    console.log('   2. Test the communication system');
    console.log('   3. Add real user authentication');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();