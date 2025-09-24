#!/usr/bin/env node

const http = require('http');

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
            error: 'Invalid JSON response',
            headers: res.headers
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

async function testBillingEndpointsWithoutAuth() {
  console.log('🧪 Testing Billing API Endpoints without Authentication...\n');

  // Test billing overview (should work without auth)
  try {
    const response = await makeRequest('/api/billing/user/overview');
    if (response.status === 200 && response.data?.success) {
      logTest('Billing Overview API (No Auth)', 'PASS');
    } else {
      logTest('Billing Overview API (No Auth)', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Billing Overview API (No Auth)', 'FAIL', error.message);
  }

  // Test plans API (should work without auth)
  try {
    const response = await makeRequest('/api/billing/user/plans');
    if (response.status === 200 && response.data?.success) {
      logTest('Plans API (No Auth)', 'PASS');
    } else {
      logTest('Plans API (No Auth)', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Plans API (No Auth)', 'FAIL', error.message);
  }

  // Test subscription API (should require auth)
  try {
    const response = await makeRequest('/api/billing/user/subscription');
    if (response.status === 401) {
      logTest('Subscription API (Auth Required)', 'PASS', 'Correctly requires authentication');
    } else {
      logTest('Subscription API (Auth Required)', 'FAIL', `Expected 401, got ${response.status}`);
    }
  } catch (error) {
    logTest('Subscription API (Auth Required)', 'FAIL', error.message);
  }

  // Test payments API (should require auth)
  try {
    const response = await makeRequest('/api/billing/user/payments');
    if (response.status === 401) {
      logTest('Payments API (Auth Required)', 'PASS', 'Correctly requires authentication');
    } else {
      logTest('Payments API (Auth Required)', 'FAIL', `Expected 401, got ${response.status}`);
    }
  } catch (error) {
    logTest('Payments API (Auth Required)', 'FAIL', error.message);
  }

  // Test cards API (should require auth)
  try {
    const response = await makeRequest('/api/billing/user/cards');
    if (response.status === 401) {
      logTest('Cards API (Auth Required)', 'PASS', 'Correctly requires authentication');
    } else {
      logTest('Cards API (Auth Required)', 'FAIL', `Expected 401, got ${response.status}`);
    }
  } catch (error) {
    logTest('Cards API (Auth Required)', 'FAIL', error.message);
  }

  // Test mail payments API (should require auth)
  try {
    const response = await makeRequest('/api/billing/user/mail-payments');
    if (response.status === 401) {
      logTest('Mail Payments API (Auth Required)', 'PASS', 'Correctly requires authentication');
    } else {
      logTest('Mail Payments API (Auth Required)', 'FAIL', `Expected 401, got ${response.status}`);
    }
  } catch (error) {
    logTest('Mail Payments API (Auth Required)', 'FAIL', error.message);
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

async function testServerHealth() {
  console.log('🏥 Testing Server Health...\n');

  try {
    const response = await makeRequest('/api/health');
    if (response.status === 200 && response.data?.status === 'healthy') {
      logTest('Server Health', 'PASS');
    } else {
      logTest('Server Health', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Server Health', 'FAIL', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Billing System Tests\n');
  console.log(`Testing against: ${config.baseUrl}\n`);

  // Test server health first
  await testServerHealth();
  
  // Test billing endpoints
  await testBillingEndpointsWithoutAuth();
  
  // Test billing page
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
    console.log('\n📝 Note: Some endpoints require authentication (401 responses are expected)');
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
