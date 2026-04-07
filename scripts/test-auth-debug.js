#!/usr/bin/env node

const https = require('https')
const http = require('http')

const BASE_URL = 'http://localhost:3000'

// Helper function to make HTTP requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL)
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
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
        try {
          const body = data ? JSON.parse(data) : {}
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          })
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          })
        }
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

async function testAuthDebug() {
  console.log('🔍 Authentication Debug Test')
  console.log('============================')
  console.log()

  try {
    // Test 1: Login
    console.log('1. 🔐 Testing Login...')
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: process.env.TEST_EMAIL || 'admin@creditrepair.com',
        password: process.env.TEST_PASSWORD || ''
      }
    })

    console.log(`   Status: ${loginResponse.statusCode}`)
    console.log(`   Response: ${JSON.stringify(loginResponse.body, null, 2)}`)

    if (loginResponse.statusCode !== 200) {
      console.log('   ❌ Login failed, stopping test')
      return
    }

    const authToken = loginResponse.body.token
    console.log(`   ✅ Token received: ${authToken ? 'Yes' : 'No'}`)
    console.log()

    // Test 2: Test a simple authenticated endpoint
    console.log('2. 🧪 Testing authenticated endpoint...')
    const testResponse = await makeRequest('/api/billing/user/subscription', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log(`   Status: ${testResponse.statusCode}`)
    console.log(`   Response: ${JSON.stringify(testResponse.body, null, 2)}`)
    console.log()

    // Test 3: Test credit monitoring endpoint
    console.log('3. 📊 Testing credit monitoring endpoint...')
    const creditResponse = await makeRequest('/api/credit-monitoring/scores', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log(`   Status: ${creditResponse.statusCode}`)
    console.log(`   Response: ${JSON.stringify(creditResponse.body, null, 2)}`)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testAuthDebug()
