#!/usr/bin/env node

/**
 * Debug MLM Authentication
 * Tests authentication flow step by step
 */

const baseUrl = process.env.TEST_URL || 'http://localhost:3000'

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  const data = await response.json()
  return { status: response.status, data, headers: response.headers }
}

async function debugAuth() {
  console.log('🔍 Debugging MLM Authentication...')
  
  // Step 1: Login
  console.log('\n1. Testing login...')
  const loginResponse = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: process.env.TEST_EMAIL || 'admin@creditrepair.com',
      password: process.env.TEST_PASSWORD || ''
    })
  })
  
  console.log('Login Status:', loginResponse.status)
  console.log('Login Data:', JSON.stringify(loginResponse.data, null, 2))
  
  if (loginResponse.status !== 200) {
    console.log('❌ Login failed')
    return
  }
  
  const token = loginResponse.data.accessToken
  console.log('Token received:', token ? 'Yes' : 'No')
  console.log('Token length:', token ? token.length : 0)
  
  // Step 2: Test MLM User endpoint
  console.log('\n2. Testing MLM User endpoint...')
  const mlmResponse = await makeRequest('/api/mlm/users?userId=user_123', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  console.log('MLM User Status:', mlmResponse.status)
  console.log('MLM User Data:', JSON.stringify(mlmResponse.data, null, 2))
  
  // Step 3: Test without userId parameter
  console.log('\n3. Testing MLM User endpoint without userId...')
  const mlmResponse2 = await makeRequest('/api/mlm/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  console.log('MLM User Status (no userId):', mlmResponse2.status)
  console.log('MLM User Data (no userId):', JSON.stringify(mlmResponse2.data, null, 2))
  
  // Step 4: Test ranks endpoint (which works)
  console.log('\n4. Testing MLM Ranks endpoint...')
  const ranksResponse = await makeRequest('/api/mlm/ranks?userId=user_123', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  console.log('Ranks Status:', ranksResponse.status)
  console.log('Ranks Data:', JSON.stringify(ranksResponse.data, null, 2))
}

// Run debug if called directly
if (require.main === module) {
  debugAuth().catch(console.error)
}

module.exports = { debugAuth }
