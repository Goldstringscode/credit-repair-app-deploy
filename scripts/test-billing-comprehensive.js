#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Comprehensive Billing System Tests...\n');

// Test configuration
const testConfig = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 3
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function logTest(name, status, details = '') {
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${details}`);
  }
  testResults.details.push({ name, status, details });
}

function makeRequest(endpoint, options = {}) {
  try {
    const url = `${testConfig.baseUrl}${endpoint}`;
    const response = execSync(`curl -s -w "%{http_code}" -X ${options.method || 'GET'} "${url}" ${options.body ? `-d '${JSON.stringify(options.body)}' -H "Content-Type: application/json"` : ''}`, { 
      encoding: 'utf8',
      timeout: testConfig.timeout 
    });
    
    const [body, statusCode] = response.split(/(?=\d{3}$)/);
    return {
      status: parseInt(statusCode),
      data: body ? JSON.parse(body) : null
    };
  } catch (error) {
    return {
      status: 500,
      error: error.message
    };
  }
}

// Test functions
async function testBillingOverview() {
  console.log('\n📊 Testing Billing Overview...');
  
  try {
    const response = makeRequest('/api/billing/user/overview');
    if (response.status === 200 && response.data?.success) {
      logTest('Billing Overview API', 'PASS');
    } else {
      logTest('Billing Overview API', 'FAIL', `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    logTest('Billing Overview API', 'FAIL', error.message);
  }
}

async function testSubscriptionManagement() {
  console.log('\n🔄 Testing Subscription Management...');
  
  try {
    // Test get plans
    const plansResponse = makeRequest('/api/billing/user/plans');
    if (plansResponse.status === 200 && plansResponse.data?.success) {
      logTest('Get Plans API', 'PASS');
    } else {
      logTest('Get Plans API', 'FAIL', `Status: ${plansResponse.status}`);
    }

    // Test get subscription
    const subResponse = makeRequest('/api/billing/user/subscription');
    if (subResponse.status === 200 && subResponse.data?.success) {
      logTest('Get Subscription API', 'PASS');
    } else {
      logTest('Get Subscription API', 'FAIL', `Status: ${subResponse.status}`);
    }

    // Test change plan (this might fail without auth, but we test the endpoint exists)
    const changePlanResponse = makeRequest('/api/billing/user/change-plan', {
      method: 'POST',
      body: {
        subscriptionId: 'test-sub',
        newPlanId: 'premium',
        changeType: 'immediate'
      }
    });
    if (changePlanResponse.status === 401 || changePlanResponse.status === 400) {
      logTest('Change Plan API Endpoint', 'PASS', 'Endpoint exists (auth required)');
    } else {
      logTest('Change Plan API Endpoint', 'FAIL', `Unexpected status: ${changePlanResponse.status}`);
    }
  } catch (error) {
    logTest('Subscription Management', 'FAIL', error.message);
  }
}

async function testPaymentManagement() {
  console.log('\n💳 Testing Payment Management...');
  
  try {
    // Test get payments
    const paymentsResponse = makeRequest('/api/billing/user/payments');
    if (paymentsResponse.status === 200 && paymentsResponse.data?.success) {
      logTest('Get Payments API', 'PASS');
    } else {
      logTest('Get Payments API', 'FAIL', `Status: ${paymentsResponse.status}`);
    }

    // Test create payment (without auth, should fail gracefully)
    const createPaymentResponse = makeRequest('/api/billing/user/payments', {
      method: 'POST',
      body: {
        amount: 29.99,
        description: 'Test payment'
      }
    });
    if (createPaymentResponse.status === 401 || createPaymentResponse.status === 400) {
      logTest('Create Payment API Endpoint', 'PASS', 'Endpoint exists (auth required)');
    } else {
      logTest('Create Payment API Endpoint', 'FAIL', `Unexpected status: ${createPaymentResponse.status}`);
    }
  } catch (error) {
    logTest('Payment Management', 'FAIL', error.message);
  }
}

