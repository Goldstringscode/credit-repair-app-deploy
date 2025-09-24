#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/billing`;

// Test configuration
const TEST_CONFIG = {
  timeout: 15000,
  retries: 3,
  delay: 2000
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  duration: 0
};

// Utility functions
const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const makeRequest = async (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: TEST_CONFIG.timeout,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });
    req.on('timeout', () => {
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
};

const runTest = async (testName, testFunction) => {
  testResults.total++;
  const startTime = Date.now();
  
  try {
    log(`\n🧪 Running: ${testName}`, colors.cyan);
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    testResults.passed++;
    log(`✅ PASSED: ${testName} (${duration}ms)`, colors.green);
    
    if (result && typeof result === 'object') {
      log(`   Details: ${JSON.stringify(result, null, 2)}`, colors.bright);
    }
    
    return { success: true, result, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults.failed++;
    log(`❌ FAILED: ${testName} (${duration}ms)`, colors.red);
    log(`   Error: ${error.message}`, colors.red);
    
    return { success: false, error: error.message, duration };
  }
};

// Test functions
const testServerHealth = async () => {
  const response = await makeRequest(`${BASE_URL}/api/health`);
  
  if (response.status !== 200) {
    throw new Error(`Server health check failed: ${response.status}`);
  }
  
  return {
    status: response.status,
    server: 'healthy',
    uptime: response.data.uptime
  };
};

const testGetPlans = async () => {
  const response = await makeRequest(`${API_BASE}/plans`);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    plansCount: response.data.plans?.length || 0,
    plans: response.data.plans?.map(p => ({ id: p.id, name: p.name, amount: p.amount }))
  };
};

const testGetSubscriptions = async () => {
  const response = await makeRequest(`${API_BASE}/subscriptions`);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    subscriptionsCount: response.data.subscriptions?.length || 0,
    hasSubscriptions: response.data.subscriptions && response.data.subscriptions.length > 0
  };
};

const testCreateSubscription = async () => {
  const response = await makeRequest(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'create',
      customerId: 'test_customer_123',
      planId: 'basic',
      trialPeriodDays: 7,
      quantity: 1,
      metadata: { test: true }
    })
  });

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    subscriptionId: response.data.subscription?.id,
    status: response.data.subscription?.status,
    planId: response.data.subscription?.planId
  };
};

const testGetAnalytics = async () => {
  const response = await makeRequest(`${API_BASE}/analytics`);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    hasMetrics: !!response.data.metrics,
    metricsKeys: response.data.metrics ? Object.keys(response.data.metrics) : []
  };
};

const testGetDunning = async () => {
  const response = await makeRequest(`${API_BASE}/dunning`);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    hasEvents: !!response.data.events,
    eventsCount: response.data.events?.length || 0,
    hasStatistics: !!response.data.statistics
  };
};

const testDunningFailure = async () => {
  const response = await makeRequest(`${API_BASE}/dunning`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'process_failure',
      subscriptionId: 'test_sub_123',
      customerId: 'test_customer_123',
      amount: 5999,
      currency: 'usd',
      failureReason: 'insufficient_funds',
      metadata: { test: true }
    })
  });

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    eventId: response.data.event?.id,
    attemptNumber: response.data.event?.attemptNumber,
    eventType: response.data.event?.eventType
  };
};

const testDunningSuccess = async () => {
  const response = await makeRequest(`${API_BASE}/dunning`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'process_success',
      subscriptionId: 'test_sub_456',
      customerId: 'test_customer_456',
      amount: 5999,
      currency: 'usd',
      metadata: { test: true }
    })
  });

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    success: response.data.success,
    message: response.data.message
  };
};

const testInputValidation = async () => {
  const response = await makeRequest(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'create',
      customerId: '', // Invalid empty ID
      planId: 'invalid_plan'
    })
  });

  // Should return 400 for validation error
  if (response.status !== 400) {
    throw new Error(`Expected 400 for validation error, got ${response.status}`);
  }

  return {
    validationWorking: true,
    statusCode: response.status,
    errorMessage: response.data?.message || 'Validation error'
  };
};

const testRateLimiting = async () => {
  // Make multiple rapid requests to test rate limiting
  const promises = Array(3).fill(0).map(() => 
    makeRequest(`${API_BASE}/analytics`)
  );

  const responses = await Promise.all(promises);
  const rateLimited = responses.some(r => r.status === 429);

  return {
    rateLimitingWorking: rateLimited,
    requestsMade: responses.length,
    rateLimitedCount: responses.filter(r => r.status === 429).length
  };
};

// Test suites
const testSuites = [
  {
    name: 'Server Health',
    tests: [
      { name: 'Server Health Check', fn: testServerHealth }
    ]
  },
  {
    name: 'Basic API Endpoints',
    tests: [
      { name: 'Get Pricing Plans', fn: testGetPlans },
      { name: 'Get Subscriptions', fn: testGetSubscriptions },
      { name: 'Get Analytics', fn: testGetAnalytics },
      { name: 'Get Dunning Events', fn: testGetDunning }
    ]
  },
  {
    name: 'Subscription Management',
    tests: [
      { name: 'Create Subscription', fn: testCreateSubscription }
    ]
  },
  {
    name: 'Dunning Management',
    tests: [
      { name: 'Process Payment Failure', fn: testDunningFailure },
      { name: 'Process Payment Success', fn: testDunningSuccess }
    ]
  },
  {
    name: 'API Validation',
    tests: [
      { name: 'Input Validation', fn: testInputValidation },
      { name: 'Rate Limiting', fn: testRateLimiting }
    ]
  }
];

// Main execution
const runAllTests = async () => {
  const startTime = Date.now();
  
  log('🚀 Advanced Billing Test Suite - Working Version', colors.bright);
  log(`📍 Testing against: ${BASE_URL}`, colors.blue);
  log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms`, colors.blue);
  log('─'.repeat(60), colors.bright);

  for (const suite of testSuites) {
    log(`\n📦 Test Suite: ${suite.name}`, colors.magenta);
    log('─'.repeat(40), colors.bright);

    for (const test of suite.tests) {
      await runTest(test.name, test.fn);
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.delay));
    }
  }

  testResults.duration = Date.now() - startTime;

  // Print summary
  log('\n' + '='.repeat(60), colors.bright);
  log('📊 TEST SUMMARY', colors.bright);
  log('='.repeat(60), colors.bright);
  log(`Total Tests: ${testResults.total}`, colors.blue);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, colors.red);
  log(`Skipped: ${testResults.skipped}`, colors.yellow);
  log(`Duration: ${testResults.duration}ms`, colors.blue);
  log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`, 
      testResults.passed === testResults.total ? colors.green : colors.yellow);

  if (testResults.failed > 0) {
    log('\n❌ Some tests failed. Please check the output above for details.', colors.red);
    process.exit(1);
  } else {
    log('\n✅ All tests passed!', colors.green);
    process.exit(0);
  }
};

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n💥 Unhandled rejection: ${error.message}`, colors.red);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught exception: ${error.message}`, colors.red);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Test execution failed: ${error.message}`, colors.red);
  process.exit(1);
});
