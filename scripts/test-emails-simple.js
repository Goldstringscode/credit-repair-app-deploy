#!/usr/bin/env node

/**
 * Simple Email Test Script
 * Tests email functionality via API endpoints
 */

const https = require('https');
const http = require('http');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3001';

async function makeRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testEmailFunction(testName, endpoint, data) {
  try {
    console.log(`📧 Testing ${testName}...`);
    const result = await makeRequest(endpoint, data);
    
    if (result.status === 200) {
      console.log(`✅ ${testName} - SUCCESS`);
      console.log(`   Message ID: ${result.data.messageId || 'N/A'}\n`);
      return true;
    } else {
      console.log(`❌ ${testName} - FAILED`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Error: ${result.data.error || 'Unknown error'}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${testName} - ERROR: ${error.message}\n`);
    return false;
  }
}

async function testAllEmails() {
  console.log('🧪 Testing All MLM Email Functions via API\n');
  
  const tests = [
    {
      name: 'Welcome Email',
      endpoint: '/api/test-emails/welcome',
      data: {
        email: 'test@example.com',
        name: 'Test User',
        teamCode: 'TEST123',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      }
    },
    {
      name: 'Team Join Email',
      endpoint: '/api/test-emails/team-join',
      data: {
        email: 'test@example.com',
        name: 'Test User',
        teamCode: 'TEST123',
        sponsorName: 'Test Sponsor',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      }
    },
    {
      name: 'Team Creation Email',
      endpoint: '/api/test-emails/team-creation',
      data: {
        email: 'test@example.com',
        name: 'Test User',
        teamCode: 'TEST123',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      }
    },
    {
      name: 'Commission Earned Email',
      endpoint: '/api/test-emails/commission-earned',
      data: {
        email: 'test@example.com',
        name: 'Test User',
        amount: 150.75,
        type: 'direct_referral',
        level: 1,
        totalEarnings: 1250.50,
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      }
    },
    {
      name: 'Rank Advancement Email',
      endpoint: '/api/test-emails/rank-advancement',
      data: {
        email: 'test@example.com',
        name: 'Test User',
        oldRank: 'Associate',
        newRank: 'Consultant',
        benefits: ['Higher commission rates', 'Leadership bonuses', 'Advanced training access'],
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      }
    },
    {
      name: 'New Team Member Email',
      endpoint: '/api/test-emails/new-team-member',
      data: {
        email: 'sponsor@example.com',
        sponsorName: 'Test Sponsor',
        newMemberName: 'Test User',
        newMemberEmail: 'test@example.com',
        teamCode: 'TEST123',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      }
    },
    {
      name: 'Payout Processed Email',
      endpoint: '/api/test-emails/payout-processed',
      data: {
        email: 'test@example.com',
        name: 'Test User',
        amount: 500.00,
        method: 'bank_account',
        transactionId: 'TXN123456789',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      }
    },
    {
      name: 'Training Completion Email',
      endpoint: '/api/test-emails/training-completion',
      data: {
        email: 'test@example.com',
        name: 'Test User',
        courseName: 'MLM Fundamentals',
        pointsEarned: 150,
        nextCourse: 'Advanced Sales Techniques',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      }
    },
    {
      name: 'Task Completion Email',
      endpoint: '/api/test-emails/task-completion',
      data: {
        email: 'test@example.com',
        name: 'Test User',
        taskName: 'Complete Profile Setup',
        pointsEarned: 50,
        nextTask: 'Connect with Sponsor',
        dashboardLink: 'http://localhost:3001/mlm/dashboard'
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const success = await testEmailFunction(test.name, test.endpoint, test.data);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All email functions are working perfectly!');
  } else {
    console.log('\n⚠️  Some email functions need attention.');
  }
}

// Run the tests
testAllEmails().catch(console.error);
