#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const makeRequest = async (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: 10000,
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
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
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

const testServerConnection = async () => {
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const main = async () => {
  log('🚀 Advanced Billing Test Suite - Simple Version', colors.bright);
  log(`📍 Testing against: ${BASE_URL}`, colors.blue);
  log('─'.repeat(60), colors.bright);

  log('\n🔍 Checking server connection...', colors.cyan);
  
  const result = await testServerConnection();
  
  if (result.success) {
    log('✅ Server is running and responding!', colors.green);
    log(`   Status: ${result.status}`, colors.blue);
    log(`   Response: ${JSON.stringify(result.data, null, 2)}`, colors.bright);
    
    log('\n📋 Next steps:', colors.yellow);
    log('1. Make sure your development server is running: npm run dev', colors.blue);
    log('2. Wait for the server to fully start up (usually 10-15 seconds)', colors.blue);
    log('3. Run the full test suite: npm run test:advanced-billing', colors.blue);
    log('4. Or run individual test suites:', colors.blue);
    log('   - npm run test:unit (unit tests)', colors.blue);
    log('   - npm run test:integration (API tests)', colors.blue);
    log('   - npm run test:e2e (end-to-end tests)', colors.blue);
    log('   - npm run test:performance (performance tests)', colors.blue);
    
  } else {
    log('❌ Server is not responding', colors.red);
    log(`   Error: ${result.error}`, colors.red);
    
    log('\n🔧 Troubleshooting steps:', colors.yellow);
    log('1. Start the development server: npm run dev', colors.blue);
    log('2. Wait for "Ready" message in the terminal', colors.blue);
    log('3. Check if port 3000 is available: netstat -an | findstr :3000', colors.blue);
    log('4. Try accessing http://localhost:3000 in your browser', colors.blue);
    log('5. If still having issues, check the console for errors', colors.blue);
  }

  log('\n📚 Available test commands:', colors.magenta);
  log('npm run test:advanced-billing  - Run the full billing test suite', colors.blue);
  log('npm run test:unit             - Run unit tests only', colors.blue);
  log('npm run test:integration      - Run integration tests only', colors.blue);
  log('npm run test:e2e              - Run end-to-end tests only', colors.blue);
  log('npm run test:performance      - Run performance tests only', colors.blue);
  log('npm run test:coverage         - Run tests with coverage report', colors.blue);
  log('npm run test:watch            - Run tests in watch mode', colors.blue);

  process.exit(result.success ? 0 : 1);
};

main().catch(error => {
  log(`\n💥 Test execution failed: ${error.message}`, colors.red);
  process.exit(1);
});


