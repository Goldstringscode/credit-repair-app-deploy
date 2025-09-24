#!/usr/bin/env node

/**
 * Simple Compliance Test Script
 * 
 * This script tests the compliance endpoints to ensure they're working correctly.
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const jsonData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testComplianceEndpoints() {
  console.log('🧪 Testing Compliance Endpoints...\n');

  const tests = [
    {
      name: 'Health Check',
      test: () => makeRequest('/api/compliance/health')
    },
    {
      name: 'GDPR Data Export',
      test: () => makeRequest('/api/compliance/gdpr', 'POST', {
        userId: 'test-user-123',
        requestType: 'data_export'
      })
    },
    {
      name: 'FCRA Dispute Submission',
      test: () => makeRequest('/api/compliance/fcra', 'POST', {
        userId: 'test-user-123',
        action: 'dispute',
        data: {
          bureau: 'experian',
          description: 'Test dispute'
        }
      })
    },
    {
      name: 'CCPA Right to Know',
      test: () => makeRequest('/api/compliance/ccpa', 'POST', {
        userId: 'test-user-123',
        requestType: 'know'
      })
    },
    {
      name: 'HIPAA Data Access',
      test: () => makeRequest('/api/compliance/hipaa', 'POST', {
        userId: 'test-user-123',
        requestType: 'access',
        healthData: {
          id: 'health_data_123',
          userId: 'test-user-123',
          dataType: 'medical_record',
          description: 'Test health data',
          sensitivity: 'high',
          accessLevel: 'view',
          encrypted: true,
          lastAccessed: new Date(),
          accessedBy: []
        }
      })
    },
    {
      name: 'PCI Add Card',
      test: () => makeRequest('/api/compliance/pci', 'POST', {
        action: 'add_card',
        data: {
          userId: 'test-user-123',
          cardNumber: '4111111111111111',
          expiryMonth: 12,
          expiryYear: 2025,
          cardholderName: 'Test User',
          cvv: '123'
        }
      })
    },
    {
      name: 'Data Retention Create Record',
      test: () => makeRequest('/api/compliance/retention', 'POST', {
        userId: 'test-user-123',
        dataType: 'personal_info',
        metadata: { source: 'test' }
      })
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const result = await test.test();
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`✅ ${test.name}: PASSED (${result.status})`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED (${result.status})`);
        console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All compliance tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server logs for details.');
  }
}

// Run the tests
testComplianceEndpoints().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
