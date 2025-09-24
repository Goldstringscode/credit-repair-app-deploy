#!/usr/bin/env node

/**
 * Debug Compliance Script
 * 
 * This script helps debug compliance endpoint issues.
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const jsonData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            data: jsonData,
            raw: responseData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            raw: responseData
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function debugComplianceEndpoints() {
  console.log('🔍 Debugging Compliance Endpoints...\n');

  // Test PCI endpoint
  console.log('Testing PCI Add Card...');
  try {
    const result = await makeRequest('/api/compliance/pci', 'POST', {
      action: 'add_card',
      data: {
        userId: 'test-user-123',
        cardNumber: '4111111111111111',
        expiryMonth: 12,
        expiryYear: 2025,
        cardholderName: 'Test User',
        cvv: '123'
      }
    });
    
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.data, null, 2)}`);
    
    if (result.status >= 400) {
      console.log(`Raw Response: ${result.raw}`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test Retention endpoint
  console.log('Testing Retention Process Expired...');
  try {
    const result = await makeRequest('/api/compliance/retention', 'PUT', {
      action: 'process_expired'
    });
    
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.data, null, 2)}`);
    
    if (result.status >= 400) {
      console.log(`Raw Response: ${result.raw}`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test Health endpoint
  console.log('Testing Health Check...');
  try {
    const result = await makeRequest('/api/compliance/health');
    
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.data, null, 2)}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

// Run the debug
debugComplianceEndpoints().catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});
