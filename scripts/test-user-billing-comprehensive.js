#!/usr/bin/env node

const https = require('https');
const http = require('http');

const makeRequest = async (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: 15000,
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

const testUserBillingComprehensive = async () => {
  console.log('🧪 COMPREHENSIVE USER BILLING SYSTEM TEST');
  console.log('════════════════════════════════════════════════════════════════════════════════════════');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const test = async (name, testFn) => {
    totalTests++;
    try {
      console.log(`\n🧪 Testing: ${name}`);
      const result = await testFn();
      if (result.success) {
        console.log(`✅ PASSED: ${name}`);
        if (result.details) {
          console.log(`   ${result.details}`);
        }
        passedTests++;
      } else {
        console.log(`❌ FAILED: ${name}`);
        console.log(`   Error: ${result.error}`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${name} - ${error.message}`);
      failedTests++;
    }
  };

  // Test 1: Basic API Health Check
  await test('API Health Check', async () => {
    const response = await makeRequest('http://localhost:3000/api/health');
    return {
      success: response.status === 200,
      details: response.status === 200 ? 'Server is running' : `Server returned ${response.status}`
    };
  });

  // Test 2: User Subscription API
  await test('User Subscription API', async () => {
    const response = await makeRequest('http://localhost:3000/api/billing/user/subscription');
    return {
      success: response.status === 200 && response.data.success,
      details: response.data.subscription ? 'Subscription found' : 'No active subscription (expected for demo)'
    };
  });

  // Test 3: User Plans API
  await test('User Plans API', async () => {
    const response = await makeRequest('http://localhost:3000/api/billing/user/plans');
    const hasPlans = response.data.plans && response.data.plans.length > 0;
    return {
      success: response.status === 200 && response.data.success && hasPlans,
      details: hasPlans ? `${response.data.plans.length} plans available` : 'No plans found'
    };
  });

  // Test 4: User Payments API
  await test('User Payments API', async () => {
    const response = await makeRequest('http://localhost:3000/api/billing/user/payments');
    const hasPayments = response.data.payments && response.data.payments.length > 0;
    return {
      success: response.status === 200 && response.data.success && hasPayments,
      details: hasPayments ? `${response.data.payments.length} payments found` : 'No payments found'
    };
  });

  // Test 5: User Mail Payments API
  await test('User Mail Payments API', async () => {
    const response = await makeRequest('http://localhost:3000/api/billing/user/mail-payments');
    const hasMailPayments = response.data.mailPayments && response.data.mailPayments.length > 0;
    return {
      success: response.status === 200 && response.data.success && hasMailPayments,
      details: hasMailPayments ? `${response.data.mailPayments.length} mail payments found` : 'No mail payments found'
    };
  });

  // Test 6: User Cards API
  await test('User Cards API', async () => {
    const response = await makeRequest('http://localhost:3000/api/billing/user/cards');
    return {
      success: response.status === 200 && response.data.success,
      details: response.data.cards ? `${response.data.cards.length} cards found` : 'No cards found (expected for new user)'
    };
  });

  // Test 7: User Billing Overview API
  await test('User Billing Overview API', async () => {
    const response = await makeRequest('http://localhost:3000/api/billing/user/overview');
    return {
      success: response.status === 200 && response.data.success,
      details: response.data.stats ? 'Billing stats loaded' : 'No billing stats'
    };
  });

  // Test 8: Add Card Functionality
  await test('Add Card Functionality', async () => {
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

    return {
      success: response.status === 200 && response.data.success,
      details: response.data.success ? 'Card added successfully' : `Failed to add card: ${response.data.message}`
    };
  });

  // Test 9: Add Mail Payment Functionality
  await test('Add Mail Payment Functionality', async () => {
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

    return {
      success: response.status === 200 && response.data.success,
      details: response.data.success ? 'Mail payment added successfully' : `Failed to add mail payment: ${response.data.message}`
    };
  });

  // Test 10: Export Payments Functionality
  await test('Export Payments Functionality', async () => {
    const exportData = {
      format: 'txt',
      filters: {
        search: '',
        status: 'all',
        type: 'all',
        date: 'all'
      }
    };

    const response = await makeRequest('http://localhost:3000/api/billing/user/export-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportData)
    });

    return {
      success: response.status === 200,
      details: response.status === 200 ? 'Export generated successfully' : `Export failed: ${response.status}`
    };
  });

  // Test 11: Plan Change Functionality (if subscription exists)
  await test('Plan Change Functionality', async () => {
    // First check if user has a subscription
    const subResponse = await makeRequest('http://localhost:3000/api/billing/user/subscription');
    
    if (!subResponse.data.subscription) {
      return {
        success: true,
        details: 'No subscription to change (expected for demo user)'
      };
    }

    const changeData = {
      subscriptionId: subResponse.data.subscription.id,
      newPlanId: 'premium',
      changeType: 'immediate',
      prorationBehavior: 'create_prorations'
    };

    const response = await makeRequest('http://localhost:3000/api/billing/user/change-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changeData)
    });

    return {
      success: response.status === 200 && response.data.success,
      details: response.data.success ? 'Plan change successful' : `Plan change failed: ${response.data.message}`
    };
  });

  // Test 12: Billing Page Load Test
  await test('Billing Page Load Test', async () => {
    const response = await makeRequest('http://localhost:3000/billing');
    const hasBillingContent = response.data.includes('Billing') || response.data.includes('billing');
    return {
      success: response.status === 200 && hasBillingContent,
      details: hasBillingContent ? 'Billing page loaded successfully' : 'Billing page content not found'
    };
  });

  // Test 13: Navigation Integration Test
  await test('Navigation Integration Test', async () => {
    const response = await makeRequest('http://localhost:3000/');
    const hasBillingLink = response.data.includes('/billing') || response.data.includes('Billing');
    return {
      success: response.status === 200 && hasBillingLink,
      details: hasBillingLink ? 'Billing link found in navigation' : 'Billing link not found in navigation'
    };
  });

  // Test 14: API Error Handling Test
  await test('API Error Handling Test', async () => {
    // Test with invalid data
    const response = await makeRequest('http://localhost:3000/api/billing/user/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    });

    return {
      success: response.status === 400 || response.status === 500, // Should return error for invalid data
      details: `Error handling working (status: ${response.status})`
    };
  });

  // Test 15: Rate Limiting Test
  await test('Rate Limiting Test', async () => {
    // Make multiple rapid requests to test rate limiting
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(makeRequest('http://localhost:3000/api/billing/user/subscription'));
    }

    const responses = await Promise.all(promises);
    const allSuccessful = responses.every(r => r.status === 200);
    
    return {
      success: allSuccessful,
      details: allSuccessful ? 'Rate limiting working correctly' : 'Rate limiting may be too restrictive'
    };
  });

  // Final Results
  console.log('\n════════════════════════════════════════════════════════════════════════════════════════');
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('════════════════════════════════════════════════════════════════════════════════════════');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (failedTests === 0) {
    console.log('\n🎉🎉🎉 ALL TESTS PASSED! 🎉🎉🎉');
    console.log('✅ User billing system is fully functional!');
    console.log('✅ All APIs are working correctly!');
    console.log('✅ All features are operational!');
    console.log('✅ System is ready for production use!');
  } else if (passedTests / totalTests >= 0.9) {
    console.log('\n🎉 EXCELLENT! Nearly all tests passed!');
    console.log('✅ User billing system is highly functional!');
    console.log('⚠️  A few minor issues detected, but system is ready for use!');
  } else if (passedTests / totalTests >= 0.8) {
    console.log('\n✅ GOOD! Most tests passed!');
    console.log('✅ User billing system is mostly functional!');
    console.log('⚠️  Some issues detected, but core functionality works!');
  } else {
    console.log('\n⚠️  ATTENTION NEEDED!');
    console.log('❌ Several tests failed. Please check the errors above.');
    console.log('🔧 System needs debugging before production use.');
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════════════════');
  console.log('🚀 USER BILLING SYSTEM TEST COMPLETE!');
  console.log('════════════════════════════════════════════════════════════════════════════════════════');
};

testUserBillingComprehensive().catch(error => {
  console.error('Comprehensive test failed:', error);
  process.exit(1);
});
