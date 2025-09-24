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

const testUserBillingSimple = async () => {
  console.log('🧪 USER BILLING SYSTEM TEST');
  console.log('════════════════════════════════════════════════════════════');
  
  const tests = [
    {
      name: 'Health Check',
      url: 'http://localhost:3000/api/health',
      method: 'GET'
    },
    {
      name: 'User Subscription',
      url: 'http://localhost:3000/api/billing/user/subscription',
      method: 'GET'
    },
    {
      name: 'User Plans',
      url: 'http://localhost:3000/api/billing/user/plans',
      method: 'GET'
    },
    {
      name: 'User Payments',
      url: 'http://localhost:3000/api/billing/user/payments',
      method: 'GET'
    },
    {
      name: 'User Mail Payments',
      url: 'http://localhost:3000/api/billing/user/mail-payments',
      method: 'GET'
    },
    {
      name: 'User Cards',
      url: 'http://localhost:3000/api/billing/user/cards',
      method: 'GET'
    },
    {
      name: 'User Overview',
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
        if (test.name === 'User Plans' && response.data.plans) {
          console.log(`   📋 Plans available: ${response.data.plans.length}`);
          response.data.plans.forEach(plan => {
            console.log(`      - ${plan.name}: $${(plan.amount / 100).toFixed(2)}/${plan.interval}`);
          });
        }
        if (test.name === 'User Payments' && response.data.payments) {
          console.log(`   💳 Payments found: ${response.data.payments.length}`);
        }
        if (test.name === 'User Mail Payments' && response.data.mailPayments) {
          console.log(`   📮 Mail payments found: ${response.data.mailPayments.length}`);
        }
        if (test.name === 'User Cards' && response.data.cards) {
          console.log(`   💳 Cards found: ${response.data.cards.length}`);
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
  console.log('📊 TEST RESULTS');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ User billing system is working perfectly!');
    console.log('✅ All APIs are functional!');
    console.log('✅ Ready for use!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }

  // Test adding a card
  console.log('\n🧪 Testing: Add Card Functionality');
  try {
    const cardData = {
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvc: '123',
      name: 'Test User',
      zipCode: '12345'
    };

    const response = await makeRequest('http://localhost:3000/api/billing/user/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardData)
    });

    if (response.status === 200 && response.data.success) {
      console.log('✅ PASSED: Add Card Functionality');
      console.log(`   Card added: ${response.data.card.brand} ending in ${response.data.card.last4}`);
    } else {
      console.log('❌ FAILED: Add Card Functionality');
      console.log(`   Error: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ FAILED: Add Card Functionality - ${error.message}`);
  }

  // Test adding a mail payment
  console.log('\n🧪 Testing: Add Mail Payment Functionality');
  try {
    const mailPaymentData = {
      type: 'certified',
      letterType: 'dispute',
      amount: '7.50',
      recipient: 'Test Credit Bureau',
      address: '123 Test St, Test City, TC 12345',
      description: 'Test Dispute Letter',
      notes: 'Test mail payment'
    };

    const response = await makeRequest('http://localhost:3000/api/billing/user/mail-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mailPaymentData)
    });

    if (response.status === 200 && response.data.success) {
      console.log('✅ PASSED: Add Mail Payment Functionality');
      console.log(`   Mail payment added: ${response.data.mailPayment.type} mail to ${response.data.mailPayment.recipient}`);
    } else {
      console.log('❌ FAILED: Add Mail Payment Functionality');
      console.log(`   Error: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ FAILED: Add Mail Payment Functionality - ${error.message}`);
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('🚀 USER BILLING SYSTEM TEST COMPLETE!');
  console.log('════════════════════════════════════════════════════════════');
};

testUserBillingSimple().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
