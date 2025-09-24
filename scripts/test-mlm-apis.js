#!/usr/bin/env node

/**
 * MLM API Test Script
 * Tests all MLM endpoints with real database operations
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
  return { status: response.status, data }
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

async function testMLMUser() {
  console.log('\n🧪 Testing MLM User API...')
  
  try {
    // Test getting MLM user data
    const response = await makeRequest('/api/mlm/users?userId=user_123')
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM User API: SUCCESS')
      console.log(`   User: ${response.data.data.mlmCode}`)
      console.log(`   Rank: ${response.data.data.rank.name}`)
      console.log(`   Earnings: $${response.data.data.totalEarnings}`)
    } else {
      console.log('❌ MLM User API: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
      console.log(`   Details: ${response.data.details || 'No details'}`)
      console.log(`   Full Response:`, JSON.stringify(response.data, null, 2))
    }
  } catch (error) {
    console.log('❌ MLM User API: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testMLMCommissions() {
  console.log('\n🧪 Testing MLM Commissions API...')
  
  try {
    // Test getting commissions
    const response = await makeRequest('/api/mlm/commissions?userId=user_123&period=30')
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Commissions API: SUCCESS')
      console.log(`   Total Commissions: ${response.data.data.summary.totalCommissions}`)
      console.log(`   Total Earnings: $${response.data.data.summary.totalEarnings}`)
      console.log(`   Pending: $${response.data.data.summary.pendingEarnings}`)
    } else {
      console.log('❌ MLM Commissions API: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Commissions API: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testMLMGenealogy() {
  console.log('\n🧪 Testing MLM Genealogy API...')
  
  try {
    // Test getting genealogy
    const response = await makeRequest('/api/mlm/genealogy?userId=user_123&depth=3')
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Genealogy API: SUCCESS')
      console.log(`   Total Members: ${response.data.data.stats.totalMembers}`)
      console.log(`   Active Members: ${response.data.data.stats.activeMembers}`)
      console.log(`   Total Volume: $${response.data.data.stats.totalVolume}`)
    } else {
      console.log('❌ MLM Genealogy API: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Genealogy API: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testMLMCommissionCalculation() {
  console.log('\n🧪 Testing MLM Commission Calculation...')
  
  try {
    // Test commission calculation
    const saleData = {
      buyerId: 'user_456',
      amount: 1000,
      productType: 'credit_repair',
      id: 'sale_test_123'
    }

    const response = await makeRequest('/api/mlm/commissions', {
      method: 'POST',
      body: JSON.stringify({
        saleData,
        commissionType: 'hybrid'
      })
    })
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Commission Calculation: SUCCESS')
      console.log(`   Commissions Created: ${response.data.data.commissionsCreated}`)
      console.log(`   Total Amount: $${response.data.data.totalAmount}`)
    } else {
      console.log('❌ MLM Commission Calculation: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
      console.log(`   Details: ${response.data.details || 'No details'}`)
    }
  } catch (error) {
    console.log('❌ MLM Commission Calculation: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testMLMRanks() {
  console.log('\n🧪 Testing MLM Ranks API...')
  
  try {
    // Test getting ranks
    const response = await makeRequest('/api/mlm/ranks?userId=user_123')
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Ranks API: SUCCESS')
      console.log(`   Current Rank: ${response.data.data.currentRank.name}`)
      console.log(`   Next Rank: ${response.data.data.nextRank?.name || 'Max Rank'}`)
      console.log(`   Progress: ${Math.round(response.data.data.progress.personalVolume)}%`)
    } else {
      console.log('❌ MLM Ranks API: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Ranks API: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testMLMTraining() {
  console.log('\n🧪 Testing MLM Training API...')
  
  try {
    // Test getting training data
    const response = await makeRequest('/api/mlm/training?userId=user_123')
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Training API: SUCCESS')
      const trainingData = response.data.data || []
      console.log(`   Training Programs: ${Array.isArray(trainingData) ? trainingData.length : 0}`)
      if (Array.isArray(trainingData)) {
        const completed = trainingData.filter(t => t.completed).length
        console.log(`   Completed: ${completed}`)
      }
    } else {
      console.log('❌ MLM Training API: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Training API: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function testMLMPayouts() {
  console.log('\n🧪 Testing MLM Payouts API...')
  
  try {
    // Test getting payouts
    const response = await makeRequest('/api/mlm/payouts?userId=user_123')
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ MLM Payouts API: SUCCESS')
      const payoutData = response.data.data || []
      console.log(`   Total Payouts: ${Array.isArray(payoutData) ? payoutData.length : 0}`)
      if (Array.isArray(payoutData)) {
        const totalAmount = payoutData.reduce((sum, p) => sum + p.amount, 0)
        console.log(`   Total Amount: $${totalAmount}`)
      }
    } else {
      console.log('❌ MLM Payouts API: FAILED')
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${response.data.error || 'Unknown error'}`)
    }
  } catch (error) {
    console.log('❌ MLM Payouts API: ERROR')
    console.log(`   Error: ${error.message}`)
  }
}

async function runAllTests() {
  console.log('🚀 Starting MLM API Tests...')
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

  // Run all tests
  await testMLMUser()
  await testMLMCommissions()
  await testMLMGenealogy()
  await testMLMCommissionCalculation()
  await testMLMRanks()
  await testMLMTraining()
  await testMLMPayouts()

  console.log('\n🎉 MLM API Tests Completed!')
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  testMLMUser,
  testMLMCommissions,
  testMLMGenealogy,
  testMLMCommissionCalculation,
  testMLMRanks,
  testMLMTraining,
  testMLMPayouts,
  runAllTests
}
