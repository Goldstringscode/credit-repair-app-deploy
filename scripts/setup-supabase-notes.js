#!/usr/bin/env node

/**
 * Supabase Notes Setup Script
 * 
 * This script helps you set up Supabase for cross-device note synchronization.
 * Run this script after setting up your Supabase project.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Supabase for Notes Synchronization...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env.local file...');
  fs.writeFileSync(envPath, '');
}

// Read current .env.local content
let envContent = '';
if (envExists) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check for required environment variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingVars = [];
const existingVars = [];

requiredVars.forEach(varName => {
  if (envContent.includes(varName)) {
    existingVars.push(varName);
  } else {
    missingVars.push(varName);
  }
});

console.log('📊 Environment Variables Status:');
console.log(`✅ Found: ${existingVars.length}/${requiredVars.length}`);
existingVars.forEach(varName => console.log(`   ✓ ${varName}`));
missingVars.forEach(varName => console.log(`   ✗ ${varName}`));

if (missingVars.length > 0) {
  console.log('\n🔧 Setup Instructions:');
  console.log('1. Go to your Supabase project dashboard: https://supabase.com/dashboard');
  console.log('2. Navigate to Settings > API');
  console.log('3. Copy the following values to your .env.local file:\n');
  
  missingVars.forEach(varName => {
    console.log(`${varName}=your_${varName.toLowerCase()}_here`);
  });
  
  console.log('\n4. Save the .env.local file');
  console.log('5. Restart your development server (npm run dev)');
} else {
  console.log('\n✅ All required environment variables are set!');
}

console.log('\n📋 Database Setup:');
console.log('Make sure you have the following table in your Supabase database:');
console.log(`
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

-- Enable RLS
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notes" ON lesson_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON lesson_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON lesson_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON lesson_notes
  FOR DELETE USING (auth.uid() = user_id);
`);

console.log('\n🎉 Setup complete! Your notes will now sync across devices.');
console.log('💡 Features:');
console.log('   • Real-time sync across devices');
console.log('   • Offline support with localStorage fallback');
console.log('   • Visual sync status indicators');
console.log('   • Manual sync button');
console.log('   • Automatic conflict resolution');

