#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/billing`;

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 3,
  delay: 1000
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

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
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
const testCreateSubscription = async () => {
  const response = await makeRequest(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customerId: 'test_customer_123',
      planId: 'premium',
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

const testUpdateSubscription = async () => {
  // First create a subscription
  const createResponse = await makeRequest(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customerId: 'test_customer_456',
      planId: 'basic',
      quantity: 1
    })
  });

  if (createResponse.status !== 200 || !createResponse.data.success) {
    throw new Error('Failed to create test subscription');
  }

  const subscriptionId = createResponse.data.subscription.id;

  // Now update it
  const updateResponse = await makeRequest(`${API_BASE}/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      planId: 'premium',
      prorationBehavior: 'create_prorations',
      quantity: 2
    })
  });

  if (updateResponse.status !== 200) {
    throw new Error(`Expected 200, got ${updateResponse.status}: ${JSON.stringify(updateResponse.data)}`);
  }

  if (!updateResponse.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(updateResponse.data)}`);
  }

  return {
    subscriptionId: updateResponse.data.subscription?.id,
    newPlanId: updateResponse.data.subscription?.planId,
    proration: updateResponse.data.proration ? 'calculated' : 'none'
  };
};

const testCancelSubscription = async () => {
  // First create a subscription
  const createResponse = await makeRequest(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customerId: 'test_customer_789',
      planId: 'enterprise',
      quantity: 1
    })
  });

  if (createResponse.status !== 200 || !createResponse.data.success) {
    throw new Error('Failed to create test subscription');
  }

  const subscriptionId = createResponse.data.subscription.id;

  // Now cancel it
  const cancelResponse = await makeRequest(`${API_BASE}/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      cancelAtPeriodEnd: true
    })
  });

  if (cancelResponse.status !== 200) {
    throw new Error(`Expected 200, got ${cancelResponse.status}: ${JSON.stringify(cancelResponse.data)}`);
  }

  if (!cancelResponse.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(cancelResponse.data)}`);
  }

  return {
    subscriptionId: cancelResponse.data.subscription?.id,
    cancelAtPeriodEnd: cancelResponse.data.subscription?.cancelAtPeriodEnd
  };
};

const testGetPlans = async () => {
  const response = await makeRequest(`${API_BASE}/subscriptions`);

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

const testDunningAnalytics = async () => {
  const response = await makeRequest(`${API_BASE}/dunning?type=analytics`);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    totalEvents: response.data.analytics?.totalEvents || 0,
    recoveryRate: response.data.analytics?.recoveryRate || 0,
    activeEvents: response.data.analytics?.activeEvents || 0
  };
};

const testBillingMetrics = async () => {
  const response = await makeRequest(`${API_BASE}/analytics?type=metrics`);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    totalRevenue: response.data.metrics?.totalRevenue || 0,
    mrr: response.data.metrics?.monthlyRecurringRevenue || 0,
    churnRate: response.data.metrics?.churnRate || 0,
    paymentSuccessRate: response.data.metrics?.paymentSuccessRate || 0
  };
};

const testGenerateReport = async () => {
  const response = await makeRequest(`${API_BASE}/analytics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'generate_report',
      name: 'Test Report',
      type: 'revenue',
      period: {
        start: '2024-01-01',
        end: '2024-01-31'
      },
      generatedBy: 'test_user'
    })
  });

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    reportId: response.data.report?.id,
    reportType: response.data.report?.type,
    generatedAt: response.data.report?.generatedAt
  };
};

const testRevenueForecast = async () => {
  const response = await makeRequest(`${API_BASE}/analytics?type=forecast&months=12`);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    forecastPoints: response.data.forecast?.length || 0,
    projectedRevenue: response.data.forecast?.[response.data.forecast.length - 1]?.value || 0
  };
};

const testChurnAnalysis = async () => {
  const response = await makeRequest(`${API_BASE}/analytics?type=churn`);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.success) {
    throw new Error(`API returned success: false - ${JSON.stringify(response.data)}`);
  }

  return {
    churnRate: response.data.churnAnalysis?.churnRate || 0,
    churnReasons: response.data.churnAnalysis?.churnReasons?.length || 0,
    retentionCohorts: response.data.churnAnalysis?.retentionCohorts?.length || 0
  };
};

const testInputValidation = async () => {
  const response = await makeRequest(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
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
  const promises = Array(5).fill(0).map(() => 
    makeRequest(`${API_BASE}/analytics?type=metrics`)
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
    name: 'Subscription Management',
    tests: [
      { name: 'Create Subscription', fn: testCreateSubscription },
      { name: 'Update Subscription Plan', fn: testUpdateSubscription },
      { name: 'Cancel Subscription', fn: testCancelSubscription },
      { name: 'Get Plans', fn: testGetPlans }
    ]
  },
  {
    name: 'Dunning Management',
    tests: [
      { name: 'Process Payment Failure', fn: testDunningFailure },
      { name: 'Process Payment Success', fn: testDunningSuccess },
      { name: 'Dunning Analytics', fn: testDunningAnalytics }
    ]
  },
  {
    name: 'Billing Analytics',
    tests: [
      { name: 'Get Billing Metrics', fn: testBillingMetrics },
      { name: 'Generate Report', fn: testGenerateReport },
      { name: 'Revenue Forecast', fn: testRevenueForecast },
      { name: 'Churn Analysis', fn: testChurnAnalysis }
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
  
  log('🚀 Starting Advanced Billing Test Suite', colors.bright);
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


