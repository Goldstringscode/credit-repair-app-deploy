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
            headers: res.headers,
            cookies: res.headers['set-cookie']
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            error: 'Invalid JSON response',
            headers: res.headers,
            cookies: res.headers['set-cookie']
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

async function loginDemoUser() {
  console.log('🔐 Logging in demo user...\n');
  
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'demo@example.com',
        password: 'demo123'
      }
    });
    
    if (response.status === 200 && response.data?.success) {
      logTest('Demo Login', 'PASS');
      return response.cookies || [];
    } else {
      logTest('Demo Login', 'FAIL', `Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
      return [];
    }
  } catch (error) {
    logTest('Demo Login', 'FAIL', error.message);
    return [];
  }
}

async function testBillingEndpointsWithAuth(cookies) {
  console.log('\n🧪 Testing Billing API Endpoints with Authentication...\n');

  const authHeaders = {};
  if (cookies && cookies.length > 0) {
    authHeaders['Cookie'] = cookies.join('; ');
  }

  // Test billing overview
  try {
    const response = await makeRequest('/api/billing/user/overview', {
      headers: authHeaders
    });
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
    const response = await makeRequest('/api/billing/user/plans', {
      headers: authHeaders
    });
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
    const response = await makeRequest('/api/billing/user/subscription', {
      headers: authHeaders
    });
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
    const response = await makeRequest('/api/billing/user/payments', {
      headers: authHeaders
    });
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
    const response = await makeRequest('/api/billing/user/cards', {
      headers: authHeaders
    });
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
    const response = await makeRequest('/api/billing/user/mail-payments', {
      headers: authHeaders
    });
    if (response.status === 200 && response.data?.success) {
      logTest('Mail Payments API', 'PASS');
    } else {
      logTest('Mail Payments API', 'FAIL', `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Mail Payments API', 'FAIL', error.message);
  }

  // Test change plan API
  try {
    const response = await makeRequest('/api/billing/user/change-plan', {
      method: 'POST',
      headers: authHeaders,
      body: {
        subscriptionId: 'sub_demo_123',
        newPlanId: 'premium',
        changeType: 'immediate'
      }
    });
    if (response.status === 200 && response.data?.success) {
      logTest('Change Plan API', 'PASS');
    } else {
      logTest('Change Plan API', 'FAIL', `Status: ${response.status}, Message: ${response.data?.message || 'Unknown error'}`);
    }
  } catch (error) {
    logTest('Change Plan API', 'FAIL', error.message);
  }

  // Test export payments API
  try {
    const response = await makeRequest('/api/billing/user/export-payments', {
      method: 'POST',
      headers: authHeaders,
      body: {
        format: 'pdf',
        filters: {}
      }
    });
    if (response.status === 200 && response.data?.success) {
      logTest('Export Payments API', 'PASS');
    } else {
      logTest('Export Payments API', 'FAIL', `Status: ${response.status}, Message: ${response.data?.message || 'Unknown error'}`);
    }
  } catch (error) {
    logTest('Export Payments API', 'FAIL', error.message);
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
  console.log('🚀 Starting Billing System Tests with Authentication\n');
  console.log(`Testing against: ${config.baseUrl}\n`);

  // First, login to get authentication cookies
  const cookies = await loginDemoUser();
  
  if (cookies.length === 0) {
    console.log('❌ Could not login demo user. Testing without authentication...\n');
  }

  // Test billing endpoints with authentication
  await testBillingEndpointsWithAuth(cookies);
  
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
    console.log('🎉 ALL TESTS PASSED! Billing system is working correctly with authentication.');
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
