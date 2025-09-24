#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

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

const testSubscriptionCreation = async () => {
  console.log('🧪 Testing subscription creation...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'create',
        customerId: 'test_customer_123',
        planId: 'basic',
        trialPeriodDays: 7,
        quantity: 1,
        metadata: { test: true }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
};

const testDunningFailure = async () => {
  console.log('🧪 Testing dunning failure...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/billing/dunning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'process_failure',
        subscriptionId: 'test_sub_123',
        customerId: 'test_customer_123',
        amount: 5999,
        currency: 'usd',
        failureReason: 'insufficient_funds',
        metadata: { test: true }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
};

const main = async () => {
  console.log('🔍 API Debug Test');
  console.log('─'.repeat(50));
  
  await testSubscriptionCreation();
  console.log('\n' + '─'.repeat(50));
  await testDunningFailure();
};

main().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
