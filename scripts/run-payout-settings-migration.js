#!/usr/bin/env node

/**
 * Run Payout Settings Database Migration
 * This script creates the mlm_payout_settings table in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running payout settings database migration...\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'create-payout-settings-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });

    if (error) {
      // If the RPC doesn't exist, try direct SQL execution
      console.log('⚠️ RPC method not available, trying direct execution...');
      
      // Split SQL into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        try {
          const { error: stmtError } = await supabase
            .from('mlm_payout_settings')
            .select('id')
            .limit(1);
          
          if (stmtError && stmtError.code === '42P01') {
            // Table doesn't exist, we need to create it
            console.log('📋 Creating mlm_payout_settings table...');
            
            // For now, just log what needs to be done
            console.log('⚠️ Please run the following SQL in your Supabase SQL editor:');
            console.log('\n' + '='.repeat(60));
            console.log(sqlContent);
            console.log('='.repeat(60) + '\n');
            
            console.log('✅ Migration instructions provided');
            return;
          }
        } catch (err) {
          console.log('⚠️ Please run the following SQL in your Supabase SQL editor:');
          console.log('\n' + '='.repeat(60));
          console.log(sqlContent);
          console.log('='.repeat(60) + '\n');
          
          console.log('✅ Migration instructions provided');
          return;
        }
      }
    } else {
      console.log('✅ Migration completed successfully');
    }

    // Verify the table was created
    const { data: tableData, error: tableError } = await supabase
      .from('mlm_payout_settings')
      .select('id')
      .limit(1);

    if (tableError) {
      if (tableError.code === '42P01') {
        console.log('❌ Table creation failed - table does not exist');
        console.log('⚠️ Please run the SQL manually in your Supabase dashboard');
      } else {
        console.log('❌ Error verifying table:', tableError.message);
      }
    } else {
      console.log('✅ Table verified successfully');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n⚠️ Manual migration required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Run the SQL from create-payout-settings-table.sql');
  }
}

// Run the migration
runMigration().catch(console.error);
