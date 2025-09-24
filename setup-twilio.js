#!/usr/bin/env node

/**
 * Twilio Setup Script for CreditAI Pro
 * This script helps you configure Twilio credentials for the SMS system
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(process.cwd(), '.env.local');

console.log('📱 Twilio SMS Setup for CreditAI Pro');
console.log('=====================================\n');

console.log('This script will help you configure Twilio credentials for the SMS system.');
console.log('You can get these credentials from: https://console.twilio.com\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupTwilio() {
  try {
    // Check if .env.local exists
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ Found existing .env.local file\n');
    } else {
      console.log('📝 Creating new .env.local file\n');
    }

    // Get Twilio credentials
    console.log('Please enter your Twilio credentials:');
    console.log('(You can find these at https://console.twilio.com)\n');

    const accountSid = await askQuestion('Account SID (starts with AC...): ');
    if (!accountSid.startsWith('AC')) {
      console.log('❌ Invalid Account SID. It should start with "AC"');
      process.exit(1);
    }

    const authToken = await askQuestion('Auth Token: ');
    if (!authToken || authToken.length < 20) {
      console.log('❌ Invalid Auth Token. Please check your credentials.');
      process.exit(1);
    }

    const phoneNumber = await askQuestion('Twilio Phone Number (e.g., +1234567890): ');
    if (!phoneNumber.startsWith('+')) {
      console.log('❌ Invalid phone number. It should start with "+"');
      process.exit(1);
    }

    // Update or create .env.local
    const twilioConfig = `
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=${accountSid}
TWILIO_AUTH_TOKEN=${authToken}
TWILIO_PHONE_NUMBER=${phoneNumber}

# Optional SMS Settings
SMS_FROM_NUMBER=${phoneNumber}
SMS_RATE_LIMIT=100
SMS_DAILY_LIMIT=1000`;

    // Remove existing Twilio config if present
    const lines = envContent.split('\n');
    const filteredLines = lines.filter(line => 
      !line.startsWith('TWILIO_') && 
      !line.startsWith('SMS_') &&
      line.trim() !== ''
    );

    // Add new Twilio config
    const newEnvContent = [...filteredLines, twilioConfig].join('\n');

    fs.writeFileSync(envPath, newEnvContent);

    console.log('\n✅ Twilio credentials configured successfully!');
    console.log('\n📋 Configuration Summary:');
    console.log(`   Account SID: ${accountSid}`);
    console.log(`   Phone Number: ${phoneNumber}`);
    console.log(`   Auth Token: ${'*'.repeat(authToken.length)}`);

    console.log('\n🚀 Next Steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Go to http://localhost:3000/dashboard/sms');
    console.log('3. Test SMS sending in the "Send SMS" tab');
    console.log('4. Check the "Logs" tab for delivery status');

    console.log('\n📚 For more help, see: TWILIO_SETUP_GUIDE.md');

  } catch (error) {
    console.error('❌ Error setting up Twilio:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
setupTwilio();
