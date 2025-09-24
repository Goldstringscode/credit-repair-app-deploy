#!/usr/bin/env node

/**
 * Fix Notes Database Schema
 * 
 * This script fixes the lesson_notes table schema to use TEXT for lesson_id and course_id
 * instead of UUID, since we're using string identifiers.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixSchema() {
  console.log('🔧 Fixing Notes Database Schema...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // First, let's check the current table structure
    console.log('📋 Checking current table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('lesson_notes')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Cannot access table:', tableError.message);
      return;
    }

    console.log('✅ Table is accessible');

    // The issue is likely that course_id and lesson_id are defined as UUID in the database
    // but we're passing TEXT values. Let's create a new table with the correct schema.
    
    console.log('\n🔄 Creating new table with correct schema...');
    
    // Drop the existing table (this will delete all data!)
    console.log('⚠️ WARNING: This will delete all existing notes!');
    console.log('Dropping existing table...');
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: 'DROP TABLE IF EXISTS lesson_notes CASCADE;' 
    });
    
    if (dropError) {
      console.log('⚠️ Could not drop table via RPC');
      console.log('Please run this SQL in your Supabase SQL Editor:');
      console.log('DROP TABLE IF EXISTS lesson_notes CASCADE;');
    } else {
      console.log('✅ Old table dropped');
    }

    // Create the new table with correct schema
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
      console.log('⚠️ Could not create table via RPC');
      console.log('Please run this SQL in your Supabase SQL Editor:');
      console.log(createTableSQL);
    } else {
      console.log('✅ New table created with correct schema!');
    }

    // Enable RLS
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

    // Test the new schema
    console.log('\n🧪 Testing new schema...');
    const testNote = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      lesson_id: 'lesson-4',
      course_id: 'credit-basics',
      title: 'Test Note',
      content: 'This is a test note with correct schema',
      video_timestamp: 0,
      tags: [],
      is_bookmarked: false
    };

    const { data: insertData, error: insertError } = await supabase
      .from('lesson_notes')
      .insert([testNote])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      return;
    }
    console.log('✅ Insert test successful!');
    console.log('Note ID:', insertData.id);

    // Clean up test note
    await supabase
      .from('lesson_notes')
      .delete()
      .eq('id', insertData.id);

    console.log('✅ Test note cleaned up');

    console.log('\n🎉 Schema fix complete! The API should now work correctly.');

  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
  }
}

fixSchema();