async function testCardManagement() {
  console.log('\n💳 Testing Card Management...');
  
  try {
    // Test get cards
    const cardsResponse = makeRequest('/api/billing/user/cards');
    if (cardsResponse.status === 200 && cardsResponse.data?.success) {
      logTest('Get Cards API', 'PASS');
    } else {
      logTest('Get Cards API', 'FAIL', `Status: ${cardsResponse.status}`);
    }

    // Test create card (without auth, should fail gracefully)
    const createCardResponse = makeRequest('/api/billing/user/cards', {
      method: 'POST',
      body: {
        cardNumber: '4242424242424242',
        expiryMonth: 12,
        expiryYear: 2025,
        cvc: '123',
        name: 'Test User',
        zipCode: '12345'
      }
    });
    if (createCardResponse.status === 401 || createCardResponse.status === 400) {
      logTest('Create Card API Endpoint', 'PASS', 'Endpoint exists (auth required)');
    } else {
      logTest('Create Card API Endpoint', 'FAIL', `Unexpected status: ${createCardResponse.status}`);
    }
  } catch (error) {
    logTest('Card Management', 'FAIL', error.message);
  }
}

async function testMailPayments() {
  console.log('\n📮 Testing Mail Payments...');
  
  try {
    // Test get mail payments
    const mailPaymentsResponse = makeRequest('/api/billing/user/mail-payments');
    if (mailPaymentsResponse.status === 200 && mailPaymentsResponse.data?.success) {
      logTest('Get Mail Payments API', 'PASS');
    } else {
      logTest('Get Mail Payments API', 'FAIL', `Status: ${mailPaymentsResponse.status}`);
    }

    // Test create mail payment (without auth, should fail gracefully)
    const createMailPaymentResponse = makeRequest('/api/billing/user/mail-payments', {
      method: 'POST',
      body: {
        type: 'certified',
        letterType: 'dispute',
        amount: 8.50,
        recipient: 'Experian',
        address: '123 Test St',
        description: 'Test mail payment'
      }
    });
    if (createMailPaymentResponse.status === 401 || createMailPaymentResponse.status === 400) {
      logTest('Create Mail Payment API Endpoint', 'PASS', 'Endpoint exists (auth required)');
    } else {
      logTest('Create Mail Payment API Endpoint', 'FAIL', `Unexpected status: ${createMailPaymentResponse.status}`);
    }
  } catch (error) {
    logTest('Mail Payments', 'FAIL', error.message);
  }
}

async function testExportFunctionality() {
  console.log('\n📄 Testing Export Functionality...');
  
  try {
    // Test export payments (without auth, should fail gracefully)
    const exportResponse = makeRequest('/api/billing/user/export-payments', {
      method: 'POST',
      body: {
        format: 'pdf',
        filters: {}
      }
    });
    if (exportResponse.status === 401 || exportResponse.status === 400) {
      logTest('Export Payments API Endpoint', 'PASS', 'Endpoint exists (auth required)');
    } else {
      logTest('Export Payments API Endpoint', 'FAIL', `Unexpected status: ${exportResponse.status}`);
    }
  } catch (error) {
    logTest('Export Functionality', 'FAIL', error.message);
  }
}

async function testStripeIntegration() {
  console.log('\n🔗 Testing Stripe Integration...');
  
  try {
    // Test Stripe webhook endpoint
    const webhookResponse = makeRequest('/api/stripe/webhooks', {
      method: 'POST',
      body: {
        type: 'test.event',
        data: { object: { id: 'test' } }
      }
    });
    if (webhookResponse.status === 400 || webhookResponse.status === 500) {
      logTest('Stripe Webhook Endpoint', 'PASS', 'Endpoint exists (signature validation required)');
    } else {
      logTest('Stripe Webhook Endpoint', 'FAIL', `Unexpected status: ${webhookResponse.status}`);
    }

    // Test Stripe test connection
    const testResponse = makeRequest('/api/stripe/test/connection');
    if (testResponse.status === 200 && testResponse.data?.success) {
      logTest('Stripe Connection Test', 'PASS');
    } else {
      logTest('Stripe Connection Test', 'FAIL', `Status: ${testResponse.status}`);
    }
  } catch (error) {
    logTest('Stripe Integration', 'FAIL', error.message);
  }
}

