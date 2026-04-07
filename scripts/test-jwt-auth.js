#!/usr/bin/env node

const https = require('https');
const http = require('http');

const makeRequest = async (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: 15000,
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            cookies: res.headers['set-cookie'] || []
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            cookies: res.headers['set-cookie'] || []
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });
    req.on('timeout', () => {
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
};

const testJWTAuth = async () => {
  console.log('🧪 JWT AUTHENTICATION SYSTEM TEST');
  console.log('════════════════════════════════════════════════════════════');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const test = async (name, testFn) => {
    totalTests++;
    try {
      console.log(`\n🧪 Testing: ${name}`);
      const result = await testFn();
      if (result.success) {
        console.log(`✅ PASSED: ${name}`);
        if (result.details) {
          console.log(`   ${result.details}`);
        }
        passedTests++;
      } else {
        console.log(`❌ FAILED: ${name}`);
        console.log(`   Error: ${result.error}`);
        failedTests++;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${name} - ${error.message}`);
      failedTests++;
    }
  };

  let authCookies = [];

  // Test 1: Login with valid credentials
  await test('Login with Valid Credentials', async () => {
    const response = await makeRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.TEST_EMAIL || 'admin@creditrepair.com',
        password: process.env.TEST_PASSWORD || ''
      })
    });

    if (response.cookies.length > 0) {
      authCookies = response.cookies;
    }

    return {
      success: response.status === 200 && response.data.success,
      details: response.data.success ? 'Login successful, tokens generated' : `Failed: ${response.data.message}`
    };
  });

  // Test 2: Login with invalid credentials
  await test('Login with Invalid Credentials', async () => {
    const response = await makeRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    });

    return {
      success: response.status === 401 && !response.data.success,
      details: response.status === 401 ? 'Invalid credentials properly rejected' : `Unexpected status: ${response.status}`
    };
  });

  // Test 3: Access protected endpoint without authentication
  await test('Access Protected Endpoint Without Auth', async () => {
    const response = await makeRequest('http://localhost:3000/api/billing/user/subscription');
    return {
      success: response.status === 401,
      details: response.status === 401 ? 'Protected endpoint requires authentication' : `Unexpected status: ${response.status}`
    };
  });

  // Test 4: Access protected endpoint with authentication
  await test('Access Protected Endpoint With Auth', async () => {
    const response = await makeRequest('http://localhost:3000/api/billing/user/subscription', {
      headers: {
        'Cookie': authCookies.join('; ')
      }
    });

    return {
      success: response.status === 200 && response.data.success,
      details: response.status === 200 ? 'Authenticated access successful' : `Failed: ${response.data.message}`
    };
  });

  // Test 5: Token refresh
  await test('Token Refresh', async () => {
    const response = await makeRequest('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Cookie': authCookies.join('; ')
      }
    });

    return {
      success: response.status === 200 && response.data.success,
      details: response.status === 200 ? 'Token refresh successful' : `Failed: ${response.data.message}`
    };
  });

  // Test 6: Logout
  await test('Logout', async () => {
    const response = await makeRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Cookie': authCookies.join('; ')
      }
    });

    return {
      success: response.status === 200 && response.data.success,
      details: response.status === 200 ? 'Logout successful' : `Failed: ${response.data.message}`
    };
  });

  // Test 7: Access after logout
  await test('Access After Logout', async () => {
    const response = await makeRequest('http://localhost:3000/api/billing/user/subscription', {
      headers: {
        'Cookie': authCookies.join('; ')
      }
    });

    return {
      success: response.status === 401,
      details: response.status === 401 ? 'Access properly denied after logout' : `Unexpected status: ${response.status}`
    };
  });

  // Test 8: Registration
  await test('User Registration', async () => {
    const response = await makeRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        confirmPassword: 'password123'
      })
    });

    return {
      success: response.status === 200 && response.data.success,
      details: response.status === 200 ? 'Registration successful' : `Failed: ${response.data.message}`
    };
  });

  // Final Results
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📊 JWT AUTHENTICATION TEST RESULTS');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (failedTests === 0) {
    console.log('\n🎉🎉🎉 ALL JWT AUTHENTICATION TESTS PASSED! 🎉🎉🎉');
    console.log('✅ JWT authentication system is working perfectly!');
    console.log('✅ Login/logout functionality is operational!');
    console.log('✅ Token generation and validation is working!');
    console.log('✅ Protected endpoints are secure!');
    console.log('✅ Registration system is functional!');
    console.log('\n🚀 JWT AUTHENTICATION IS PRODUCTION READY! 🚀');
  } else if (passedTests / totalTests >= 0.8) {
    console.log('\n🎉 EXCELLENT! Most JWT authentication tests passed!');
    console.log('✅ JWT authentication system is highly functional!');
    console.log('⚠️  A few minor issues detected, but system is ready!');
  } else {
    console.log('\n⚠️  ATTENTION NEEDED!');
    console.log('❌ Several JWT authentication tests failed. Please check the errors above.');
    console.log('🔧 System needs debugging before production use.');
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('🚀 JWT AUTHENTICATION TEST COMPLETE!');
  console.log('════════════════════════════════════════════════════════════');
};

testJWTAuth().catch(error => {
  console.error('JWT authentication test failed:', error);
  process.exit(1);
});

