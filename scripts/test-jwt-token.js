#!/usr/bin/env node

/**
 * JWT Token Test
 * This script tests JWT token generation and verification
 */

const http = require('http')

const BASE_URL = 'http://localhost:3000'

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'JWT Token Test Script',
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    const req = http.request(requestOptions, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        })
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (options.body) {
      req.write(JSON.stringify(options.body))
    }

    req.end()
  })
}

async function testJWTToken() {
  console.log('🔐 JWT Token Test')
  console.log('=================')
  console.log('')

  try {
    // Step 1: Login and get token
    console.log('1. 🔑 Getting JWT token...')
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'demo@example.com',
        password: 'demo123'
      }
    })

    if (loginResponse.statusCode !== 200) {
      console.log(`   ❌ Login failed (${loginResponse.statusCode})`)
      return
    }

    const loginData = JSON.parse(loginResponse.body)
    const token = loginData.token

    if (!token) {
      console.log('   ❌ No token received')
      return
    }

    console.log('   ✅ Token received')
    console.log(`   📝 Token length: ${token.length}`)
    console.log(`   📝 Token preview: ${token.substring(0, 50)}...`)

    // Step 2: Test token with different endpoints
    console.log('')
    console.log('2. 🧪 Testing token with protected endpoints...')
    
    const authHeaders = {
      'Authorization': `Bearer ${token}`
    }

    // Test subscription endpoint
    const subscriptionResponse = await makeRequest('/api/billing/user/subscription', {
      headers: authHeaders
    })
    console.log(`   📊 Subscription: ${subscriptionResponse.statusCode === 200 ? '✅' : '❌'} (${subscriptionResponse.statusCode})`)
    
    if (subscriptionResponse.statusCode !== 200) {
      console.log(`   📝 Response: ${subscriptionResponse.body}`)
    }

    // Test payments endpoint
    const paymentsResponse = await makeRequest('/api/billing/user/payments', {
      headers: authHeaders
    })
    console.log(`   💳 Payments: ${paymentsResponse.statusCode === 200 ? '✅' : '❌'} (${paymentsResponse.statusCode})`)
    
    if (paymentsResponse.statusCode !== 200) {
      console.log(`   📝 Response: ${paymentsResponse.body}`)
    }

    // Test cards endpoint
    const cardsResponse = await makeRequest('/api/billing/user/cards', {
      headers: authHeaders
    })
    console.log(`   🏦 Cards: ${cardsResponse.statusCode === 200 ? '✅' : '❌'} (${cardsResponse.statusCode})`)
    
    if (cardsResponse.statusCode !== 200) {
      console.log(`   📝 Response: ${cardsResponse.body}`)
    }

    // Test plans endpoint
    const plansResponse = await makeRequest('/api/billing/user/plans', {
      headers: authHeaders
    })
    console.log(`   📋 Plans: ${plansResponse.statusCode === 200 ? '✅' : '❌'} (${plansResponse.statusCode})`)
    
    if (plansResponse.statusCode !== 200) {
      console.log(`   📝 Response: ${plansResponse.body}`)
    }

    // Test export endpoint
    const exportResponse = await makeRequest('/api/billing/user/export-payments', {
      method: 'POST',
      headers: authHeaders,
      body: {
        format: 'pdf',
        filters: {}
      }
    })
    console.log(`   📄 Export: ${exportResponse.statusCode === 200 ? '✅' : '❌'} (${exportResponse.statusCode})`)
    
    if (exportResponse.statusCode !== 200) {
      console.log(`   📝 Response: ${exportResponse.body}`)
    }

    console.log('')
    console.log('🎯 Summary:')
    console.log('===========')
    if (subscriptionResponse.statusCode === 200 && paymentsResponse.statusCode === 200) {
      console.log('✅ JWT authentication is working correctly!')
    } else {
      console.log('❌ JWT authentication has issues')
      console.log('📝 Check server logs for JWT verification errors')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testJWTToken()
