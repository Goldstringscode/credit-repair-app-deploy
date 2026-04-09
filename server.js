/**
 * Custom Next.js Server with WebSocket Support
 * This file enables WebSocket functionality alongside Next.js
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3005;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server,
    path: '/ws/communications'
  });

  // WebSocket connection handling
  wss.on('connection', (ws, request) => {
    const url = parse(request.url || '', true);
    const userId = url.query.userId;
    
    if (!userId) {
      console.log('❌ WebSocket connection rejected: No userId provided');
      ws.close(1008, 'User ID required');
      return;
    }

    console.log(`🔌 User ${userId} connected to WebSocket`);
    
    // Store user ID on the connection
    ws.userId = userId;
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      userId,
      timestamp: Date.now()
    }));

    // Handle messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📨 WebSocket message received:', message.type);
        
        // Handle different message types
        switch (message.type) {
          case 'send_message':
            // Broadcast new message only to clients subscribed to the same channel
            wss.clients.forEach((client) => {
              if (client.readyState === 1 &&
                  (client.currentChannel === message.data.channelId || client === ws)) {
                client.send(JSON.stringify({
                  type: 'new_message',
                  data: {
                    ...message.data,
                    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                    senderId: userId
                  }
                }));
              }
            });
            break;
          case 'join_channel':
            // Handle channel join
            ws.currentChannel = message.data.channelId;
            console.log(`User ${userId} joined channel ${message.data.channelId}`);
            break;
          case 'leave_channel':
            // Handle channel leave
            ws.currentChannel = null;
            console.log(`User ${userId} left channel ${message.data.channelId}`);
            break;
          default:
            // Broadcast other messages to all clients
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === 1) {
                client.send(JSON.stringify(message));
              }
            });
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log(`🔌 User ${userId} disconnected from WebSocket`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for user ${userId}:`, error);
    });
  });

  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server running on ws://${hostname}:${port}/ws/communications`);
  });
});
