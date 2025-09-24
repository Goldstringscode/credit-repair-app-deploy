#!/usr/bin/env node

/**
 * SMS Setup Test Script
 * This script tests if your Twilio credentials are working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Testing SMS Setup...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('   Run: node setup-twilio.js');
  process.exit(1);
}

// Read environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Check required variables
const requiredVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
const missingVars = requiredVars.filter(varName => !envVars[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\n   Run: node setup-twilio.js');
  process.exit(1);
}

// Validate format
console.log('✅ Environment variables found');

if (!envVars.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  console.log('❌ Invalid Account SID format (should start with "AC")');
  process.exit(1);
}

if (!envVars.TWILIO_PHONE_NUMBER.startsWith('+')) {
  console.log('❌ Invalid phone number format (should start with "+")');
  process.exit(1);
}

if (envVars.TWILIO_AUTH_TOKEN.length < 20) {
  console.log('❌ Auth token seems too short');
  process.exit(1);
}

console.log('✅ Environment variables format looks correct');

// Test Twilio connection
console.log('\n🔌 Testing Twilio connection...');

const twilio = require('twilio');
const client = twilio(envVars.TWILIO_ACCOUNT_SID, envVars.TWILIO_AUTH_TOKEN);

client.messages.list({ limit: 1 })
  .then(() => {
    console.log('✅ Twilio connection successful!');
    console.log('\n🎉 SMS system is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Go to http://localhost:3000/dashboard/sms');
    console.log('2. Test SMS sending in the "Send SMS" tab');
    console.log('3. Check the "Logs" tab for delivery status');
  })
  .catch(error => {
    console.log('❌ Twilio connection failed:');
    console.log(`   ${error.message}`);
    console.log('\nPlease check your credentials and try again.');
    console.log('Run: node setup-twilio.js');
  });
