/**
 * Direct Test: Create Mail Request
 * Test the create mail endpoint directly to see detailed error
 */

const BASE_URL = 'http://localhost:3000';

async function testCreateMailDirect() {
  console.log('🧪 Testing Create Mail Request Directly...');
  console.log('============================================================\n');

  const testData = {
    userId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID for testing
    recipient: {
      name: 'Test Recipient',
      address: {
        name: 'Test Recipient',
        address1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      },
    },
    sender: {
      name: 'Test Sender',
      address: {
        name: 'Test Sender',
        address1: '456 Business Avenue',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
        country: 'US',
      },
    },
    letter: {
      subject: 'Test Letter',
      content: 'This is a test letter content.',
      type: 'dispute',
    },
    serviceTier: 'basic',
    additionalServices: {
      returnReceipt: true,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}/api/certified-mail/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const responseText = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response Body:', responseText);

    if (response.ok) {
      console.log('✅ Create mail request successful!');
      const data = JSON.parse(responseText);
      console.log('Response data:', data);
    } else {
      console.log('❌ Create mail request failed');
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
testCreateMailDirect().catch(console.error);
