require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

async function testProductionSystem() {
  console.log('🧪 Testing Production Certified Mail System');
  console.log('============================================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Pricing API
  await runTest('Pricing API', async () => {
    const response = await fetch(`${BASE_URL}/api/certified-mail/pricing`);
    const data = await response.json();
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    if (!data.success) throw new Error('API returned success: false');
    if (!data.data.basic || !data.data.premium || !data.data.professional) {
      throw new Error('Missing pricing tiers');
    }
    
    console.log('✅ Pricing tiers loaded successfully');
    console.log(`   Basic: $${data.data.basic.basePrice}`);
    console.log(`   Premium: $${data.data.premium.basePrice}`);
    console.log(`   Professional: $${data.data.professional.basePrice}`);
  }, results);

  // Test 2: Address Validation
  await runTest('Address Validation', async () => {
    const testAddress = {
      name: 'Test Recipient',
      address1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US'
    };

    const response = await fetch(`${BASE_URL}/api/certified-mail/validate-address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: testAddress })
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    if (!data.success) throw new Error('Validation returned success: false');
    
    console.log('✅ Address validation working');
    console.log(`   Valid: ${data.data.isValid}`);
  }, results);

  // Test 3: Service Rates
  await runTest('Service Rates', async () => {
    const fromAddress = {
      name: 'Test Sender',
      address1: '456 Business Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      country: 'US'
    };

    const toAddress = {
      name: 'Test Recipient',
      address1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US'
    };

    const response = await fetch(`${BASE_URL}/api/certified-mail/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromAddress, toAddress })
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    if (!data.success) throw new Error('Rates returned success: false');
    
    console.log('✅ Service rates working');
    console.log(`   Available rates: ${data.data.length}`);
  }, results);

  // Test 4: Create Mail Request
  await runTest('Create Mail Request', async () => {
    const testData = {
      userId: TEST_USER_ID,
      recipient: {
        name: 'Experian Credit Bureau',
        address: {
          name: 'Experian Credit Bureau',
          address1: '475 Anton Blvd',
          city: 'Costa Mesa',
          state: 'CA',
          zip: '92626',
          country: 'US'
        }
      },
      sender: {
        name: 'Test User',
        address: {
          name: 'Test User',
          address1: '123 Test Street',
          city: 'Test City',
          state: 'CA',
          zip: '90210',
          country: 'US'
        }
      },
      letter: {
        subject: 'Test Dispute Letter',
        content: 'This is a test letter for production testing.',
        type: 'dispute',
        templateId: 'test-template-id'
      },
      serviceTier: 'basic',
      additionalServices: {
        returnReceipt: true
      },
      customerId: 'cus_test_customer_id'
    };

    const response = await fetch(`${BASE_URL}/api/certified-mail/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(`Status: ${response.status}, Error: ${data.error}`);
    if (!data.success) throw new Error('Create mail returned success: false');
    
    console.log('✅ Mail request created successfully');
    console.log(`   Tracking Number: ${data.data.mail.trackingNumber}`);
    console.log(`   Cost: $${data.data.mail.cost.total}`);
    
    return data.data.mail.trackingNumber;
  }, results);

  // Test 5: Tracking API
  await runTest('Tracking API', async () => {
    // Use a test tracking number
    const testTrackingNumber = 'CR1758742567106MHDGOU';
    
    const response = await fetch(`${BASE_URL}/api/certified-mail/track/${testTrackingNumber}`);
    const data = await response.json();
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    if (!data.success) throw new Error('Tracking returned success: false');
    
    console.log('✅ Tracking API working');
    console.log(`   Status: ${data.data.status}`);
    console.log(`   Events: ${data.data.events.length}`);
  }, results);

  // Test 6: Webhook Endpoint
  await runTest('Webhook Endpoint', async () => {
    const testWebhookData = {
      event_type: 'tracking.status.updated',
      tracking_number: 'CR1758742567106MHDGOU',
      status: 'in_transit',
      location: {
        city: 'Phoenix',
        state: 'AZ'
      },
      description: 'Package is in transit to destination',
      timestamp: new Date().toISOString()
    };

    const response = await fetch(`${BASE_URL}/api/webhooks/shipengine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testWebhookData)
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    if (!data.success) throw new Error('Webhook returned success: false');
    
    console.log('✅ Webhook endpoint working');
    console.log(`   Webhook ID: ${data.webhookId}`);
    console.log(`   Processing Time: ${data.processingTime}`);
  }, results);

  // Test 7: Database Connection
  await runTest('Database Connection', async () => {
    const response = await fetch(`${BASE_URL}/api/certified-mail/templates`);
    const data = await response.json();
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    if (!data.success) throw new Error('Templates returned success: false');
    
    console.log('✅ Database connection working');
    console.log(`   Templates available: ${data.data.length}`);
  }, results);

  // Print Results
  console.log('\n📊 Test Results Summary');
  console.log('============================================================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`);
    });
  }

  console.log('\n🎯 Production Readiness Assessment');
  console.log('============================================================');
  
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ System is ready for production deployment');
    console.log('✅ All core functionality is working');
    console.log('✅ Database connections are stable');
    console.log('✅ API endpoints are responding correctly');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('❌ System needs fixes before production deployment');
    console.log('❌ Please address the failed tests above');
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Fix any failed tests');
  console.log('2. Configure production environment variables');
  console.log('3. Set up ShipEngine webhooks');
  console.log('4. Configure email service');
  console.log('5. Deploy to production');
  console.log('6. Monitor system performance');

  return results.failed === 0;
}

async function runTest(name, testFn, results) {
  try {
    console.log(`🧪 Testing: ${name}`);
    await testFn();
    results.passed++;
    results.tests.push({ name, passed: true });
    console.log(`✅ ${name} - PASSED\n`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, passed: false, error: error.message });
    console.log(`❌ ${name} - FAILED`);
    console.log(`   Error: ${error.message}\n`);
  }
}

// Run the tests
testProductionSystem()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
