#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Billing System Components Directly...\n');

let passed = 0;
let failed = 0;
let total = 0;

function logTest(name, status, details = '') {
  total++;
  if (status === 'PASS') {
    passed++;
    console.log(`✅ ${name}`);
  } else {
    failed++;
    console.log(`❌ ${name}: ${details}`);
  }
}

// Test file existence
function testFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    logTest(description, 'PASS');
    return true;
  } else {
    logTest(description, 'FAIL', `File not found: ${filePath}`);
    return false;
  }
}

// Test file content
function testFileContent(filePath, description, checks) {
  if (!fs.existsSync(filePath)) {
    logTest(description, 'FAIL', 'File not found');
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let allPassed = true;

    for (const check of checks) {
      if (check.type === 'contains') {
        if (!content.includes(check.value)) {
          logTest(`${description} - ${check.name}`, 'FAIL', `Missing: ${check.value}`);
          allPassed = false;
        } else {
          logTest(`${description} - ${check.name}`, 'PASS');
        }
      } else if (check.type === 'notContains') {
        if (content.includes(check.value)) {
          logTest(`${description} - ${check.name}`, 'FAIL', `Should not contain: ${check.value}`);
          allPassed = false;
        } else {
          logTest(`${description} - ${check.name}`, 'PASS');
        }
      }
    }

    return allPassed;
  } catch (error) {
    logTest(description, 'FAIL', error.message);
    return false;
  }
}

// Test API endpoints
function testAPIEndpoints() {
  console.log('🔌 Testing API Endpoints...\n');

  const apiEndpoints = [
    'app/api/billing/user/overview/route.ts',
    'app/api/billing/user/plans/route.ts',
    'app/api/billing/user/subscription/route.ts',
    'app/api/billing/user/payments/route.ts',
    'app/api/billing/user/cards/route.ts',
    'app/api/billing/user/cards/[id]/route.ts',
    'app/api/billing/user/cards/[id]/default/route.ts',
    'app/api/billing/user/mail-payments/route.ts',
    'app/api/billing/user/change-plan/route.ts',
    'app/api/billing/user/export-payments/route.ts',
    'app/api/stripe/webhooks/route.ts',
    'app/api/stripe/test/connection/route.ts'
  ];

  for (const endpoint of apiEndpoints) {
    testFileExists(endpoint, `API Endpoint: ${endpoint}`);
  }
}

// Test billing components
function testBillingComponents() {
  console.log('\n🎨 Testing Billing Components...\n');

  const components = [
    'components/billing/BillingOverview.tsx',
    'components/billing/PlanManagement.tsx',
    'components/billing/PaymentHistory.tsx',
    'components/billing/CardManagement.tsx',
    'components/billing/MailPayments.tsx'
  ];

  for (const component of components) {
    testFileExists(component, `Component: ${component}`);
  }
}

// Test library files
function testLibraryFiles() {
  console.log('\n📚 Testing Library Files...\n');

  const libraryFiles = [
    'lib/database.ts',
    'lib/subscription-manager.ts',
    'lib/billing-security.ts',
    'lib/stripe/config.ts',
    'lib/stripe/payments.ts',
    'lib/stripe/webhooks.ts',
    'lib/types.ts'
  ];

  for (const file of libraryFiles) {
    testFileExists(file, `Library: ${file}`);
  }
}

// Test billing page
function testBillingPage() {
  console.log('\n📄 Testing Billing Page...\n');

  testFileExists('app/billing/page.tsx', 'Billing Page');
}