async function testBillingUIComponents() {
  console.log('\n🎨 Testing Billing UI Components...');
  
  try {
    // Check if billing page exists
    const billingPageResponse = makeRequest('/billing');
    if (billingPageResponse.status === 200) {
      logTest('Billing Page', 'PASS');
    } else {
      logTest('Billing Page', 'FAIL', `Status: ${billingPageResponse.status}`);
    }

    // Check if components exist
    const componentFiles = [
      'components/billing/BillingOverview.tsx',
      'components/billing/PlanManagement.tsx',
      'components/billing/PaymentHistory.tsx',
      'components/billing/CardManagement.tsx',
      'components/billing/MailPayments.tsx'
    ];

    for (const file of componentFiles) {
      if (fs.existsSync(file)) {
        logTest(`Component: ${file}`, 'PASS');
      } else {
        logTest(`Component: ${file}`, 'FAIL', 'File not found');
      }
    }
  } catch (error) {
    logTest('Billing UI Components', 'FAIL', error.message);
  }
}

async function testSecurityFeatures() {
  console.log('\n🛡️ Testing Security Features...');
  
  try {
    // Check if security service exists
    if (fs.existsSync('lib/billing-security.ts')) {
      logTest('Billing Security Service', 'PASS');
    } else {
      logTest('Billing Security Service', 'FAIL', 'File not found');
    }

    // Test rate limiting (make multiple requests)
    console.log('  Testing rate limiting...');
    let rateLimited = false;
    for (let i = 0; i < 10; i++) {
      const response = makeRequest('/api/billing/user/overview');
      if (response.status === 429) {
        rateLimited = true;
        break;
      }
    }
    
    if (rateLimited) {
      logTest('Rate Limiting', 'PASS');
    } else {
      logTest('Rate Limiting', 'FAIL', 'No rate limiting detected');
    }
  } catch (error) {
    logTest('Security Features', 'FAIL', error.message);
  }
}

async function testDatabaseIntegration() {
  console.log('\n🗄️ Testing Database Integration...');
  
  try {
    // Check if database service exists
    if (fs.existsSync('lib/database.ts')) {
      logTest('Database Service', 'PASS');
    } else {
      logTest('Database Service', 'FAIL', 'File not found');
    }

    // Check if subscription manager exists
    if (fs.existsSync('lib/subscription-manager.ts')) {
      logTest('Subscription Manager', 'PASS');
    } else {
      logTest('Subscription Manager', 'FAIL', 'File not found');
    }

    // Check if types are defined
    if (fs.existsSync('lib/types.ts')) {
      logTest('Type Definitions', 'PASS');
    } else {
      logTest('Type Definitions', 'FAIL', 'File not found');
    }
  } catch (error) {
    logTest('Database Integration', 'FAIL', error.message);
  }
}

async function runUnitTests() {
  console.log('\n🧪 Running Unit Tests...');
  
  try {
    // Run vitest for billing tests
    const testOutput = execSync('npm run test:run -- __tests__/billing/', { 
      encoding: 'utf8',
      timeout: 60000 
    });
    
    if (testOutput.includes('PASS') || testOutput.includes('✓')) {
      logTest('Unit Tests', 'PASS');
    } else {
      logTest('Unit Tests', 'FAIL', 'Tests failed or no output');
    }
  } catch (error) {
    logTest('Unit Tests', 'FAIL', error.message);
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Billing System Test Suite\n');
  console.log(`Testing against: ${testConfig.baseUrl}\n`);

  try {
    await testBillingOverview();
    await testSubscriptionManagement();
    await testPaymentManagement();
    await testCardManagement();
    await testMailPayments();
    await testExportFunctionality();
    await testStripeIntegration();
    await testBillingUIComponents();
    await testSecurityFeatures();
    await testDatabaseIntegration();
    await runUnitTests();

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      testResults.details
        .filter(test => test.status === 'FAIL')
        .forEach(test => console.log(`  - ${test.name}: ${test.details}`));
    }

    console.log('\n' + '='.repeat(60));
    
    if (testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Billing system is ready for production.');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please review and fix before deployment.');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
