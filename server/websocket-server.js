const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class MLMWebSocketServer {
  constructor(port = 3001) {
    this.port = port;
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket
    this.channels = new Map(); // channelId -> Set of userIds
    this.typingUsers = new Map(); // channelId -> Set of userIds
    this.presence = new Map(); // userId -> { status, lastSeen, activity }
  }

  start() {
    this.wss = new WebSocket.Server({ port: this.port });
    
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(ws);
      });
    });

    console.log(`MLM WebSocket server running on port ${this.port}`);
  }

  handleMessage(ws, message) {
    const { type, data, token } = message;

    // Authenticate user
    if (!token) {
      ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const userId = decoded.userId;

      switch (type) {
        case 'authenticate':
          this.authenticateUser(ws, userId, data);
          break;
        case 'join_channel':
          this.joinChannel(ws, userId, data.channelId);
          break;
        case 'leave_channel':
          this.leaveChannel(ws, userId, data.channelId);
          break;
        case 'send_message':
          this.sendMessage(ws, userId, data);
          break;
        case 'typing_start':
          this.handleTypingStart(ws, userId, data.channelId);
          break;
        case 'typing_stop':
          this.handleTypingStop(ws, userId, data.channelId);
          break;
        case 'update_presence':
          this.updatePresence(ws, userId, data);
          break;
        case 'react_to_message':
          this.handleReaction(ws, userId, data);
          break;
        case 'pin_message':
          this.handlePinMessage(ws, userId, data);
          break;
        case 'star_message':
          this.handleStarMessage(ws, userId, data);
          break;
        case 'edit_message':
          this.handleEditMessage(ws, userId, data);
          break;
        case 'delete_message':
          this.handleDeleteMessage(ws, userId, data);
          break;
        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('Authentication error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
    }
  }

  authenticateUser(ws, userId, userData) {
    this.clients.set(userId, ws);
    this.presence.set(userId, {
      status: 'online',
      lastSeen: new Date(),
      activity: 'active'
    });

    ws.userId = userId;
    ws.send(JSON.stringify({
      type: 'authenticated',
      data: { userId, userData }
    }));

    // Broadcast presence update
    this.broadcastPresenceUpdate(userId, 'online');
  }

  joinChannel(ws, userId, channelId) {
    if (!this.channels.has(channelId)) {
      this.channels.set(channelId, new Set());
    }
    
    this.channels.get(channelId).add(userId);
    
    // Notify other users in the channel
    this.broadcastToChannel(channelId, {
      type: 'user_joined',
      data: { userId, channelId }
    }, userId);
  }

  leaveChannel(ws, userId, channelId) {
    if (this.channels.has(channelId)) {
      this.channels.get(channelId).delete(userId);
      
      // Notify other users in the channel
      this.broadcastToChannel(channelId, {
        type: 'user_left',
        data: { userId, channelId }
      }, userId);
    }
  }

  sendMessage(ws, userId, messageData) {
    const { channelId, content, type, attachments } = messageData;
    
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channelId,
      senderId: userId,
      content,
      type: type || 'text',
      attachments: attachments || [],
      timestamp: new Date(),
      reactions: [],
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      isFlagged: false,
      readBy: [userId]
    };

    // Broadcast to all users in the channel
    this.broadcastToChannel(channelId, {
      type: 'new_message',
      data: message
    });

    // Stop typing indicator
    this.handleTypingStop(ws, userId, channelId);
  }

  handleTypingStart(ws, userId, channelId) {
    if (!this.typingUsers.has(channelId)) {
      this.typingUsers.set(channelId, new Set());
    }
    
    this.typingUsers.get(channelId).add(userId);
    
    // Broadcast typing indicator to other users in the channel
    this.broadcastToChannel(channelId, {
      type: 'typing_start',
      data: { userId, channelId }
    }, userId);
  }

  handleTypingStop(ws, userId, channelId) {
    if (this.typingUsers.has(channelId)) {
      this.typingUsers.get(channelId).delete(userId);
      
      // Broadcast typing stop to other users in the channel
      this.broadcastToChannel(channelId, {
        type: 'typing_stop',
        data: { userId, channelId }
      }, userId);
    }
  }

  updatePresence(ws, userId, presenceData) {
    const currentPresence = this.presence.get(userId) || {};
    const updatedPresence = {
      ...currentPresence,
      ...presenceData,
      lastSeen: new Date()
    };
    
    this.presence.set(userId, updatedPresence);
    
    // Broadcast presence update to all connected users
    this.broadcastPresenceUpdate(userId, updatedPresence.status);
  }

  handleReaction(ws, userId, reactionData) {
    const { messageId, channelId, emoji } = reactionData;
    
    // Broadcast reaction to all users in the channel
    this.broadcastToChannel(channelId, {
      type: 'message_reaction',
      data: { messageId, userId, emoji, channelId }
    });
  }

  handlePinMessage(ws, userId, pinData) {
    const { messageId, channelId, action } = pinData;
    
    // Broadcast pin action to all users in the channel
    this.broadcastToChannel(channelId, {
      type: 'message_pin',
      data: { messageId, userId, action, channelId }
    });
  }

  handleStarMessage(ws, userId, starData) {
    const { messageId, channelId, action } = starData;
    
    // Broadcast star action to all users in the channel
    this.broadcastToChannel(channelId, {
      type: 'message_star',
      data: { messageId, userId, action, channelId }
    });
  }

  handleEditMessage(ws, userId, editData) {
    const { messageId, channelId, content } = editData;
    
    // Broadcast edit to all users in the channel
    this.broadcastToChannel(channelId, {
      type: 'message_edit',
      data: { messageId, userId, content, channelId }
    });
  }

  handleDeleteMessage(ws, userId, deleteData) {
    const { messageId, channelId } = deleteData;
    
    // Broadcast deletion to all users in the channel
    this.broadcastToChannel(channelId, {
      type: 'message_delete',
      data: { messageId, userId, channelId }
    });
  }

  broadcastToChannel(channelId, message, excludeUserId = null) {
    if (!this.channels.has(channelId)) return;
    
    const channelUsers = this.channels.get(channelId);
    
    channelUsers.forEach(userId => {
      if (userId !== excludeUserId && this.clients.has(userId)) {
        const client = this.clients.get(userId);
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      }
    });
  }

  broadcastPresenceUpdate(userId, status) {
    const presenceData = this.presence.get(userId);
    if (!presenceData) return;
    
    const message = {
      type: 'presence_update',
      data: { userId, status, ...presenceData }
    };
    
    // Broadcast to all connected users
    this.clients.forEach((client, clientUserId) => {
      if (clientUserId !== userId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  handleDisconnect(ws) {
    if (ws.userId) {
      const userId = ws.userId;
      this.clients.delete(userId);
      
      // Update presence to offline
      this.presence.set(userId, {
        ...this.presence.get(userId),
        status: 'offline',
        lastSeen: new Date()
      });
      
      // Broadcast offline status
      this.broadcastPresenceUpdate(userId, 'offline');
      
      // Remove from all channels
      this.channels.forEach((channelUsers, channelId) => {
        if (channelUsers.has(userId)) {
          channelUsers.delete(userId);
          this.broadcastToChannel(channelId, {
            type: 'user_left',
            data: { userId, channelId }
          });
        }
      });
      
      // Remove from typing indicators
      this.typingUsers.forEach((typingUsers, channelId) => {
        if (typingUsers.has(userId)) {
          typingUsers.delete(userId);
          this.broadcastToChannel(channelId, {
            type: 'typing_stop',
            data: { userId, channelId }
          });
        }
      });
    }
  }

  stop() {
    if (this.wss) {
      this.wss.close();
      console.log('MLM WebSocket server stopped');
    }
  }
}

module.exports = MLMWebSocketServer;

// Start server if run directly
if (require.main === module) {
  const server = new MLMWebSocketServer();
  server.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down WebSocket server...');
    server.stop();
    process.exit(0);
  });
}
