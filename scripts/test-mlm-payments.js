#!/usr/bin/env node

/**
 * MLM Payment System Test Script
 * Tests all MLM payment and payout endpoints
 */

const baseUrl = process.env.TEST_URL || 'http://localhost:3000'

let authToken = null

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  })

  const data = await response.json()
  return { status: response.status, data, headers: response.headers }
}

async function login() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'demo123'
      })
    })

    if (response.status === 200 && response.data.success) {
      authToken = response.data.accessToken || response.data.token
      console.log('✅ Authentication successful')
      return true
    } else {
      console.log('❌ Authentication failed:', response.data.error)
      return false
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message)
    return false
  }
}

async function testPaymentMethods() {
  console.log('\n🧪 Testing MLM Payment Methods API...')
  
  try {
    // Test getting payment methods
    const response = await makeRequest('/api/mlm/payment-methods')
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Payment Methods API: SUCCESS')
      console.log(`   Payment Methods: ${response.data.data.paymentMethods.length}`)
      console.log(`   Default Method: ${response.data.data.defaultMethod ? 'Yes' : 'No'}`)
    } else {
      console.log('❌ MLM Payment Methods API: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Payment Methods API: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testSetupPaymentMethod() {
  console.log('\n🧪 Testing MLM Payment Method Setup...')
  
  try {
    // Test setting up a payment method
    const response = await makeRequest('/api/mlm/payment-methods', {
      method: 'POST',
      body: JSON.stringify({
        type: 'bank_account',
        accountDetails: {
          account_number: '1234567890',
          routing_number: '021000021',
          account_holder_name: 'Demo User',
          account_holder_type: 'individual'
        }
      })
    })
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Payment Method Setup: SUCCESS')
      console.log(`   Method ID: ${response.data.data.methodId}`)
      console.log(`   Type: ${response.data.data.type}`)
      console.log(`   Status: ${response.data.data.status}`)
    } else {
      console.log('❌ MLM Payment Method Setup: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Payment Method Setup: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testMLMSubscriptions() {
  console.log('\n🧪 Testing MLM Subscriptions API...')
  
  try {
    // Test getting subscription
    const response = await makeRequest('/api/mlm/subscriptions')
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Subscriptions API: SUCCESS')
      console.log(`   Subscription ID: ${response.data.data.subscription.id}`)
      console.log(`   Tier: ${response.data.data.subscription.tierName}`)
      console.log(`   Price: $${response.data.data.subscription.price}`)
      console.log(`   Status: ${response.data.data.subscription.status}`)
    } else {
      console.log('❌ MLM Subscriptions API: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Subscriptions API: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testCreateSubscription() {
  console.log('\n🧪 Testing MLM Subscription Creation...')
  
  try {
    // Test creating a subscription
    const response = await makeRequest('/api/mlm/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        tierId: 'professional',
        billingCycle: 'monthly',
        paymentMethodId: 'pm_mock_payment_method'
      })
    })
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Subscription Creation: SUCCESS')
      console.log(`   Subscription ID: ${response.data.data.subscriptionId}`)
      console.log(`   Tier: ${response.data.data.tierId}`)
      console.log(`   Billing: ${response.data.data.billingCycle}`)
    } else {
      console.log('❌ MLM Subscription Creation: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Subscription Creation: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testPayoutProcessing() {
  console.log('\n🧪 Testing MLM Payout Processing...')
  
  try {
    // Test processing a payout
    const response = await makeRequest('/api/mlm/payouts/process', {
      method: 'POST',
      body: JSON.stringify({
        payoutMethod: 'bank_account',
        minPayoutAmount: 50
      })
    })
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Payout Processing: SUCCESS')
      console.log(`   Payout ID: ${response.data.data.payoutId}`)
      console.log(`   Amount: $${response.data.data.amount}`)
      console.log(`   Method: ${response.data.data.method}`)
      console.log(`   Commissions: ${response.data.data.commissionCount}`)
    } else {
      console.log('❌ MLM Payout Processing: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Payout Processing: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testTaxDocuments() {
  console.log('\n🧪 Testing MLM Tax Documents API...')
  
  try {
    // Test getting tax document data
    const response = await makeRequest('/api/mlm/tax-documents?year=2024')
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Tax Documents API: SUCCESS')
      console.log(`   Year: ${response.data.data.year}`)
      console.log(`   Total Earnings: $${response.data.data.totalEarnings}`)
      console.log(`   Qualifies for 1099: ${response.data.data.qualifiesFor1099 ? 'Yes' : 'No'}`)
      console.log(`   Commission Count: ${response.data.data.commissionCount}`)
    } else {
      console.log('❌ MLM Tax Documents API: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Tax Documents API: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testGenerateTaxDocument() {
  console.log('\n🧪 Testing MLM Tax Document Generation...')
  
  try {
    // Test generating a tax document
    const response = await makeRequest('/api/mlm/tax-documents', {
      method: 'POST',
      body: JSON.stringify({
        year: 2024,
        format: 'pdf'
      })
    })
    
    if (response.status === 200) {
      console.log('✅ MLM Tax Document Generation: SUCCESS')
      console.log(`   Content-Type: ${response.headers.get('content-type')}`)
      console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`)
    } else {
      console.log('❌ MLM Tax Document Generation: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Tax Document Generation: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testStripeWebhook() {
  console.log('\n🧪 Testing Stripe Webhook Handler...')
  
  try {
    // Test webhook endpoint (this would normally be called by Stripe)
    const mockWebhookPayload = JSON.stringify({
      id: 'evt_test_webhook',
      object: 'event',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_test_invoice',
          amount_paid: 19700,
          currency: 'usd',
          subscription: 'sub_test_subscription'
        }
      }
    })

    const response = await makeRequest('/api/mlm/webhooks/stripe', {
      method: 'POST',
      body: mockWebhookPayload,
      headers: {
        'stripe-signature': 't=1234567890,v1=test_signature'
      }
    })
    
    if (response.status === 200) {
      console.log('✅ Stripe Webhook Handler: SUCCESS')
      console.log(`   Response: ${JSON.stringify(response.data)}`)
    } else {
      console.log('❌ Stripe Webhook Handler: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ Stripe Webhook Handler: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function runAllTests() {
  console.log('🚀 Starting MLM Payment System Tests...')
  console.log(`📍 Testing against: ${baseUrl}`)
  
  // Check if server is running
  try {
    const healthCheck = await makeRequest('/api/health')
    if (healthCheck.status !== 200) {
      console.log('❌ Server is not running. Please start the development server first.')
      process.exit(1)
    }
  } catch (error) {
    console.log('❌ Cannot connect to server. Please start the development server first.')
    process.exit(1)
  }

  // Login first
  console.log('\n🔐 Authenticating...')
  const loginSuccess = await login()
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication')
    process.exit(1)
  }

  // Run all payment tests
  await testPaymentMethods()
  await testSetupPaymentMethod()
  await testMLMSubscriptions()
  await testCreateSubscription()
  await testPayoutProcessing()
  await testTaxDocuments()
  await testGenerateTaxDocument()
  await testStripeWebhook()

  console.log('\n🎉 MLM Payment System Tests Completed!')
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  testPaymentMethods,
  testSetupPaymentMethod,
  testMLMSubscriptions,
  testCreateSubscription,
  testPayoutProcessing,
  testTaxDocuments,
  testGenerateTaxDocument,
  testStripeWebhook,
  runAllTests
}
