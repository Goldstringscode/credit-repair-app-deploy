#!/usr/bin/env node

/**
 * Compliance Test Script
 * 
 * This script tests all compliance API endpoints to ensure they're working correctly.
 * Run with: node scripts/test-compliance.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_USER_ID = 'test-user-123';

// Test data
const testData = {
  userId: TEST_USER_ID,
  email: 'test@example.com',
  cardNumber: '4111111111111111',
  expiryMonth: 12,
  expiryYear: 2025,
  cvv: '123',
  cardholderName: 'Test User',
  amount: 100.00,
  currency: 'USD',
  merchantId: 'merchant-123'
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (options.body) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
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
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test runner
async function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Running: ${testName}`);
  
  try {
    const startTime = Date.now();
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    if (result.success) {
      testResults.passed++;
      console.log(`✅ PASSED: ${testName} (${duration}ms)`);
      if (result.data) {
        console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
      }
    } else {
      testResults.failed++;
      testResults.errors.push(`${testName}: ${result.error}`);
      console.log(`❌ FAILED: ${testName} - ${result.error}`);
    }
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(`${testName}: ${error.message}`);
    console.log(`❌ ERROR: ${testName} - ${error.message}`);
  }
}

// Individual test functions
async function testGDPRDataExport() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/gdpr`, {
    method: 'POST',
    body: JSON.stringify({
      userId: testData.userId,
      requestType: 'data_export'
    })
  });
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testGDPRDataDeletion() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/gdpr`, {
    method: 'POST',
    body: JSON.stringify({
      userId: testData.userId,
      requestType: 'data_deletion'
    })
  });
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testGDPRGetRequests() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/gdpr?userId=${testData.userId}`);
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testFCRADisputeSubmission() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/fcra`, {
    method: 'POST',
    body: JSON.stringify({
      userId: testData.userId,
      action: 'dispute',
      data: {
        bureau: 'experian',
        description: 'Test dispute for inaccurate information'
      }
    })
  });
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testFCRAFreeReport() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/fcra`, {
    method: 'POST',
    body: JSON.stringify({
      userId: testData.userId,
      action: 'free_report',
      data: { bureau: 'experian' }
    })
  });
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testFCRARightsInfo() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/fcra?action=rights`);
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testCCPARightToKnow() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/ccpa`, {
    method: 'POST',
    body: JSON.stringify({
      userId: testData.userId,
      requestType: 'know'
    })
  });
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testCCPARightToDelete() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/ccpa`, {
    method: 'POST',
    body: JSON.stringify({
      userId: testData.userId,
      requestType: 'delete'
    })
  });
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testCCPADataCategories() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/ccpa?action=data-categories`);
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testHIPAADataAccess() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/hipaa`, {
    method: 'POST',
    body: JSON.stringify({
      userId: testData.userId,
      requestType: 'access',
      healthData: {
        id: 'health_data_123',
        userId: testData.userId,
        dataType: 'medical_record',
        description: 'Test health data',
        sensitivity: 'high',
        accessLevel: 'view',
        encrypted: true,
        lastAccessed: new Date().toISOString(),
        accessedBy: []
      }
    })
  });
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testHIPAARightsInfo() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/hipaa?action=rights`);
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testPCIAddCard() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/pci`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'add_card',
      data: {
        userId: testData.userId,
        cardNumber: testData.cardNumber,
        expiryMonth: testData.expiryMonth,
        expiryYear: testData.expiryYear,
        cardholderName: testData.cardholderName,
        cvv: testData.cvv
      }
    })
  });
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testPCIComplianceInfo() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/pci?action=compliance`);
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testRetentionCreateRecord() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/retention`, {
    method: 'POST',
    body: JSON.stringify({
      userId: testData.userId,
      dataType: 'personal_info',
      metadata: { source: 'test' }
    })
  });
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testRetentionGetPolicies() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/retention?action=policies`);
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

async function testComplianceHealth() {
  const response = await makeRequest(`${BASE_URL}/api/compliance/health`);
  
  return {
    success: response.status === 200,
    data: response.data,
    error: response.status !== 200 ? `Expected 200, got ${response.status}` : null
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Compliance Test Suite');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log(`👤 Test User ID: ${TEST_USER_ID}`);
  
  const startTime = Date.now();
  
  // GDPR Tests
  console.log('\n📋 GDPR Compliance Tests');
  await runTest('GDPR Data Export', testGDPRDataExport);
  await runTest('GDPR Data Deletion', testGDPRDataDeletion);
  await runTest('GDPR Get Requests', testGDPRGetRequests);
  
  // FCRA Tests
  console.log('\n📄 FCRA Compliance Tests');
  await runTest('FCRA Dispute Submission', testFCRADisputeSubmission);
  await runTest('FCRA Free Report Request', testFCRAFreeReport);
  await runTest('FCRA Rights Information', testFCRARightsInfo);
  
  // CCPA Tests
  console.log('\n👥 CCPA Compliance Tests');
  await runTest('CCPA Right to Know', testCCPARightToKnow);
  await runTest('CCPA Right to Delete', testCCPARightToDelete);
  await runTest('CCPA Data Categories', testCCPADataCategories);
  
  // HIPAA Tests
  console.log('\n🏥 HIPAA Compliance Tests');
  await runTest('HIPAA Data Access', testHIPAADataAccess);
  await runTest('HIPAA Rights Information', testHIPAARightsInfo);
  
  // PCI DSS Tests
  console.log('\n💳 PCI DSS Compliance Tests');
  await runTest('PCI Add Card', testPCIAddCard);
  await runTest('PCI Compliance Information', testPCIComplianceInfo);
  
  // Data Retention Tests
  console.log('\n⏰ Data Retention Tests');
  await runTest('Retention Create Record', testRetentionCreateRecord);
  await runTest('Retention Get Policies', testRetentionGetPolicies);
  
  // Health Check
  console.log('\n🏥 System Health Tests');
  await runTest('Compliance Health Check', testComplianceHealth);
  
  const totalTime = Date.now() - startTime;
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏱️  Total Time: ${totalTime}ms`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach(error => console.log(`   • ${error}`));
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (testResults.failed === 0) {
    console.log('🎉 All tests passed! Compliance system is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Compliance Test Script

Usage: node scripts/test-compliance.js [options]

Options:
  --help, -h          Show this help message
  --url <url>         Set the base URL to test against (default: http://localhost:3000)
  --user <id>         Set the test user ID (default: test-user-123)

Environment Variables:
  TEST_BASE_URL       Base URL for testing (overrides --url)
  TEST_USER_ID        User ID for testing (overrides --user)

Examples:
  node scripts/test-compliance.js
  node scripts/test-compliance.js --url https://staging.example.com
  TEST_BASE_URL=https://prod.example.com node scripts/test-compliance.js
`);
  process.exit(0);
}

// Parse command line arguments
const urlIndex = process.argv.indexOf('--url');
if (urlIndex !== -1 && process.argv[urlIndex + 1]) {
  process.env.TEST_BASE_URL = process.argv[urlIndex + 1];
}

const userIndex = process.argv.indexOf('--user');
if (userIndex !== -1 && process.argv[userIndex + 1]) {
  testData.userId = process.argv[userIndex + 1];
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test suite failed with error:', error);
  process.exit(1);
});



