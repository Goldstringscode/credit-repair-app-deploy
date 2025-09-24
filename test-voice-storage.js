// Test script to verify voice message storage
const testVoiceMessageStorage = async () => {
  console.log('Testing voice message storage...');
  
  // Test data
  const testData = {
    channelId: 'test-channel-123',
    userId: '550e8400-e29b-41d4-a716-446655440000',
    audioData: 'data:audio/webm;base64,test-audio-data',
    duration: 5,
    blobType: 'audio/webm',
    blobSize: 1024
  };

  try {
    // Test voice message creation
    const response = await fetch('http://localhost:3000/api/mlm/communication/messages', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Voice message created successfully:', result);
      
      // Test message retrieval
      const getResponse = await fetch(`http://localhost:3000/api/mlm/communication/messages?channelId=${testData.channelId}&userId=${testData.userId}`);
      
      if (getResponse.ok) {
        const messages = await getResponse.json();
        console.log('✅ Messages retrieved successfully:', messages);
        console.log('Voice message persisted:', messages.data.some(msg => msg.content.includes('Voice message')));
      } else {
        console.error('❌ Failed to retrieve messages');
      }
    } else {
      console.error('❌ Failed to create voice message');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run test if in browser
if (typeof window !== 'undefined') {
  testVoiceMessageStorage();
}

module.exports = { testVoiceMessageStorage };
