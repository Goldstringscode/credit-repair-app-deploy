#!/usr/bin/env node

const https = require('https');
const http = require('http');

const makeRequest = async (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: 10000,
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

const testUserBilling = async () => {
  console.log('🧪 Testing User Billing System');
  console.log('════════════════════════════════════════════════════════════');
  
  const tests = [
    {
      name: 'User Subscription API',
      url: 'http://localhost:3000/api/billing/user/subscription',
      method: 'GET'
    },
    {
      name: 'User Plans API',
      url: 'http://localhost:3000/api/billing/user/plans',
      method: 'GET'
    },
    {
      name: 'User Payments API',
      url: 'http://localhost:3000/api/billing/user/payments',
      method: 'GET'
    },
    {
      name: 'User Mail Payments API',
      url: 'http://localhost:3000/api/billing/user/mail-payments',
      method: 'GET'
    },
    {
      name: 'User Cards API',
      url: 'http://localhost:3000/api/billing/user/cards',
      method: 'GET'
    },
    {
      name: 'User Billing Overview API',
      url: 'http://localhost:3000/api/billing/user/overview',
      method: 'GET'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      const response = await makeRequest(test.url, { method: test.method });
      
      if (response.status === 200) {
        console.log(`✅ PASSED: ${test.name} (${response.status})`);
        if (test.name.includes('Plans') && response.data.plans) {
          console.log(`   Plans available: ${response.data.plans.length}`);
        }
        if (test.name.includes('Payments') && response.data.payments) {
          console.log(`   Payments found: ${response.data.payments.length}`);
        }
        if (test.name.includes('Mail') && response.data.mailPayments) {
          console.log(`   Mail payments found: ${response.data.mailPayments.length}`);
        }
        passed++;
      } else {
        console.log(`❌ FAILED: ${test.name} (${response.status})`);
        console.log(`   Error: ${JSON.stringify(response.data)}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${test.name} - ${error.message}`);
      failed++;
    }
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All user billing APIs are working correctly!');
    console.log('✅ User billing system is ready for use!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
};

testUserBilling().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
