/**
 * Supabase Connection Test Script
 * Simple script to test Supabase connection and communication database functionality
 * Run with: node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test configuration
const TEST_CONFIG = {
  timeout: 10000, // 10 seconds
  testUserId: '550e8400-e29b-41d4-a716-446655440000',
  testChannelId: '550e8400-e29b-41d4-a716-446655440001'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function testSupabaseConnection() {
  log('\n🚀 Starting Supabase Connection Test', 'bold');
  log('=' .repeat(50), 'blue');

  // Step 1: Check environment variables
  log('\n📋 Step 1: Checking Environment Variables', 'bold');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    logError('NEXT_PUBLIC_SUPABASE_URL is not set');
    return false;
  }
  logSuccess(`Supabase URL: ${supabaseUrl}`);
  
  if (!supabaseKey) {
    logError('SUPABASE_SERVICE_ROLE_KEY is not set');
    return false;
  }
  logSuccess('Supabase Service Key is set');
  
  if (!supabaseUrl.includes('supabase.co')) {
    logWarning('Supabase URL does not appear to be a valid Supabase URL');
  }

  // Step 2: Initialize Supabase client
  log('\n🔧 Step 2: Initializing Supabase Client', 'bold');
  
  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    logSuccess('Supabase client created successfully');
  } catch (error) {
    logError(`Failed to create Supabase client: ${error.message}`);
    return false;
  }

  // Step 3: Test basic connection
  log('\n🌐 Step 3: Testing Basic Connection', 'bold');
  
  try {
    const { data, error } = await supabase
      .from('mlm_users')
      .select('count')
      .limit(1);
    
    if (error) {
      logError(`Database connection failed: ${error.message}`);
      return false;
    }
    
    logSuccess('Database connection successful');
  } catch (error) {
    logError(`Connection test failed: ${error.message}`);
    return false;
  }

  // Step 4: Test communication tables
  log('\n💬 Step 4: Testing Communication Tables', 'bold');
  
  const tables = [
    'mlm_users',
    'mlm_communication_channels',
    'mlm_channel_members',
    'mlm_messages',
    'mlm_message_attachments'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        logError(`Table ${table} access failed: ${error.message}`);
        return false;
      }
      
      logSuccess(`Table ${table} is accessible`);
    } catch (error) {
      logError(`Table ${table} test failed: ${error.message}`);
      return false;
    }
  }

  // Step 5: Test communication functions
  log('\n⚙️  Step 5: Testing Communication Functions', 'bold');
  
  try {
    // Test get_user_channels function
    const { data: channels, error: channelsError } = await supabase
      .rpc('get_user_channels', {
        p_user_id: TEST_CONFIG.testUserId
      });
    
    if (channelsError) {
      logWarning(`get_user_channels function failed: ${channelsError.message}`);
      logInfo('This might be due to auth.users table structure differences');
      logInfo('The function will be fixed automatically...');
      
      // Try to fix the function by running the fix script
      try {
        const fs = require('fs');
        const fixScript = fs.readFileSync('scripts/fix-supabase-functions.sql', 'utf8');
        
        // Split the script into individual statements
        const statements = fixScript.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            const { error: fixError } = await supabase.rpc('exec_sql', { sql: statement });
            if (fixError) {
              logWarning(`Fix statement failed: ${fixError.message}`);
            }
          }
        }
        
        logInfo('Function fix attempted. Retrying...');
        
        // Retry the function call
        const { data: channelsRetry, error: channelsRetryError } = await supabase
          .rpc('get_user_channels', {
            p_user_id: TEST_CONFIG.testUserId
          });
        
        if (channelsRetryError) {
          logError(`get_user_channels function still failed after fix: ${channelsRetryError.message}`);
          return false;
        }
        
        logSuccess(`get_user_channels function works after fix - found ${channelsRetry.length} channels`);
      } catch (fixError) {
        logError(`Failed to fix function: ${fixError.message}`);
        return false;
      }
    } else {
      logSuccess(`get_user_channels function works - found ${channels.length} channels`);
    }
    
    // Test get_channel_messages function
    const { data: messages, error: messagesError } = await supabase
      .rpc('get_channel_messages', {
        p_channel_id: TEST_CONFIG.testChannelId,
        p_user_id: TEST_CONFIG.testUserId,
        p_limit: 5,
        p_offset: 0
      });
    
    if (messagesError) {
      logError(`get_channel_messages function failed: ${messagesError.message}`);
      return false;
    }
    
    logSuccess(`get_channel_messages function works - found ${messages.length} messages`);
    
  } catch (error) {
    logError(`Function tests failed: ${error.message}`);
    return false;
  }

  // Step 6: Test data operations
  log('\n📝 Step 6: Testing Data Operations', 'bold');
  
  try {
    // Test creating a message
    const testMessage = {
      channel_id: TEST_CONFIG.testChannelId,
      sender_id: TEST_CONFIG.testUserId,
      content: `Test message created at ${new Date().toISOString()}`,
      message_type: 'text',
      created_at: new Date().toISOString()
    };
    
    const { data: createdMessage, error: createError } = await supabase
      .from('mlm_messages')
      .insert([testMessage])
      .select()
      .single();
    
    if (createError) {
      logError(`Failed to create test message: ${createError.message}`);
      return false;
    }
    
    logSuccess(`Test message created with ID: ${createdMessage.id}`);
    
    // Clean up test message
    const { error: deleteError } = await supabase
      .from('mlm_messages')
      .delete()
      .eq('id', createdMessage.id);
    
    if (deleteError) {
      logWarning(`Failed to clean up test message: ${deleteError.message}`);
    } else {
      logSuccess('Test message cleaned up successfully');
    }
    
  } catch (error) {
    logError(`Data operations test failed: ${error.message}`);
    return false;
  }

  // All tests passed
  log('\n🎉 All Tests Passed!', 'bold');
  log('=' .repeat(50), 'green');
  logSuccess('Supabase connection is working perfectly');
  logSuccess('Communication database is ready for use');
  logInfo('You can now use the MLM communication system');
  
  return true;
}

// Run the test
if (require.main === module) {
  testSupabaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logError(`Test script failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testSupabaseConnection };