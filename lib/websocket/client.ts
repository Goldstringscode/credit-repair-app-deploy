/**
 * WebSocket Client for Real-time MLM Communications
 * Handles connection, reconnection, and message broadcasting
 */

import { WebSocketMessage, ConnectedUser } from './server';

export interface WebSocketClientConfig {
  url: string;
  userId: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface WebSocketEventHandler {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onTyping?: (userId: string, channelId: string) => void;
  onStopTyping?: (userId: string, channelId: string) => void;
  onUserJoin?: (userId: string, channelId: string) => void;
  onUserLeave?: (userId: string, channelId: string) => void;
  onPresence?: (userId: string, status: 'online' | 'offline') => void;
  onError?: (error: Error) => void;
}

export class MLMWebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketClientConfig;
  private eventHandlers: WebSocketEventHandler = {};
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isConnected = false;
  private currentChannels: Set<string> = new Set();

  constructor(config: WebSocketClientConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...config
    };
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected) {
        resolve();
        return;
      }

      this.isConnecting = true;
      const wsUrl = `${this.config.url}?userId=${this.config.userId}`;
      
      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      
      try {
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.isConnecting = false;
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Rejoin channels
          this.currentChannels.forEach(channelId => {
            this.joinChannel(channelId);
          });
          
          this.eventHandlers.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(`🔌 WebSocket disconnected: ${event.code} ${event.reason}`);
          this.isConnecting = false;
          this.isConnected = false;
          this.stopHeartbeat();
          
          this.eventHandlers.onDisconnect?.();
          
          // Attempt reconnection
          if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.eventHandlers.onError?.(new Error('WebSocket connection failed'));
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  public disconnect() {
    console.log('🔌 Disconnecting WebSocket');
    this.stopHeartbeat();
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.isConnected = false;
    this.currentChannels.clear();
  }

  public sendMessage(message: WebSocketMessage): boolean {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('❌ Error sending WebSocket message:', error);
      return false;
    }
  }

  public joinChannel(channelId: string) {
    this.currentChannels.add(channelId);
    
    if (this.isConnected) {
      this.sendMessage({
        type: 'join_channel',
        channelId,
        userId: this.config.userId,
        timestamp: Date.now()
      });
    }
  }

  public leaveChannel(channelId: string) {
    this.currentChannels.delete(channelId);
    
    if (this.isConnected) {
      this.sendMessage({
        type: 'leave_channel',
        channelId,
        userId: this.config.userId,
        timestamp: Date.now()
      });
    }
  }

  public sendTyping(channelId: string, isTyping: boolean) {
    this.sendMessage({
      type: isTyping ? 'typing' : 'stop_typing',
      channelId,
      userId: this.config.userId,
      timestamp: Date.now()
    });
  }

  public broadcastMessage(channelId: string, messageData: any) {
    this.sendMessage({
      type: 'message',
      channelId,
      userId: this.config.userId,
      data: messageData,
      timestamp: Date.now()
    });
  }

  public updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read', channelId: string) {
    this.sendMessage({
      type: 'message_status',
      channelId,
      userId: this.config.userId,
      data: { messageId, status },
      timestamp: Date.now()
    });
  }

  public setEventHandlers(handlers: WebSocketEventHandler) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  public isConnectionActive(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  public getCurrentChannels(): string[] {
    return Array.from(this.currentChannels);
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'connected':
        console.log(`✅ WebSocket connection confirmed for user ${message.userId}`);
        break;
        
      case 'message':
        this.eventHandlers.onMessage?.(message);
        break;
        
      case 'typing':
        this.eventHandlers.onTyping?.(message.userId!, message.channelId!);
        break;
        
      case 'stop_typing':
        this.eventHandlers.onStopTyping?.(message.userId!, message.channelId!);
        break;
        
      case 'user_join':
        this.eventHandlers.onUserJoin?.(message.userId!, message.channelId!);
        break;
        
      case 'user_leave':
        this.eventHandlers.onUserLeave?.(message.userId!, message.channelId!);
        break;
        
      case 'presence':
        this.eventHandlers.onPresence?.(message.userId!, message.data?.status);
        break;
        
      case 'error':
        console.error('❌ WebSocket server error:', message.data);
        this.eventHandlers.onError?.(new Error(message.data?.message || 'Unknown server error'));
        break;
        
      case 'pong':
        // Handle pong response for heartbeat
        console.log('🏓 Received pong from server');
        break;
        
      default:
        console.log(`❓ Unknown WebSocket message type: ${message.type}`);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Reconnection failed:', error);
      });
    }, delay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Send a ping message instead of using ws.ping() which is not available in browser
        this.ws.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }));
      }
    }, 30000); // Increased from 5000ms to 30000ms (30 seconds)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export default MLMWebSocketClient;
