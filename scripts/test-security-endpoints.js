#!/usr/bin/env node

/**
 * Security Endpoints Test Script
 * Tests all security API endpoints to ensure they're working correctly
 */

const BASE_URL = 'http://localhost:3000'

const tests = [
  {
    name: 'Rate Limiting',
    method: 'POST',
    url: '/api/test/rate-limit',
    body: {},
    expectedStatus: 200
  },
  {
    name: 'Input Validation - Valid',
    method: 'POST',
    url: '/api/test/validation',
    body: { email: 'test@example.com' },
    expectedStatus: 200
  },
  {
    name: 'Input Validation - Invalid',
    method: 'POST',
    url: '/api/test/validation',
    body: { email: 'invalid-email' },
    expectedStatus: 400
  },
  {
    name: 'CORS Policy',
    method: 'GET',
    url: '/api/test/cors',
    headers: { 'Origin': 'https://test.com' },
    expectedStatus: 200
  },
  {
    name: 'Data Encryption',
    method: 'POST',
    url: '/api/test/encryption',
    body: { ssn: '1234', creditScore: 750 },
    expectedStatus: 200
  },
  {
    name: 'Audit Logging',
    method: 'POST',
    url: '/api/test/audit',
    body: { action: 'test_action' },
    expectedStatus: 200
  },
  {
    name: 'Authentication - No Token',
    method: 'GET',
    url: '/api/test/auth',
    expectedStatus: 401
  },
  {
    name: 'Authentication - Invalid Token',
    method: 'GET',
    url: '/api/test/auth',
    headers: { 'Authorization': 'Bearer invalid-token' },
    expectedStatus: 401
  },
  {
    name: 'Authentication - Valid Token',
    method: 'GET',
    url: '/api/test/auth',
    headers: { 'Authorization': 'Bearer valid-token' },
    expectedStatus: 200
  },
  {
    name: 'Authorization - User Role',
    method: 'GET',
    url: '/api/test/authorization',
    headers: { 
      'Authorization': 'Bearer valid-token',
      'X-User-Role': 'user'
    },
    expectedStatus: 200
  },
  {
    name: 'Authorization - Admin Role',
    method: 'GET',
    url: '/api/test/authorization',
    headers: { 
      'Authorization': 'Bearer valid-token',
      'X-User-Role': 'admin'
    },
    expectedStatus: 200
  },
  {
    name: 'Authorization - Invalid Role',
    method: 'GET',
    url: '/api/test/authorization',
    headers: { 
      'Authorization': 'Bearer valid-token',
      'X-User-Role': 'guest'
    },
    expectedStatus: 403
  },
  {
    name: 'Security Headers',
    method: 'GET',
    url: '/api/test/security-headers',
    expectedStatus: 200
  },
  {
    name: 'Environment Validation',
    method: 'GET',
    url: '/api/test/env-validation',
    expectedStatus: 200
  },
  {
    name: 'File Upload Security',
    method: 'POST',
    url: '/api/test/file-upload',
    body: new FormData(), // This will be handled specially
    expectedStatus: 400 // Should fail without proper file
  }
]

async function runTest(test) {
  try {
    const url = `${BASE_URL}${test.url}`
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        ...test.headers
      }
    }

    if (test.body && !(test.body instanceof FormData)) {
      options.body = JSON.stringify(test.body)
    } else if (test.body instanceof FormData) {
      // For file upload test, create a proper FormData
      const formData = new FormData()
      formData.append('file', new Blob(['test content'], { type: 'text/plain' }), 'test.txt')
      formData.append('bureau', 'experian')
      options.body = formData
      delete options.headers['Content-Type'] // Let browser set it
    }

    const response = await fetch(url, options)
    const result = {
      name: test.name,
      status: response.status,
      expected: test.expectedStatus,
      passed: response.status === test.expectedStatus,
      success: response.ok
    }

    try {
      const data = await response.json()
      result.data = data
    } catch (e) {
      result.data = await response.text()
    }

    return result
  } catch (error) {
    return {
      name: test.name,
      status: 'ERROR',
      expected: test.expectedStatus,
      passed: false,
      success: false,
      error: error.message
    }
  }
}

async function runAllTests() {
  console.log('🧪 Running Security Endpoints Tests...\n')
  
  const results = []
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}...`)
    const result = await runTest(test)
    results.push(result)
    
    const status = result.passed ? '✅ PASS' : '❌ FAIL'
    console.log(`  ${status} - Status: ${result.status} (Expected: ${result.expected})`)
    
    if (result.error) {
      console.log(`  Error: ${result.error}`)
    }
    
    console.log('')
  }
  
  // Summary
  const passed = results.filter(r => r.passed).length
  const total = results.length
  const successRate = Math.round((passed / total) * 100)
  
  console.log('📊 Test Summary:')
  console.log(`  Total Tests: ${total}`)
  console.log(`  Passed: ${passed}`)
  console.log(`  Failed: ${total - passed}`)
  console.log(`  Success Rate: ${successRate}%`)
  
  if (successRate === 100) {
    console.log('\n🎉 All security tests passed! Your security implementation is working correctly.')
  } else if (successRate >= 80) {
    console.log('\n⚠️  Most tests passed, but some issues need attention.')
  } else {
    console.log('\n🚨 Multiple test failures detected. Please review the security implementation.')
  }
  
  return results
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = { runAllTests, runTest, tests }

