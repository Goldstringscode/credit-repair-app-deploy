/**
 * React Hook for WebSocket Management
 * Provides easy integration with the MLM WebSocket client
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import MLMWebSocketClient, { WebSocketClientConfig, WebSocketEventHandler } from '@/lib/websocket/client';

export interface UseWebSocketOptions extends WebSocketClientConfig {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
  onTyping?: (userId: string, channelId: string) => void;
  onStopTyping?: (userId: string, channelId: string) => void;
  onUserJoin?: (userId: string, channelId: string) => void;
  onUserLeave?: (userId: string, channelId: string) => void;
  onPresence?: (userId: string, status: 'online' | 'offline') => void;
  onError?: (error: Error) => void;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  currentChannels: string[];
}

export function useWebSocket(options: UseWebSocketOptions) {
  const clientRef = useRef<MLMWebSocketClient | null>(null);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    currentChannels: []
  });

  // Initialize WebSocket client
  useEffect(() => {
    if (!clientRef.current) {
      const config: WebSocketClientConfig = {
        url: options.url,
        userId: options.userId,
        reconnectInterval: options.reconnectInterval,
        maxReconnectAttempts: options.maxReconnectAttempts,
        heartbeatInterval: options.heartbeatInterval
      };

      clientRef.current = new MLMWebSocketClient(config);
      
      // Set up event handlers
      const eventHandlers: WebSocketEventHandler = {
        onConnect: () => {
          setState(prev => ({ ...prev, isConnected: true, isConnecting: false, error: null }));
          options.onConnect?.();
        },
        onDisconnect: () => {
          setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
          options.onDisconnect?.();
        },
        onMessage: options.onMessage,
        onTyping: options.onTyping,
        onStopTyping: options.onStopTyping,
        onUserJoin: options.onUserJoin,
        onUserLeave: options.onUserLeave,
        onPresence: options.onPresence,
        onError: (error) => {
          setState(prev => ({ ...prev, error, isConnecting: false }));
          options.onError?.(error);
        }
      };

      clientRef.current.setEventHandlers(eventHandlers);
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [options.userId, options.url]);

  // Auto-connect if enabled
  useEffect(() => {
    if (options.autoConnect !== false && clientRef.current && !state.isConnected && !state.isConnecting) {
      setState(prev => ({ ...prev, isConnecting: true }));
      clientRef.current.connect().catch(error => {
        setState(prev => ({ ...prev, error, isConnecting: false }));
      });
    }
  }, [options.autoConnect, state.isConnected, state.isConnecting]);

  // Update current channels when they change
  useEffect(() => {
    if (clientRef.current && state.isConnected) {
      setState(prev => ({
        ...prev,
        currentChannels: clientRef.current!.getCurrentChannels()
      }));
    }
  }, [state.isConnected]);

  const connect = useCallback(async () => {
    if (clientRef.current && !state.isConnected && !state.isConnecting) {
      setState(prev => ({ ...prev, isConnecting: true }));
      try {
        await clientRef.current.connect();
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error, isConnecting: false }));
        throw error;
      }
    }
  }, [state.isConnected, state.isConnecting]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (clientRef.current) {
      return clientRef.current.sendMessage(message);
    }
    return false;
  }, []);

  const joinChannel = useCallback((channelId: string) => {
    if (clientRef.current) {
      clientRef.current.joinChannel(channelId);
      setState(prev => ({
        ...prev,
        currentChannels: [...new Set([...prev.currentChannels, channelId])]
      }));
    }
  }, []);

  const leaveChannel = useCallback((channelId: string) => {
    if (clientRef.current) {
      clientRef.current.leaveChannel(channelId);
      setState(prev => ({
        ...prev,
        currentChannels: prev.currentChannels.filter(id => id !== channelId)
      }));
    }
  }, []);

  const sendTyping = useCallback((channelId: string, isTyping: boolean) => {
    if (clientRef.current) {
      clientRef.current.sendTyping(channelId, isTyping);
    }
  }, []);

  const broadcastMessage = useCallback((channelId: string, messageData: any) => {
    if (clientRef.current) {
      clientRef.current.broadcastMessage(channelId, messageData);
    }
  }, []);

  const updateMessageStatus = useCallback((messageId: string, status: 'sent' | 'delivered' | 'read', channelId: string) => {
    if (clientRef.current) {
      clientRef.current.updateMessageStatus(messageId, status, channelId);
    }
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    joinChannel,
    leaveChannel,
    sendTyping,
    broadcastMessage,
    updateMessageStatus
  };
}

export default useWebSocket;
