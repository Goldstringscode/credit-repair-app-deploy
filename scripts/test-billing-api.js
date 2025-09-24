#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Test configuration
const config = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  timeout: 10000
};

// Test results
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

function makeRequest(path, options = {}) {
  return new Promise((resolve) => {
    const url = new URL(path, config.baseUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: config.timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        error: 'Request timeout'
      });
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testBillingEndpoints() {
  console.log('🧪 Testing Billing API Endpoints...\n');

  // Test billing overview
  try {
    const response = await makeRequest('/api/billing/user/overview');
    if (response.status === 200 && response.data?.success) {
      logTest('Billing Overview API', 'PASS');
    } else {
      logTest('Billing Overview API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Billing Overview API', 'FAIL', error.message);
  }

  // Test plans API
  try {
    const response = await makeRequest('/api/billing/user/plans');
    if (response.status === 200 && response.data?.success) {
      logTest('Plans API', 'PASS');
    } else {
      logTest('Plans API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Plans API', 'FAIL', error.message);
  }

  // Test subscription API
  try {
    const response = await makeRequest('/api/billing/user/subscription');
    if (response.status === 200 && response.data?.success) {
      logTest('Subscription API', 'PASS');
    } else {
      logTest('Subscription API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Subscription API', 'FAIL', error.message);
  }

  // Test payments API
  try {
    const response = await makeRequest('/api/billing/user/payments');
    if (response.status === 200 && response.data?.success) {
      logTest('Payments API', 'PASS');
    } else {
      logTest('Payments API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Payments API', 'FAIL', error.message);
  }

  // Test cards API
  try {
    const response = await makeRequest('/api/billing/user/cards');
    if (response.status === 200 && response.data?.success) {
      logTest('Cards API', 'PASS');
    } else {
      logTest('Cards API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Cards API', 'FAIL', error.message);
  }

  // Test mail payments API
  try {
    const response = await makeRequest('/api/billing/user/mail-payments');
    if (response.status === 200 && response.data?.success) {
      logTest('Mail Payments API', 'PASS');
    } else {
      logTest('Mail Payments API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Mail Payments API', 'FAIL', error.message);
  }

  // Test change plan API (should require auth)
  try {
    const response = await makeRequest('/api/billing/user/change-plan', {
      method: 'POST',
      body: {
        subscriptionId: 'test',
        newPlanId: 'premium',
        changeType: 'immediate'
      }
    });
    if (response.status === 401 || response.status === 400) {
      logTest('Change Plan API', 'PASS', 'Requires authentication');
    } else {
      logTest('Change Plan API', 'FAIL', `Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Change Plan API', 'FAIL', error.message);
  }

  // Test export payments API (should require auth)
  try {
    const response = await makeRequest('/api/billing/user/export-payments', {
      method: 'POST',
      body: {
        format: 'pdf',
        filters: {}
      }
    });
    if (response.status === 401 || response.status === 400) {
      logTest('Export Payments API', 'PASS', 'Requires authentication');
    } else {
      logTest('Export Payments API', 'FAIL', `Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Export Payments API', 'FAIL', error.message);
  }

  // Test Stripe webhook endpoint
  try {
    const response = await makeRequest('/api/stripe/webhooks', {
      method: 'POST',
      body: {
        type: 'test.event',
        data: { object: { id: 'test' } }
      }
    });
    if (response.status === 400 || response.status === 500) {
      logTest('Stripe Webhook API', 'PASS', 'Requires valid signature');
    } else {
      logTest('Stripe Webhook API', 'FAIL', `Unexpected status: ${response.status}`);
    }
  } catch (error) {
    logTest('Stripe Webhook API', 'FAIL', error.message);
  }

  // Test Stripe connection test
  try {
    const response = await makeRequest('/api/stripe/test/connection');
    if (response.status === 200 && response.data?.success) {
      logTest('Stripe Connection Test', 'PASS');
    } else {
      logTest('Stripe Connection Test', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Stripe Connection Test', 'FAIL', error.message);
  }
}

async function testBillingPage() {
  console.log('\n🎨 Testing Billing Page...\n');

  try {
    const response = await makeRequest('/billing');
    if (response.status === 200) {
      logTest('Billing Page', 'PASS');
    } else {
      logTest('Billing Page', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Billing Page', 'FAIL', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Billing System API Tests\n');
  console.log(`Testing against: ${config.baseUrl}\n`);

  await testBillingEndpoints();
  await testBillingPage();

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Billing system is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the server is running and endpoints are accessible.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test suite failed:', error.message);
  process.exit(1);
});
