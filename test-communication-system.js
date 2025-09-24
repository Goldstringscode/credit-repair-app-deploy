const WebSocket = require('ws');

// Test the MLM Communication System
async function testCommunicationSystem() {
  console.log('🧪 Testing MLM Communication System...\n');

  // Test 1: WebSocket Connection
  console.log('1. Testing WebSocket connection...');
  const ws = new WebSocket('ws://localhost:3001/ws/communications?userId=550e8400-e29b-41d4-a716-446655440000');
  
  ws.on('open', () => {
    console.log('✅ WebSocket connected successfully');
    
    // Test 2: Send a test message
    console.log('2. Testing message sending...');
    ws.send(JSON.stringify({
      type: 'send_message',
      data: {
        channelId: 'test-channel',
        content: 'Hello from test!',
        messageType: 'text'
      }
    }));
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('📨 Received message:', message.type);
    
    if (message.type === 'connected') {
      console.log('✅ Connection confirmed');
    } else if (message.type === 'new_message') {
      console.log('✅ Message broadcast working:', message.data.content);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket disconnected');
  });

  // Test 3: API Endpoints
  console.log('3. Testing API endpoints...');
  
  try {
    // Test channels endpoint
    const channelsResponse = await fetch('http://localhost:3000/api/mlm/communication/channels?userId=550e8400-e29b-41d4-a716-446655440000');
    const channelsData = await channelsResponse.json();
    console.log('✅ Channels API working:', channelsData.success ? 'Yes' : 'No');
    
    // Test messages endpoint
    const messagesResponse = await fetch('http://localhost:3000/api/mlm/communication/messages?channelId=test-channel&userId=550e8400-e29b-41d4-a716-446655440000');
    const messagesData = await messagesResponse.json();
    console.log('✅ Messages API working:', messagesData.success ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('❌ API test error:', error.message);
  }

  // Close connection after 5 seconds
  setTimeout(() => {
    ws.close();
    console.log('\n✅ Communication system test completed!');
    process.exit(0);
  }, 5000);
}

// Run the test
testCommunicationSystem().catch(console.error);
