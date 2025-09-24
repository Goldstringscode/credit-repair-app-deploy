#!/usr/bin/env node

/**
 * MLM Email Integration Test Script
 * This script tests all integrated email functions in the MLM system
 */

import { 
  sendWelcomeEmail,
  sendTeamJoinEmail,
  sendTeamCreationEmail,
  sendCommissionEarnedEmail,
  sendRankAdvancementEmail,
  sendNewTeamMemberEmail,
  sendPayoutProcessedEmail,
  sendTrainingCompletionEmail,
  sendTaskCompletionEmail
} from '../lib/email-service.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAllEmailFunctions() {
  console.log('🧪 Testing All MLM Email Functions\n');
  
  const testData = {
    email: 'test@example.com',
    name: 'Test User',
    teamCode: 'TEST123',
    sponsorName: 'Test Sponsor',
    dashboardLink: 'http://localhost:3001/mlm/dashboard'
  };

  const tests = [
    {
      name: 'Welcome Email',
      fn: () => sendWelcomeEmail({
        to: testData.email,
        name: testData.name,
        teamCode: testData.teamCode,
        dashboardLink: testData.dashboardLink
      })
    },
    {
      name: 'Team Join Email',
      fn: () => sendTeamJoinEmail({
        to: testData.email,
        name: testData.name,
        teamCode: testData.teamCode,
        sponsorName: testData.sponsorName,
        dashboardLink: testData.dashboardLink
      })
    },
    {
      name: 'Team Creation Email',
      fn: () => sendTeamCreationEmail({
        to: testData.email,
        name: testData.name,
        teamCode: testData.teamCode,
        dashboardLink: testData.dashboardLink
      })
    },
    {
      name: 'Commission Earned Email',
      fn: () => sendCommissionEarnedEmail({
        to: testData.email,
        name: testData.name,
        amount: 150.75,
        type: 'direct_referral',
        level: 1,
        totalEarnings: 1250.50,
        dashboardLink: testData.dashboardLink
      })
    },
    {
      name: 'Rank Advancement Email',
      fn: () => sendRankAdvancementEmail({
        to: testData.email,
        name: testData.name,
        oldRank: 'Associate',
        newRank: 'Consultant',
        benefits: [
          'Higher commission rates',
          'Leadership bonuses',
          'Advanced training access',
          'Team management tools'
        ],
        dashboardLink: testData.dashboardLink
      })
    },
    {
      name: 'New Team Member Email',
      fn: () => sendNewTeamMemberEmail({
        to: 'sponsor@example.com',
        sponsorName: testData.sponsorName,
        newMemberName: testData.name,
        newMemberEmail: testData.email,
        teamCode: testData.teamCode,
        dashboardLink: testData.dashboardLink
      })
    },
    {
      name: 'Payout Processed Email',
      fn: () => sendPayoutProcessedEmail({
        to: testData.email,
        name: testData.name,
        amount: 500.00,
        method: 'bank_account',
        transactionId: 'TXN123456789',
        dashboardLink: testData.dashboardLink
      })
    },
    {
      name: 'Training Completion Email',
      fn: () => sendTrainingCompletionEmail({
        to: testData.email,
        name: testData.name,
        courseName: 'MLM Fundamentals',
        pointsEarned: 150,
        nextCourse: 'Advanced Sales Techniques',
        dashboardLink: testData.dashboardLink
      })
    },
    {
      name: 'Task Completion Email',
      fn: () => sendTaskCompletionEmail({
        to: testData.email,
        name: testData.name,
        taskName: 'Complete Profile Setup',
        pointsEarned: 50,
        nextTask: 'Connect with Sponsor',
        dashboardLink: testData.dashboardLink
      })
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`📧 Testing ${test.name}...`);
      await test.fn();
      console.log(`✅ ${test.name} - SUCCESS\n`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name} - FAILED: ${error.message}\n`);
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
testAllEmailFunctions().catch(console.error);
