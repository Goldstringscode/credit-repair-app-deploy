const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('🧪 Testing AI Letter Generation System...\n');

  try {
    // Test 1: System Status
    console.log('1️⃣ Testing System Status...');
    const statusResponse = await fetch(`${BASE_URL}/api/disputes/system-status`);
    const statusData = await statusResponse.json();
    
    if (statusResponse.ok && statusData.success) {
      console.log('✅ System Status:', statusData.data);
    } else {
      console.log('❌ System Status Failed:', statusData);
    }

    // Test 2: Generate Letter
    console.log('\n2️⃣ Testing Letter Generation...');
    const letterData = {
      personalInfo: {
        firstName: "John",
        lastName: "Doe",
        address: "123 Main Street",
        city: "Anytown",
        state: "CA",
        zipCode: "90210",
        phone: "(555) 123-4567",
        email: "test@email.com",
        ssnLast4: "1234",
        dateOfBirth: "1985-03-15"
      },
      disputeItems: [
        {
          id: "item_1",
          creditorName: "Test Bank",
          accountNumber: "****1234",
          itemType: "late_payment",
          dateReported: "2024-01-15",
          status: "disputed",
          disputeReason: "Payment was made on time but reported as late"
        }
      ],
      letterType: "standard",
      creditBureau: "experian"
    };

    const letterResponse = await fetch(`${BASE_URL}/api/disputes/generate-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(letterData)
    });

    const letterResult = await letterResponse.json();
    
    if (letterResponse.ok && letterResult.success) {
      console.log('✅ Letter Generated Successfully!');
      console.log('📝 Letter ID:', letterResult.data.letter.id);
      console.log('📊 Quality Score:', letterResult.data.letter.metadata.qualityScore);
      console.log('🔄 Uniqueness Score:', letterResult.data.letter.metadata.uniquenessScore);
      console.log('📏 Content Length:', letterResult.data.letter.content.length, 'characters');
      
      // Show first 200 characters of the letter
      const preview = letterResult.data.letter.content.substring(0, 200) + '...';
      console.log('📄 Letter Preview:', preview);
    } else {
      console.log('❌ Letter Generation Failed:', letterResult);
    }

    // Test 3: Reset Uniqueness
    console.log('\n3️⃣ Testing Uniqueness Reset...');
    const resetResponse = await fetch(`${BASE_URL}/api/disputes/reset-uniqueness`, {
      method: 'POST'
    });
    
    const resetResult = await resetResponse.json();
    
    if (resetResponse.ok && resetResult.success) {
      console.log('✅ Uniqueness Reset Successful');
    } else {
      console.log('❌ Uniqueness Reset Failed:', resetResult);
    }

    // Test 4: Generate Another Letter (to test uniqueness)
    console.log('\n4️⃣ Testing Second Letter Generation...');
    const letterResponse2 = await fetch(`${BASE_URL}/api/disputes/generate-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(letterData)
    });

    const letterResult2 = await letterResponse2.json();
    
    if (letterResponse2.ok && letterResult2.success) {
      console.log('✅ Second Letter Generated Successfully!');
      console.log('📝 Letter ID:', letterResult2.data.letter.id);
      console.log('📊 Quality Score:', letterResult2.data.letter.metadata.qualityScore);
      console.log('🔄 Uniqueness Score:', letterResult2.data.letter.metadata.uniquenessScore);
      
      // Check if content is different
      if (letterResult.data.letter.content !== letterResult2.data.letter.content) {
        console.log('✅ Content is different (uniqueness working)');
      } else {
        console.log('⚠️ Content is the same (uniqueness may not be working)');
      }
    } else {
      console.log('❌ Second Letter Generation Failed:', letterResult2);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testEndpoints();
