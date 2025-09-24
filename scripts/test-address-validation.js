/**
 * Test Address Validation Directly
 */

const BASE_URL = 'http://localhost:3000';

async function testAddressValidation() {
  console.log('🧪 Testing Address Validation Directly...');
  console.log('============================================================\n');

  const testAddress = {
    name: 'Test Recipient',
    address1: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
  };

  try {
    const response = await fetch(`${BASE_URL}/api/certified-mail/validate-address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: testAddress }),
    });

    const responseText = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Body:', responseText);

    if (response.ok) {
      console.log('✅ Address validation successful!');
      const data = JSON.parse(responseText);
      console.log('Validation result:', data);
    } else {
      console.log('❌ Address validation failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Run the test
testAddressValidation().catch(console.error);