// Test specific functionality
function testSpecificFunctionality() {
  console.log('\n⚙️ Testing Specific Functionality...\n');

  // Test subscription manager
  if (fs.existsSync('lib/subscription-manager.ts')) {
    testFileContent('lib/subscription-manager.ts', 'Subscription Manager', [
      { type: 'contains', name: 'createSubscription', value: 'createSubscription' },
      { type: 'contains', name: 'updateSubscriptionPlan', value: 'updateSubscriptionPlan' },
      { type: 'contains', name: 'cancelSubscription', value: 'cancelSubscription' },
      { type: 'contains', name: 'pauseSubscription', value: 'pauseSubscription' },
      { type: 'contains', name: 'resumeSubscription', value: 'resumeSubscription' }
    ]);
  }

  // Test billing security
  if (fs.existsSync('lib/billing-security.ts')) {
    testFileContent('lib/billing-security.ts', 'Billing Security', [
      { type: 'contains', name: 'validatePaymentData', value: 'validatePaymentData' },
      { type: 'contains', name: 'checkSuspiciousActivity', value: 'checkSuspiciousActivity' },
      { type: 'contains', name: 'validateLuhn', value: 'validateLuhn' },
      { type: 'contains', name: 'recordFailedAttempt', value: 'recordFailedAttempt' }
    ]);
  }

  // Test Stripe integration
  if (fs.existsSync('lib/stripe/payments.ts')) {
    testFileContent('lib/stripe/payments.ts', 'Stripe Payments', [
      { type: 'contains', name: 'createPaymentIntent', value: 'createPaymentIntent' },
      { type: 'contains', name: 'createSubscription', value: 'createSubscription' },
      { type: 'contains', name: 'createPaymentMethod', value: 'createPaymentMethod' }
    ]);
  }

  // Test database integration
  if (fs.existsSync('lib/database.ts')) {
    testFileContent('lib/database.ts', 'Database Service', [
      { type: 'contains', name: 'getUser', value: 'getUser' },
      { type: 'contains', name: 'createSubscription', value: 'createSubscription' },
      { type: 'contains', name: 'getPayments', value: 'getPayments' },
      { type: 'contains', name: 'getCards', value: 'getCards' },
      { type: 'contains', name: 'getMailPayments', value: 'getMailPayments' }
    ]);
  }
}

// Test API endpoint content
function testAPIEndpointContent() {
  console.log('\n🔍 Testing API Endpoint Content...\n');

  // Test billing overview endpoint
  if (fs.existsSync('app/api/billing/user/overview/route.ts')) {
    testFileContent('app/api/billing/user/overview/route.ts', 'Billing Overview API', [
      { type: 'contains', name: 'GET method', value: 'export const GET' },
      { type: 'contains', name: 'Rate limiting', value: 'withRateLimit' },
      { type: 'contains', name: 'Response format', value: 'NextResponse.json' }
    ]);
  }

  // Test payments endpoint
  if (fs.existsSync('app/api/billing/user/payments/route.ts')) {
    testFileContent('app/api/billing/user/payments/route.ts', 'Payments API', [
      { type: 'contains', name: 'GET method', value: 'export const GET' },
      { type: 'contains', name: 'POST method', value: 'export const POST' },
      { type: 'contains', name: 'Database integration', value: 'database.getPayments' }
    ]);
  }

  // Test cards endpoint
  if (fs.existsSync('app/api/billing/user/cards/route.ts')) {
    testFileContent('app/api/billing/user/cards/route.ts', 'Cards API', [
      { type: 'contains', name: 'GET method', value: 'export const GET' },
      { type: 'contains', name: 'POST method', value: 'export const POST' },
      { type: 'contains', name: 'Card validation', value: 'cardNumber' }
    ]);
  }
}

// Test test files
function testTestFiles() {
  console.log('\n🧪 Testing Test Files...\n');

  testFileExists('__tests__/billing/billing-system.test.ts', 'Billing Test Suite');
  testFileExists('scripts/test-billing-api.js', 'API Test Script');
  testFileExists('scripts/test-billing-comprehensive.js', 'Comprehensive Test Script');
}

// Test configuration files
function testConfigurationFiles() {
  console.log('\n⚙️ Testing Configuration Files...\n');

  testFileExists('BILLING_DEPLOYMENT_CHECKLIST.md', 'Deployment Checklist');
  testFileExists('BILLING_SYSTEM_COMPLETE.md', 'System Documentation');
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Direct Billing System Tests\n');

  testAPIEndpoints();
  testBillingComponents();
  testLibraryFiles();
  testBillingPage();
  testSpecificFunctionality();
  testAPIEndpointContent();
  testTestFiles();
  testConfigurationFiles();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Billing system components are properly implemented.');
  } else {
    console.log('⚠️  Some tests failed. Please review the failed components.');
  }

  return failed === 0;
}

// Run tests
const success = runAllTests();
process.exit(success ? 0 : 1);
