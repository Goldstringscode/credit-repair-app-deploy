#!/usr/bin/env node

/**
 * Detailed PCI Debug Script
 * 
 * This script helps debug PCI endpoint issues with detailed logging.
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    console.log(`Making ${method} request to ${path}`);
    console.log('Headers:', options.headers);
    if (data) {
      console.log('Body:', JSON.stringify(data, null, 2));
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`Response Status: ${res.statusCode}`);
        console.log('Response Headers:', res.headers);
        
        try {
          const jsonData = responseData ? JSON.parse(responseData) : {};
          console.log('Response Body:', JSON.stringify(jsonData, null, 2));
          resolve({
            status: res.statusCode,
            data: jsonData,
            raw: responseData
          });
        } catch (error) {
          console.log('Raw Response:', responseData);
          resolve({
            status: res.statusCode,
            data: responseData,
            raw: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function debugPCIEndpoint() {
  console.log('🔍 Detailed PCI Endpoint Debug...\n');

  // Test 1: Basic PCI Add Card
  console.log('=== Test 1: PCI Add Card ===');
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
    
    console.log(`Result: ${result.status === 200 ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: PCI Process Transaction
  console.log('=== Test 2: PCI Process Transaction ===');
  try {
    const result = await makeRequest('/api/compliance/pci', 'POST', {
      action: 'process_transaction',
      data: {
        userId: 'test-user-123',
        cardId: 'test-card-id',
        amount: 100.00,
        currency: 'USD',
        merchantId: 'merchant-123',
        transactionType: 'sale'
      }
    });
    
    console.log(`Result: ${result.status === 200 ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: PCI Compliance Info
  console.log('=== Test 3: PCI Compliance Info ===');
  try {
    const result = await makeRequest('/api/compliance/pci?action=compliance');
    
    console.log(`Result: ${result.status === 200 ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the debug
debugPCIEndpoint().catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});
