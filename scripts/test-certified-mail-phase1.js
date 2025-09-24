/**
 * Test Script for Certified Mail System - Phase 1
 * Tests all core infrastructure components
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Test data
const testMailRequest = {
  userId: 'test-user-123',
  recipient: {
    name: 'Test Recipient',
    company: 'Test Company',
    address: {
      address1: '123 Main St',
      address2: 'Suite 100',
      city: 'New York',
      state: 'NY',
      zip5: '10001'
    }
  },
  sender: {
    name: 'Test Sender',
    company: 'Credit Repair AI',
    address: {
      address1: '456 Business Ave',
      address2: 'Floor 2',
      city: 'Los Angeles',
      state: 'CA',
      zip5: '90210'
    }
  },
  letter: {
    subject: 'Test Dispute Letter',
    content: 'This is a test dispute letter content...',
    type: 'dispute',
    templateId: '1'
  },
  mailService: 'certified_mail',
  additionalServices: ['return_receipt'],
  priority: 'normal',
  returnReceiptRequested: true,
  signatureConfirmation: false
}

const testAddress = {
  address1: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zip5: '10001'
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    return { status: response.status, data }
  } catch (error) {
    return { status: 500, data: { error: error.message } }
  }
}

async function testAddressValidation() {
  console.log('\n🧪 Testing Address Validation...')
  
  const result = await makeRequest(`${BASE_URL}/api/certified-mail/validate-address`, {
    method: 'POST',
    body: JSON.stringify({ address: testAddress })
  })
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Address validation working')
    console.log('   Valid:', result.data.data.isValid)
    if (result.data.data.standardizedAddress) {
      console.log('   Standardized:', result.data.data.standardizedAddress)
    }
  } else {
    console.log('❌ Address validation failed')
    console.log('   Status:', result.status)
    console.log('   Error:', result.data.error)
  }
  
  return result.status === 200
}

async function testServiceRates() {
  console.log('\n🧪 Testing Service Rates...')
  
  const result = await makeRequest(`${BASE_URL}/api/certified-mail/rates`)
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Service rates working')
    console.log('   Available services:', result.data.data.length)
    result.data.data.forEach(rate => {
      console.log(`   - ${rate.serviceName}: $${rate.basePrice}`)
    })
  } else {
    console.log('❌ Service rates failed')
    console.log('   Status:', result.status)
    console.log('   Error:', result.data.error)
  }
  
  return result.status === 200
}

async function testMailTemplates() {
  console.log('\n🧪 Testing Mail Templates...')
  
  const result = await makeRequest(`${BASE_URL}/api/certified-mail/templates`)
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Mail templates working')
    console.log('   Available templates:', result.data.data.length)
    result.data.data.forEach(template => {
      console.log(`   - ${template.name} (${template.category})`)
    })
  } else {
    console.log('❌ Mail templates failed')
    console.log('   Status:', result.status)
    console.log('   Error:', result.data.error)
  }
  
  return result.status === 200
}

async function testCreateMailRequest() {
  console.log('\n🧪 Testing Create Mail Request...')
  
  const result = await makeRequest(`${BASE_URL}/api/certified-mail/create`, {
    method: 'POST',
    body: JSON.stringify(testMailRequest)
  })
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Create mail request working')
    console.log('   Tracking ID:', result.data.data.mail.trackingId)
    console.log('   Cost: $' + result.data.data.mail.cost)
    console.log('   Payment Intent ID:', result.data.data.payment.paymentIntentId)
    return result.data.data.mail.trackingId
  } else {
    console.log('❌ Create mail request failed')
    console.log('   Status:', result.status)
    console.log('   Error:', result.data.error)
    return null
  }
}

async function testMailStatus(trackingId) {
  if (!trackingId) {
    console.log('\n⏭️  Skipping mail status test (no tracking ID)')
    return false
  }
  
  console.log('\n🧪 Testing Mail Status...')
  
  const result = await makeRequest(`${BASE_URL}/api/certified-mail/status/${trackingId}`)
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Mail status working')
    console.log('   Status:', result.data.data.status)
    console.log('   Processing Status:', result.data.data.processingStatus)
    console.log('   Payment Status:', result.data.data.paymentStatus)
    console.log('   Events:', result.data.data.events.length)
  } else {
    console.log('❌ Mail status failed')
    console.log('   Status:', result.status)
    console.log('   Error:', result.data.error)
  }
  
  return result.status === 200
}

async function testStripeWebhook() {
  console.log('\n🧪 Testing Stripe Webhook Endpoint...')
  
  const result = await makeRequest(`${BASE_URL}/api/webhooks/stripe-mail`, {
    method: 'POST',
    body: JSON.stringify({ test: 'webhook' })
  })
  
  if (result.status === 400 && result.data.error === 'Missing Stripe signature') {
    console.log('✅ Stripe webhook endpoint working (correctly rejecting invalid requests)')
  } else {
    console.log('❌ Stripe webhook endpoint failed')
    console.log('   Status:', result.status)
    console.log('   Response:', result.data)
  }
  
  return result.status === 400
}

async function runAllTests() {
  console.log('🚀 Starting Certified Mail System - Phase 1 Tests')
  console.log('=' .repeat(60))
  
  const results = {
    addressValidation: await testAddressValidation(),
    serviceRates: await testServiceRates(),
    mailTemplates: await testMailTemplates(),
    createMailRequest: false,
    mailStatus: false,
    stripeWebhook: await testStripeWebhook()
  }
  
  // Test mail creation and status
  const trackingId = await testCreateMailRequest()
  results.createMailRequest = trackingId !== null
  results.mailStatus = await testMailStatus(trackingId)
  
  // Summary
  console.log('\n📊 Test Results Summary')
  console.log('=' .repeat(60))
  
  const totalTests = Object.keys(results).length
  const passedTests = Object.values(results).filter(Boolean).length
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`)
  })
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All Phase 1 tests passed! Ready for production deployment.')
  } else {
    console.log('⚠️  Some tests failed. Please review and fix before deployment.')
  }
  
  return results
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  runAllTests,
  testAddressValidation,
  testServiceRates,
  testMailTemplates,
  testCreateMailRequest,
  testMailStatus,
  testStripeWebhook
}

