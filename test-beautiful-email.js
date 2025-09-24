const fetch = require('node-fetch');

async function testBeautifulEmail() {
  try {
    console.log('🧪 Testing beautiful email templates...');
    
    const response = await fetch('http://localhost:3000/api/email/credit-repair', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'send_test',
        templateId: 'welcome-new-user',
        to: 'test@example.com',
        testData: {
          userName: 'John Doe',
          userEmail: 'test@example.com',
          dashboardUrl: 'http://localhost:3000/dashboard'
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('Message:', result.message);
    } else {
      console.log('❌ Error sending email:');
      console.log('Status:', response.status);
      console.log('Error:', result.error);
      console.log('Details:', result.details);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testBeautifulEmail();
