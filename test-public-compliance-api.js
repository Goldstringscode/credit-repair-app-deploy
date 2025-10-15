// Test script to check public compliance API endpoints
const fetch = require('node-fetch');

async function testPublicComplianceAPI() {
  console.log('Testing Public Compliance API Endpoints...\n');
  
  try {
    // Test main compliance endpoint
    console.log('1. Testing /api/public/compliance...');
    const complianceResponse = await fetch('https://credit-repair-4mzdqx2u0-goldstrings-projects.vercel.app/api/public/compliance');
    const complianceData = await complianceResponse.text();
    console.log('Status:', complianceResponse.status);
    console.log('Response:', complianceData.substring(0, 300) + '...');
    console.log('');
    
    // Test GDPR endpoint
    console.log('2. Testing /api/public/compliance/gdpr...');
    const gdprResponse = await fetch('https://credit-repair-4mzdqx2u0-goldstrings-projects.vercel.app/api/public/compliance/gdpr', {
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
    console.log('Response:', gdprData.substring(0, 300) + '...');
    console.log('');
    
    // Test CCPA endpoint
    console.log('3. Testing /api/public/compliance/ccpa...');
    const ccpaResponse = await fetch('https://credit-repair-4mzdqx2u0-goldstrings-projects.vercel.app/api/public/compliance/ccpa', {
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
    console.log('Response:', ccpaData.substring(0, 300) + '...');
    console.log('');
    
    // Test HIPAA endpoint
    console.log('4. Testing /api/public/compliance/hipaa...');
    const hipaaResponse = await fetch('https://credit-repair-4mzdqx2u0-goldstrings-projects.vercel.app/api/public/compliance/hipaa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-123',
        requestType: 'access',
        healthData: {
          dataType: 'medical_record',
          sensitivity: 'high',
          accessLevel: 'view',
          encrypted: true
        }
      })
    });
    const hipaaData = await hipaaResponse.text();
    console.log('Status:', hipaaResponse.status);
    console.log('Response:', hipaaData.substring(0, 300) + '...');
    console.log('');
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testPublicComplianceAPI();
