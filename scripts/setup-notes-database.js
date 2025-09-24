#!/usr/bin/env node

/**
 * Database Setup Script for Notes
 * 
 * This script creates the lesson_notes table in Supabase if it doesn't exist.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  console.log('🚀 Setting up Notes Database...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.log('Please make sure you have:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    console.log('in your .env.local file');
    return;
  }

  console.log('✅ Environment variables found');
  console.log(`📡 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection
    console.log('\n🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('lesson_notes').select('count').limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('📋 Table does not exist, creating it...');
      
      // Create the table using SQL
      const createTableSQL = `
        CREATE TABLE lesson_notes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          lesson_id TEXT NOT NULL,
          course_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          tags TEXT[] DEFAULT '{}',
          video_timestamp INTEGER,
          is_bookmarked BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.log('⚠️ Could not create table via RPC, trying direct approach...');
        console.log('Please run this SQL in your Supabase SQL Editor:');
        console.log(createTableSQL);
      } else {
        console.log('✅ Table created successfully!');
      }
    } else if (error) {
      console.error('❌ Database error:', error);
      return;
    } else {
      console.log('✅ Table already exists!');
    }

    // Enable RLS
    console.log('\n🔒 Setting up Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;' 
    });
    
    if (rlsError) {
      console.log('⚠️ Could not enable RLS via RPC');
      console.log('Please run this SQL in your Supabase SQL Editor:');
      console.log('ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;');
    } else {
      console.log('✅ RLS enabled!');
    }

    // Create policies
    console.log('\n🛡️ Creating security policies...');
    const policies = [
      `CREATE POLICY "Users can view their own notes" ON lesson_notes FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert their own notes" ON lesson_notes FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update their own notes" ON lesson_notes FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can delete their own notes" ON lesson_notes FOR DELETE USING (auth.uid() = user_id);`
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy });
      if (policyError) {
        console.log('⚠️ Could not create policy via RPC');
        console.log('Please run this SQL in your Supabase SQL Editor:');
        console.log(policy);
      }
    }

    console.log('✅ Policies created!');

    // Test the API
    console.log('\n🧪 Testing API endpoint...');
    const testResponse = await fetch('http://localhost:3000/api/training/notes?lessonId=test&courseId=test&userId=550e8400-e29b-41d4-a716-446655440000');
    
    if (testResponse.ok) {
      console.log('✅ API endpoint is working!');
      const data = await testResponse.json();
      console.log(`📊 Found ${data.notes?.length || 0} notes`);
    } else {
      console.log(`❌ API endpoint error: ${testResponse.status}`);
      const errorText = await testResponse.text();
      console.log('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabase();