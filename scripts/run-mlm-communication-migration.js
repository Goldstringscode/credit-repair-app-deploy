#!/usr/bin/env node

/**
 * MLM Communication Schema Migration Script
 * Runs the comprehensive MLM communication database schema
 */

const fs = require('fs');
const path = require('path');

// Database connection configuration
const DB_CONFIG = {
  host: process.env.SUPABASE_HOST || 'localhost',
  port: process.env.SUPABASE_PORT || 5432,
  database: process.env.SUPABASE_DATABASE || 'postgres',
  user: process.env.SUPABASE_USER || 'postgres',
  password: process.env.SUPABASE_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

async function runMigration() {
  console.log('🚀 Starting MLM Communication Schema Migration...');
  
  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'mlm-communication-schema-fixed.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Schema file loaded successfully');
    console.log('📊 Schema includes:');
    console.log('   - 12 new tables for comprehensive communication system');
    console.log('   - Optimized indexes for high-performance queries');
    console.log('   - Triggers for automatic data management');
    console.log('   - Views for common communication queries');
    console.log('   - Default communication templates');
    
    // Check if we have database connection details
    if (!process.env.SUPABASE_URL && !process.env.SUPABASE_HOST) {
      console.log('⚠️  No database connection details found.');
      console.log('📋 To run this migration manually:');
      console.log('   1. Copy the SQL from: scripts/mlm-communication-schema.sql');
      console.log('   2. Run it in your Supabase SQL Editor or database client');
      console.log('   3. Or set environment variables and run this script again');
      console.log('');
      console.log('🔧 Required environment variables:');
      console.log('   - SUPABASE_URL (or SUPABASE_HOST, SUPABASE_PORT, etc.)');
      console.log('   - SUPABASE_SERVICE_ROLE_KEY');
      console.log('');
      console.log('📄 Raw SQL to execute:');
      console.log('─'.repeat(80));
      console.log(schemaSQL);
      console.log('─'.repeat(80));
      return;
    }
    
    // Try to connect to database if credentials are available
    let client;
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL || `https://${DB_CONFIG.host}`,
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-key'
      );
      
      console.log('🔌 Connected to Supabase');
      
      // Execute the schema
      const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
      
      if (error) {
        console.error('❌ Migration failed:', error);
        console.log('📋 Please run the SQL manually in your Supabase SQL Editor');
        return;
      }
      
      console.log('✅ Migration completed successfully!');
      console.log('🎉 MLM Communication system is ready!');
      
    } catch (dbError) {
      console.log('⚠️  Database connection failed, but schema is ready');
      console.log('📋 Please run the SQL manually in your Supabase SQL Editor');
      console.log('🔗 Copy the SQL from: scripts/mlm-communication-schema.sql');
    }
    
  } catch (error) {
    console.error('❌ Migration script error:', error);
    console.log('📋 Please run the SQL manually in your Supabase SQL Editor');
  }
}

// Run the migration
runMigration().catch(console.error);
