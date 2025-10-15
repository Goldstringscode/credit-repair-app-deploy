// Test script to check compliance API endpoints
const fetch = require('node-fetch');

async function testComplianceAPI() {
  console.log('Testing Compliance API Endpoints...\n');
  
  try {
    // Test main compliance endpoint
    console.log('1. Testing /api/compliance...');
    const complianceResponse = await fetch('https://credit-repair-hjofqxqig-goldstrings-projects.vercel.app/api/compliance');
    const complianceData = await complianceResponse.text();
    console.log('Status:', complianceResponse.status);
    console.log('Response:', complianceData.substring(0, 200) + '...');
    console.log('');
    
    // Test GDPR endpoint
    console.log('2. Testing /api/compliance/gdpr...');
    const gdprResponse = await fetch('https://credit-repair-hjofqxqig-goldstrings-projects.vercel.app/api/compliance/gdpr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-123',
        requestType: 'data_export',
        reason: 'Test request',
        requestedData: { categories: ['personal_info'] }
      })
    });
    const gdprData = await gdprResponse.text();
    console.log('Status:', gdprResponse.status);
    console.log('Response:', gdprData.substring(0, 200) + '...');
    console.log('');
    
    // Test CCPA endpoint
    console.log('3. Testing /api/compliance/ccpa...');
    const ccpaResponse = await fetch('https://credit-repair-hjofqxqig-goldstrings-projects.vercel.app/api/compliance/ccpa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-123',
        requestType: 'know',
        businessPurpose: 'Test purpose',
        thirdParties: ['test_partner']
      })
    });
    const ccpaData = await ccpaResponse.text();
    console.log('Status:', ccpaResponse.status);
    console.log('Response:', ccpaData.substring(0, 200) + '...');
    console.log('');
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testComplianceAPI();
