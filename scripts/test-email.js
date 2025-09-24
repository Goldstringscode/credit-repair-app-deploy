#!/usr/bin/env node

/**
 * Email Test Script for Credit Repair App
 * This script tests the email configuration
 */

const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testEmailConfiguration() {
  console.log('📧 Testing Email Configuration\n');
  
  // Check environment variables
  console.log('🔍 Checking environment variables:');
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'Not set'}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || 'Not set'}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER || 'Not set'}`);
  console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'Not set'}`);
  console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || 'Not set'}`);
  console.log(`   FROM_NAME: ${process.env.FROM_NAME || 'Not set'}\n`);
  
  // Validate configuration
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Email configuration incomplete!');
    console.log('📋 Please create a .env.local file with your Gmail credentials:');
    console.log(`
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Credit Repair App
    `);
    return;
  }
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  // Test connection
  console.log('🔌 Testing SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
  } catch (error) {
    console.log('❌ SMTP connection failed:');
    console.log(`   Error: ${error.message}\n`);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Troubleshooting tips:');
      console.log('   1. Make sure you\'re using an App Password, not your regular password');
      console.log('   2. Enable 2-Factor Authentication on your Google account');
      console.log('   3. Generate a new App Password: Google Account > Security > 2-Step Verification > App passwords');
    }
    return;
  }
  
  // Send test email
  console.log('📤 Sending test email...');
  const testEmail = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: process.env.SMTP_USER, // Send to yourself
    subject: 'Test Email from Credit Repair App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Email Test Successful!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello!</p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This is a test email from your Credit Repair App. If you're receiving this, 
            your email configuration is working correctly!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0;">Configuration Details:</h3>
            <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
            <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</p>
            <p><strong>From Email:</strong> ${process.env.FROM_EMAIL}</p>
            <p><strong>From Name:</strong> ${process.env.FROM_NAME}</p>
            <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}\n`);
    
    console.log('🎉 Email configuration is working perfectly!');
    console.log('📧 You can now use the invite functionality in your app.');
    
  } catch (error) {
    console.log('❌ Failed to send test email:');
    console.log(`   Error: ${error.message}\n`);
  }
}

// Run the test
testEmailConfiguration().catch(console.error);

