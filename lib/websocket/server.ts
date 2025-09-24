/**
 * WebSocket Server for Real-time MLM Communications
 * Handles real-time messaging, typing indicators, and presence
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'stop_typing' | 'user_join' | 'user_leave' | 'message_status' | 'presence';
  channelId?: string;
  userId?: string;
  data?: any;
  timestamp?: number;
}

export interface ConnectedUser {
  userId: string;
  socket: WebSocket;
  channels: Set<string>;
  lastSeen: number;
  isTyping: boolean;
  typingChannel?: string;
}

export class MLMWebSocketServer {
  private wss: WebSocketServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private channelSubscribers: Map<string, Set<string>> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/communications'
    });

    this.setupEventHandlers();
    console.log('🔌 MLM WebSocket Server started on /ws/communications');
  }

  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const url = parse(request.url || '', true);
      const userId = url.query.userId as string;
      
      if (!userId) {
        console.log('❌ WebSocket connection rejected: No userId provided');
        ws.close(1008, 'User ID required');
        return;
      }

      console.log(`🔌 User ${userId} connected to WebSocket`);
      
      // Register user
      this.registerUser(userId, ws);
      
      // Handle messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(userId, message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log(`🔌 User ${userId} disconnected from WebSocket`);
        this.unregisterUser(userId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for user ${userId}:`, error);
        this.unregisterUser(userId);
      });

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connected',
        userId,
        timestamp: Date.now()
      }));
    });
  }

  private registerUser(userId: string, socket: WebSocket) {
    const user: ConnectedUser = {
      userId,
      socket,
      channels: new Set(),
      lastSeen: Date.now(),
      isTyping: false
    };
    
    this.connectedUsers.set(userId, user);
    
    // Broadcast user presence
    this.broadcastPresenceUpdate(userId, 'online');
  }

  private unregisterUser(userId: string) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      // Remove from all channels
      user.channels.forEach(channelId => {
        this.removeUserFromChannel(userId, channelId);
      });
      
      this.connectedUsers.delete(userId);
      
      // Broadcast user presence
      this.broadcastPresenceUpdate(userId, 'offline');
    }
  }

  private handleMessage(userId: string, message: WebSocketMessage) {
    const user = this.connectedUsers.get(userId);
    if (!user) return;

    switch (message.type) {
      case 'join_channel':
        this.joinChannel(userId, message.channelId!);
        break;
        
      case 'leave_channel':
        this.leaveChannel(userId, message.channelId!);
        break;
        
      case 'typing':
        this.handleTyping(userId, message.channelId!, true);
        break;
        
      case 'stop_typing':
        this.handleTyping(userId, message.channelId!, false);
        break;
        
      case 'message':
        this.broadcastMessage(message);
        break;
        
      case 'message_status':
        this.broadcastMessageStatus(message);
        break;
        
      case 'ping':
        // Handle ping message for heartbeat
        user.lastSeen = Date.now();
        // Send pong response
        user.socket.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now()
        }));
        break;
        
      default:
        console.log(`❓ Unknown message type: ${message.type}`);
    }
  }

  private joinChannel(userId: string, channelId: string) {
    const user = this.connectedUsers.get(userId);
    if (!user) return;

    user.channels.add(channelId);
    
    if (!this.channelSubscribers.has(channelId)) {
      this.channelSubscribers.set(channelId, new Set());
    }
    this.channelSubscribers.get(channelId)!.add(userId);

    console.log(`👥 User ${userId} joined channel ${channelId}`);
    
    // Notify channel members
    this.broadcastToChannel(channelId, {
      type: 'user_join',
      channelId,
      userId,
      timestamp: Date.now()
    }, userId);
  }

  private leaveChannel(userId: string, channelId: string) {
    this.removeUserFromChannel(userId, channelId);
    
    console.log(`👥 User ${userId} left channel ${channelId}`);
    
    // Notify channel members
    this.broadcastToChannel(channelId, {
      type: 'user_leave',
      channelId,
      userId,
      timestamp: Date.now()
    });
  }

  private removeUserFromChannel(userId: string, channelId: string) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.channels.delete(channelId);
    }
    
    const subscribers = this.channelSubscribers.get(channelId);
    if (subscribers) {
      subscribers.delete(userId);
      if (subscribers.size === 0) {
        this.channelSubscribers.delete(channelId);
      }
    }
  }

  private handleTyping(userId: string, channelId: string, isTyping: boolean) {
    const user = this.connectedUsers.get(userId);
    if (!user) return;

    user.isTyping = isTyping;
    user.typingChannel = isTyping ? channelId : undefined;

    this.broadcastToChannel(channelId, {
      type: isTyping ? 'typing' : 'stop_typing',
      channelId,
      userId,
      timestamp: Date.now()
    }, userId);
  }

  private broadcastMessage(message: WebSocketMessage) {
    if (!message.channelId) return;

    console.log(`📤 Broadcasting message to channel ${message.channelId}`);
    this.broadcastToChannel(message.channelId, message);
  }

  private broadcastMessageStatus(message: WebSocketMessage) {
    if (!message.channelId) return;

    this.broadcastToChannel(message.channelId, message);
  }

  private broadcastToChannel(channelId: string, message: WebSocketMessage, excludeUserId?: string) {
    const subscribers = this.channelSubscribers.get(channelId);
    if (!subscribers) return;

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    subscribers.forEach(userId => {
      if (userId === excludeUserId) return;
      
      const user = this.connectedUsers.get(userId);
      if (user && user.socket.readyState === WebSocket.OPEN) {
        user.socket.send(messageStr);
        sentCount++;
      }
    });

    console.log(`📡 Message sent to ${sentCount} users in channel ${channelId}`);
  }

  private broadcastPresenceUpdate(userId: string, status: 'online' | 'offline') {
    // Get all channels this user was in
    const user = this.connectedUsers.get(userId);
    if (!user) return;

    const channels = Array.from(user.channels);
    
    channels.forEach(channelId => {
      this.broadcastToChannel(channelId, {
        type: 'presence',
        userId,
        status,
        timestamp: Date.now()
      });
    });
  }

  // Public methods for external use
  public broadcastToUser(userId: string, message: WebSocketMessage) {
    const user = this.connectedUsers.get(userId);
    if (user && user.socket.readyState === WebSocket.OPEN) {
      user.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public getChannelUsers(channelId: string): string[] {
    const subscribers = this.channelSubscribers.get(channelId);
    return subscribers ? Array.from(subscribers) : [];
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

export default MLMWebSocketServer;
