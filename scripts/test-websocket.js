/**
 * WebSocket Test Script
 * Tests the real-time communication functionality
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:3002/ws/communications';
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

console.log('🧪 Testing WebSocket Real-time Communication...\n');

// Test 1: Basic Connection
console.log('1️⃣ Testing basic WebSocket connection...');
const ws = new WebSocket(`${WS_URL}?userId=${TEST_USER_ID}`);

ws.on('open', () => {
  console.log('✅ WebSocket connected successfully');
  
  // Test 2: Join Channel
  console.log('\n2️⃣ Testing channel join...');
  ws.send(JSON.stringify({
    type: 'join_channel',
    channelId: '550e8400-e29b-41d4-a716-446655440001',
    userId: TEST_USER_ID,
    timestamp: Date.now()
  }));
  
  // Test 3: Send Typing Indicator
  setTimeout(() => {
    console.log('\n3️⃣ Testing typing indicator...');
    ws.send(JSON.stringify({
      type: 'typing',
      channelId: '550e8400-e29b-41d4-a716-446655440001',
      userId: TEST_USER_ID,
      timestamp: Date.now()
    }));
    
    // Stop typing after 2 seconds
    setTimeout(() => {
      console.log('4️⃣ Testing stop typing...');
      ws.send(JSON.stringify({
        type: 'stop_typing',
        channelId: '550e8400-e29b-41d4-a716-446655440001',
        userId: TEST_USER_ID,
        timestamp: Date.now()
      }));
    }, 2000);
  }, 1000);
  
  // Test 4: Send Message
  setTimeout(() => {
    console.log('\n5️⃣ Testing message broadcast...');
    ws.send(JSON.stringify({
      type: 'message',
      channelId: '550e8400-e29b-41d4-a716-446655440001',
      userId: TEST_USER_ID,
      data: {
        id: 'test-msg-' + Date.now(),
        content: 'Hello from WebSocket test!',
        timestamp: new Date().toISOString()
      },
      timestamp: Date.now()
    }));
  }, 3000);
  
  // Test 5: Message Status Update
  setTimeout(() => {
    console.log('\n6️⃣ Testing message status update...');
    ws.send(JSON.stringify({
      type: 'message_status',
      channelId: '550e8400-e29b-41d4-a716-446655440001',
      userId: TEST_USER_ID,
      data: {
        messageId: 'test-msg-' + (Date.now() - 1000),
        status: 'delivered'
      },
      timestamp: Date.now()
    }));
  }, 4000);
  
  // Close connection after tests
  setTimeout(() => {
    console.log('\n7️⃣ Closing connection...');
    ws.close();
  }, 5000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📨 Received:', message.type, message);
  } catch (error) {
    console.log('📨 Received raw data:', data.toString());
  }
});

ws.on('close', (code, reason) => {
  console.log(`\n🔌 WebSocket closed: ${code} ${reason}`);
  console.log('\n✅ WebSocket tests completed!');
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  console.log('\n💡 Make sure the server is running with: npm run dev');
});
