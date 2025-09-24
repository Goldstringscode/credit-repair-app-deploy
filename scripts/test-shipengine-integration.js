/**
 * Test Script: ShipEngine Integration with Pricing Model
 * Tests the new ShipEngine-based certified mail system
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testAddress = {
  name: 'Test Recipient',
  address1: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'US',
};

const testSender = {
  name: 'Test Sender',
  address1: '456 Business Avenue',
  city: 'Los Angeles',
  state: 'CA',
  zip: '90210',
  country: 'US',
};

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log('🚀 Starting ShipEngine Integration Tests');
  console.log('============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Get Pricing Tiers
  console.log('🧪 Testing Pricing Tiers...');
  totalTests++;
  const pricingTest = await testEndpoint('/api/certified-mail/pricing');
  if (pricingTest.success) {
    console.log('✅ Pricing tiers working');
    console.log('   Available tiers:', Object.keys(pricingTest.data.data || {}));
    passedTests++;
  } else {
    console.log('❌ Pricing tiers failed');
    console.log('   Status:', pricingTest.status);
    console.log('   Error:', pricingTest.error || pricingTest.data?.error);
  }

  // Test 2: Calculate Cost
  console.log('\n🧪 Testing Cost Calculation...');
  totalTests++;
  const costTest = await testEndpoint('/api/certified-mail/calculate-cost', 'POST', {
    recipient: {
      name: 'Test Recipient',
      address: testAddress,
    },
    sender: {
      name: 'Test Sender',
      address: testSender,
    },
    serviceTier: 'basic',
    additionalServices: {
      returnReceipt: true,
    },
  });

  if (costTest.success) {
    console.log('✅ Cost calculation working');
    console.log('   Total cost:', costTest.data.data?.total || 'N/A');
    console.log('   Breakdown:', costTest.data.data?.breakdown || 'N/A');
    passedTests++;
  } else {
    console.log('❌ Cost calculation failed');
    console.log('   Status:', costTest.status);
    console.log('   Error:', costTest.error || costTest.data?.error);
  }

  // Test 3: Address Validation
  console.log('\n🧪 Testing Address Validation...');
  totalTests++;
  const addressTest = await testEndpoint('/api/certified-mail/validate-address', 'POST', {
    address: testAddress,
  });

  if (addressTest.success) {
    console.log('✅ Address validation working');
    console.log('   Valid:', addressTest.data.data?.isValid || 'N/A');
    passedTests++;
  } else {
    console.log('❌ Address validation failed');
    console.log('   Status:', addressTest.status);
    console.log('   Error:', addressTest.error || addressTest.data?.error);
  }

  // Test 4: Service Rates
  console.log('\n🧪 Testing Service Rates...');
  totalTests++;
  const ratesTest = await testEndpoint('/api/certified-mail/rates', 'POST', {
    fromAddress: testSender,
    toAddress: testAddress,
  });

  if (ratesTest.success) {
    console.log('✅ Service rates working');
    console.log('   Available services:', ratesTest.data.data?.length || 0);
    passedTests++;
  } else {
    console.log('❌ Service rates failed');
    console.log('   Status:', ratesTest.status);
    console.log('   Error:', ratesTest.error || ratesTest.data?.error);
  }

  // Test 5: Mail Templates
  console.log('\n🧪 Testing Mail Templates...');
  totalTests++;
  const templatesTest = await testEndpoint('/api/certified-mail/templates');

  if (templatesTest.success) {
    console.log('✅ Mail templates working');
    console.log('   Available templates:', templatesTest.data.data?.length || 0);
    passedTests++;
  } else {
    console.log('❌ Mail templates failed');
    console.log('   Status:', templatesTest.status);
    console.log('   Error:', templatesTest.error || templatesTest.data?.error);
  }

  // Test 6: Create Mail Request (without payment)
  console.log('\n🧪 Testing Create Mail Request...');
  totalTests++;
  const createTest = await testEndpoint('/api/certified-mail/create', 'POST', {
    userId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID for testing
    recipient: {
      name: 'Test Recipient',
      address: testAddress,
    },
    sender: {
      name: 'Test Sender',
      address: testSender,
    },
    letter: {
      subject: 'Test Letter',
      content: 'This is a test letter content.',
      type: 'dispute',
    },
    serviceTier: 'basic',
    additionalServices: {
      returnReceipt: true,
    },
  });

  if (createTest.success) {
    console.log('✅ Create mail request working');
    console.log('   Tracking ID:', createTest.data.data?.trackingId || 'N/A');
    console.log('   Cost:', createTest.data.data?.cost?.total || 'N/A');
    passedTests++;
  } else {
    console.log('❌ Create mail request failed');
    console.log('   Status:', createTest.status);
    console.log('   Error:', createTest.error || createTest.data?.error);
  }

  // Test Results Summary
  console.log('\n📊 Test Results Summary');
  console.log('============================================================');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! ShipEngine integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix before deployment.');
  }

  console.log('\n💡 Next Steps:');
  console.log('1. Get your ShipEngine API key from https://www.shipengine.com/');
  console.log('2. Add SHIPENGINE_API_KEY to your .env.local file');
  console.log('3. Deploy the database schema');
  console.log('4. Test with real ShipEngine integration');
}

// Run the tests
runTests().catch(console.error);
