#!/usr/bin/env node

/**
 * Test Auth Page
 * This script tests the simple auth page to see if AuthWrapper is working
 */

const http = require('http')

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Auth Test Script'
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data
        })
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.end()
  })
}

async function testAuthPage() {
  console.log('🧪 Testing Auth Page')
  console.log('===================')
  console.log('')

  try {
    const response = await makeRequest('/test-auth')
    
    if (response.statusCode === 200) {
      console.log('✅ Test auth page loads successfully')
      
      const body = response.body
      console.log('')
      console.log('📄 Page content analysis:')
      
      const hasAuthRequired = body.includes('Authentication Required')
      const hasLogin = body.includes('Login')
      const hasDemo = body.includes('Demo Account')
      const hasTestContent = body.includes('This content should only show when authenticated')
      
      console.log(`   Authentication Required: ${hasAuthRequired ? '✅' : '❌'}`)
      console.log(`   Login button: ${hasLogin ? '✅' : '❌'}`)
      console.log(`   Demo Account button: ${hasDemo ? '✅' : '❌'}`)
      console.log(`   Test content (should be hidden): ${hasTestContent ? '✅' : '❌'}`)
      
      if (hasAuthRequired || hasLogin || hasDemo) {
        console.log('')
        console.log('🎉 AuthWrapper is working! Login form is being displayed.')
      } else if (hasTestContent) {
        console.log('')
        console.log('❌ AuthWrapper is NOT working. Protected content is showing without authentication.')
      } else {
        console.log('')
        console.log('❓ AuthWrapper behavior is unclear. Need to investigate further.')
      }
      
    } else {
      console.log(`❌ Test auth page failed to load (${response.statusCode})`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testAuthPage()
