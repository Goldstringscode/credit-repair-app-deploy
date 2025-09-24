import { useState, useEffect, useCallback, useRef } from 'react';
// import useWebSocket from './useWebSocket'; // Disabled since WebSocket server doesn't exist
import { WebSocketMessage } from '@/lib/websocket/server';
import { emitVoiceDebug } from '@/components/debug/VoiceMessageDebugger';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  rank: string;
  activity?: string;
  customStatus?: string;
  isModerator?: boolean;
  isAdmin?: boolean;
  isOwner?: boolean;
  joinDate?: Date;
  messageCount?: number;
  reactionCount?: number;
}

interface Channel {
  id: string;
  name: string;
  type: 'team' | 'direct' | 'group';
  description?: string;
  members: User[];
  unreadCount: number;
  lastMessage?: {
    content: string;
    sender: User;
    timestamp: Date;
  };
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  channelId: string;
  isEdited: boolean;
  isDeleted: boolean;
  reactions: Array<{
    emoji: string;
    userId: string;
    timestamp: Date;
  }>;
  isPinned: boolean;
  isFlagged: boolean;
  readBy: string[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  replyTo?: {
    id: string;
    content: string;
    sender: User;
  };
  threadId?: string;
  isStarred?: boolean;
}

const mockUsers: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Smith',
    email: 'john@example.com',
    avatar: '/avatars/john.jpg',
    status: 'online',
    lastSeen: new Date(),
    rank: 'Diamond',
    activity: 'active',
    customStatus: 'Building my team!',
    isModerator: true,
    isAdmin: false,
    isOwner: false,
    joinDate: new Date('2023-01-15'),
    messageCount: 245,
    reactionCount: 89
  },
  {
    id: 'mlm-user-456',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: '/avatars/sarah.jpg',
    status: 'online',
    lastSeen: new Date(),
    rank: 'Gold',
    activity: 'active',
    customStatus: 'Ready to help!',
    isModerator: false,
    isAdmin: false,
    isOwner: false,
    joinDate: new Date('2023-02-20'),
    messageCount: 189,
    reactionCount: 67
  },
  {
    id: 'mlm-user-789',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    avatar: '/avatars/mike.jpg',
    status: 'away',
    lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    rank: 'Silver',
    activity: 'away',
    customStatus: 'In a meeting',
    isModerator: false,
    isAdmin: false,
    isOwner: false,
    joinDate: new Date('2023-03-10'),
    messageCount: 156,
    reactionCount: 43
  }
];

const mockChannels: Channel[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'general',
    type: 'team',
    description: 'General team discussions',
    members: mockUsers,
    unreadCount: 3,
    lastMessage: {
      content: 'Welcome to the team!',
      sender: mockUsers[0],
      timestamp: new Date(Date.now() - 60000)
    },
    isPinned: true,
    isMuted: false,
    isArchived: false,
    createdBy: mockUsers[0],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'announcements',
    type: 'team',
    description: 'Important announcements',
    members: mockUsers,
    unreadCount: 1,
    lastMessage: {
      content: 'New commission structure announced!',
      sender: mockUsers[0],
      timestamp: new Date(Date.now() - 300000)
    },
    isPinned: true,
    isMuted: false,
    isArchived: false,
    createdBy: mockUsers[0],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'training',
    type: 'team',
    description: 'Training and development',
    members: mockUsers,
    unreadCount: 0,
    lastMessage: {
      content: 'Check out the new training materials',
      sender: mockUsers[1],
      timestamp: new Date(Date.now() - 600000)
    },
    isPinned: false,
    isMuted: false,
    isArchived: false,
    createdBy: mockUsers[1],
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date()
  }
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    content: 'Welcome to the MLM communication system!',
    sender: mockUsers[0],
    timestamp: new Date(Date.now() - 3600000),
    type: 'text',
    channelId: '1',
    isEdited: false,
    isDeleted: false,
    reactions: [
      { emoji: '👋', userId: 'mlm-user-456', timestamp: new Date() },
      { emoji: '🎉', userId: 'mlm-user-789', timestamp: new Date() }
    ],
    isPinned: false,
    isFlagged: false,
    readBy: ['550e8400-e29b-41d4-a716-446655440000', 'mlm-user-456'],
    isStarred: false
  },
  {
    id: 'msg-2',
    content: 'This is a great platform for team communication!',
    sender: mockUsers[1],
    timestamp: new Date(Date.now() - 1800000),
    type: 'text',
    channelId: '1',
    isEdited: false,
    isDeleted: false,
    reactions: [
      { emoji: '👍', userId: '550e8400-e29b-41d4-a716-446655440000', timestamp: new Date() }
    ],
    isPinned: false,
    isFlagged: false,
    readBy: ['550e8400-e29b-41d4-a716-446655440000', 'mlm-user-456'],
    isStarred: true
  },
  {
    id: 'msg-3',
    content: 'Let\'s work together to build our business!',
    sender: mockUsers[2],
    timestamp: new Date(Date.now() - 900000),
    type: 'text',
    channelId: '1',
    isEdited: false,
    isDeleted: false,
    reactions: [],
    isPinned: true,
    isFlagged: false,
    readBy: ['550e8400-e29b-41d4-a716-446655440000'],
    isStarred: false
  }
];

export const useMLMCommunications = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channelMessages, setChannelMessages] = useState<Map<string, Message[]>>(new Map()); // Store messages per channel
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [messageStatuses, setMessageStatuses] = useState<Map<string, 'sending' | 'sent' | 'delivered' | 'read' | 'failed'>>(new Map());
  
  // WebSocket integration - DISABLED for now since server doesn't exist
  // Mock WebSocket functions to prevent connection errors
  const isConnected = true;
  const isConnecting = false;
  const wsError = null;
  const wsConnect = () => Promise.resolve();
  const wsDisconnect = () => {};
  const wsSendMessage = () => false;
  const wsJoinChannel = () => {};
  const wsLeaveChannel = () => {};
  const wsSendTyping = () => {};
  const wsBroadcastMessage = () => {};
  const wsUpdateMessageStatus = () => {};

  // Mock WebSocket message handler
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log('📨 WebSocket message received (mocked):', message);
  };

  // Original WebSocket code (commented out):
  /*
  const {
    isConnected,
    isConnecting,
    error: wsError,
    connect: wsConnect,
    disconnect: wsDisconnect,
    sendMessage: wsSendMessage,
    joinChannel: wsJoinChannel,
    leaveChannel: wsLeaveChannel,
    sendTyping: wsSendTyping,
    broadcastMessage: wsBroadcastMessage,
    updateMessageStatus: wsUpdateMessageStatus
  } = useWebSocket({
    url: 'ws://localhost:3000/ws/communications',
    userId: '550e8400-e29b-41d4-a716-446655440000', // TODO: Get from auth
    autoConnect: false, // Disable WebSocket for now since server doesn't exist
    onConnect: () => {
      console.log('✅ WebSocket connected');
      if (selectedChannel) {
        wsJoinChannel(selectedChannel.id);
      }
    },
    onDisconnect: () => {
      console.log('❌ WebSocket disconnected');
    },
    onMessage: (message: WebSocketMessage) => {
      handleWebSocketMessage(message);
    },
    onTyping: (userId: string, channelId: string) => {
      if (selectedChannel?.id === channelId) {
        setTypingUsers(prev => new Set([...prev, userId]));
      }
    },
    onStopTyping: (userId: string, channelId: string) => {
      if (selectedChannel?.id === channelId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    onUserJoin: (userId: string, channelId: string) => {
      console.log(`👥 User ${userId} joined channel ${channelId}`);
    },
    onUserLeave: (userId: string, channelId: string) => {
      console.log(`👥 User ${userId} left channel ${channelId}`);
    },
    onPresence: (userId: string, status: 'online' | 'offline') => {
      if (status === 'online') {
        setOnlineUsers(prev => new Set([...prev, userId]));
      } else {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    onError: (error) => {
      console.error('❌ WebSocket error:', error);
      setError(error.message);
    }
  });
  */

  // WebSocket message handler (commented out since we're not using WebSocket)
  /*
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'message':
        if (message.data && selectedChannel?.id === message.channelId) {
          setMessages(prev => [...prev, message.data]);
        }
        break;
      case 'message_status':
        if (message.data?.messageId) {
          setMessageStatuses(prev => new Map(prev.set(message.data.messageId, message.data.status)));
        }
        break;
      case 'user_join':
        console.log(`👥 User ${message.userId} joined channel ${message.channelId}`);
        break;
      case 'user_leave':
        console.log(`👥 User ${message.userId} left channel ${message.channelId}`);
        break;
      case 'presence':
        if (message.data?.status === 'online') {
          setOnlineUsers(prev => new Set([...prev, message.userId!]));
        } else {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(message.userId!);
            return newSet;
          });
        }
        break;
      default:
        console.log(`❓ Unknown WebSocket message type: ${message.type}`);
    }
  }, [selectedChannel]);
  */

  // Old WebSocket message handler - removed (commented out)
  /*
  const oldHandleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'authenticated':
        console.log('WebSocket authenticated:', data.data);
        break;
      case 'new_message':
        setMessages(prev => [...prev, data.data]);
        break;
      case 'message_reaction':
        setMessages(prev => prev.map(msg => 
          msg.id === data.data.messageId 
            ? { ...msg, reactions: [...(msg.reactions || []), { emoji: data.data.emoji, userId: data.data.userId, timestamp: new Date() }] }
            : msg
        ));
        break;
      case 'typing_start':
        setTypingUsers(prev => new Set([...prev, data.data.userId]));
        break;
      case 'typing_stop':
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.data.userId);
          return newSet;
        });
        break;
      case 'presence_update':
        setUsers(prev => prev.map(user => 
          user.id === data.data.userId 
            ? { ...user, status: data.data.status, lastSeen: new Date(data.data.lastSeen) }
            : user
        ));
        break;
      case 'user_joined':
        console.log('User joined channel:', data.data);
        break;
      case 'user_left':
        console.log('User left channel:', data.data);
        break;
      case 'message_edit':
        setMessages(prev => prev.map(msg => 
          msg.id === data.data.messageId 
            ? { ...msg, content: data.data.content, isEdited: true }
            : msg
        ));
        break;
      case 'message_delete':
        setMessages(prev => prev.filter(msg => msg.id !== data.data.messageId));
        break;
      case 'message_pin':
        setMessages(prev => prev.map(msg => 
          msg.id === data.data.messageId 
            ? { ...msg, isPinned: data.data.action === 'pin' }
            : msg
        ));
        break;
      case 'message_star':
        setMessages(prev => prev.map(msg => 
          msg.id === data.data.messageId 
            ? { ...msg, isStarred: data.data.action === 'star' }
            : msg
        ));
        break;
      case 'error':
        console.error('WebSocket error:', data.message);
        setError(data.message);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);
  */

  // Send message via WebSocket
  const sendMessage = useCallback(async (channelId: string, content: string, type: string = 'text', attachments: any[] = []) => {
    console.log('🚀🚀🚀 sendMessage CALLED! 🚀🚀🚀', { channelId, content, type, attachments });
    console.log('🚀 Current messages state before sending:', messages);
    
    // Check if this is a voice message and block it
    if (type === 'audio' || content.includes('🎤 Voice message')) {
      console.log('🚀🚀🚀 VOICE MESSAGE DETECTED IN sendMessage - BLOCKING! 🚀🚀🚀');
      emitVoiceDebug('error', 'Voice message blocked from sendMessage function!', {
        message: 'Voice messages should only go through handleSendRecording!',
        attachments
      });
      throw new Error('Voice messages should not be sent through sendMessage function. Use handleSendRecording instead.');
    }
    
    // Process attachments - handle both File objects and processed attachment objects
    const processedAttachments = attachments.map((attachment, index) => {
      if (attachment instanceof File) {
        // If it's a File object, process it
        return {
          id: `attachment-${Date.now()}-${index}`,
          name: attachment.name,
          size: attachment.size,
          type: attachment.type,
          url: URL.createObjectURL(attachment)
        };
      } else {
        // If it's already processed, ensure it has an id and preserve all properties
        return {
          id: attachment.id || `attachment-${Date.now()}-${index}`,
          name: attachment.name || 'Unknown file',
          size: attachment.size || 0,
          type: attachment.type || 'application/octet-stream',
          url: attachment.url || '#',
          duration: attachment.duration || 0  // Preserve duration property
        };
      }
    });

    console.log('Processed attachments:', processedAttachments);

    // Set message status to sending
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMessageStatuses(prev => new Map(prev.set(messageId, 'sending')));

    try {
      // Save message via API
      const response = await fetch('http://localhost:3000/api/mlm/communication/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId,
          userId: '550e8400-e29b-41d4-a716-446655440000', // TODO: Get actual user ID from auth
          content,
          messageType: type,
          attachments: processedAttachments
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.data) {
        throw new Error('Invalid API response format');
      }

      const savedMessage = data.data;
      console.log('Message saved via API:', savedMessage);

      // Update message status to sent
      setMessageStatuses(prev => new Map(prev.set(savedMessage.id, 'sent')));

      // Broadcast via WebSocket if connected
      if (isConnected) {
        wsBroadcastMessage(channelId, savedMessage);
        // Update status to delivered after broadcast
        setTimeout(() => {
          setMessageStatuses(prev => new Map(prev.set(savedMessage.id, 'delivered')));
          wsUpdateMessageStatus(savedMessage.id, 'delivered', channelId);
        }, 100);
      }

      // Add message to local state immediately for UI responsiveness
      setMessages(prev => {
        console.log('Previous messages before adding:', prev);
        const updated = [...prev, savedMessage];
        console.log('Updated messages array after adding:', updated);
        console.log('✅ Message added to state successfully');
        return updated;
      });

      // Also update channel-specific messages
      setChannelMessages(prev => {
        const newMap = new Map(prev);
        const channelMsgs = newMap.get(channelId) || [];
        newMap.set(channelId, [...channelMsgs, savedMessage]);
        return newMap;
      });
      
      // Update channel's last message
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, lastMessage: savedMessage }
          : channel
      ));

      // If WebSocket is available, broadcast the message
      if (isConnected) {
        wsBroadcastMessage(channelId, savedMessage);
      }
    } catch (error) {
      console.error('Error saving message to database:', error);
      
      // Fallback: Add message to local state only
      const fallbackMessage: Message = {
        id: `local-${Date.now()}`,
        channelId: String(channelId),
        content,
        type: (type as 'text' | 'image' | 'file' | 'system') || 'text',
        sender: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'You',
          email: 'you@example.com',
          avatar: '/avatars/user-123.jpg',
          rank: 'Diamond',
          status: 'online' as const,
          lastSeen: new Date()
        },
        timestamp: new Date(),
        attachments: processedAttachments,
        reactions: [],
        isEdited: false,
        isDeleted: false,
        isPinned: false,
        isFlagged: false,
        readBy: ['550e8400-e29b-41d4-a716-446655440000']
      };

      console.log('Adding fallback message to local state:', fallbackMessage);
      setMessages(prev => [...prev, fallbackMessage]);
      
      // Also update channel-specific messages
      setChannelMessages(prev => {
        const newMap = new Map(prev);
        const channelMsgs = newMap.get(channelId) || [];
        newMap.set(channelId, [...channelMsgs, fallbackMessage]);
        return newMap;
      });
    }
  }, []);


  // Send reaction
  const sendReaction = useCallback((messageId: string, channelId: string, emoji: string) => {
    if (isConnected) {
      wsSendMessage({
        type: 'reaction',
        channelId,
        userId: '550e8400-e29b-41d4-a716-446655440000',
        data: { messageId, emoji },
        timestamp: Date.now()
      });
    }
  }, [isConnected, wsSendMessage]);

  // Send presence update
  const updatePresence = useCallback((status: string, activity?: string) => {
    if (isConnected) {
      wsSendMessage({
        type: 'presence',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        data: { status, activity },
        timestamp: Date.now()
      });
    }
  }, [isConnected, wsSendMessage]);



  // Load messages for a channel
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      emitVoiceDebug('info', 'Loading messages for channel', { channelId, selectedChannel: selectedChannel?.id });
      
      // Use API endpoint to load messages with aggressive cache-busting
      const cacheBuster = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const response = await fetch(`http://localhost:3000/api/mlm/communication/messages?channelId=${channelId}&userId=550e8400-e29b-41d4-a716-446655440000&t=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      emitVoiceDebug('info', 'API response received', { success: data.success, messageCount: data.data?.length || 0 });
      
      if (!data.success || !data.data) {
        throw new Error('Invalid API response format');
      }
      
      const apiMessages = data.data;
      
          // Debug voice messages specifically
          const voiceMessages = apiMessages.filter((msg: any) => msg.messageType === 'audio' || msg.type === 'audio');
          console.log('🎤 Voice messages loaded from API:', voiceMessages);
          voiceMessages.forEach((msg: any, index: number) => {
            console.log(`🎤 Voice message ${index + 1}:`, {
              id: msg.id,
              hasAttachments: !!msg.attachments,
              attachmentCount: msg.attachments?.length || 0,
              firstAttachment: msg.attachments?.[0],
              attachmentUrl: msg.attachments?.[0]?.url?.substring(0, 50) + '...'
            });
            
            // Check if voice message has blob URL
            if (msg.attachments?.[0]?.url?.startsWith('blob:')) {
              console.error('🚨 CRITICAL: Voice message loaded from API has BLOB URL!', {
                messageId: msg.id,
                attachmentUrl: msg.attachments[0].url
              });
            }
          });
      
      emitVoiceDebug('success', 'Messages loaded successfully', { 
        count: apiMessages.length, 
        firstMessage: apiMessages[0],
        voiceMessages: voiceMessages.length
      });
      console.log('First message sender:', apiMessages[0]?.sender);
      
        // Voice messages are now handled by the API and included in apiMessages
        // No need to merge from localStorage anymore
      
      // Store messages for this specific channel
      console.log('loadMessages - Storing messages for channel:', channelId);
      console.log('loadMessages - apiMessages:', apiMessages);
      console.log('loadMessages - apiMessages length:', apiMessages.length);
      
      // Update channel-specific messages
      setChannelMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(channelId, apiMessages);
        return newMap;
      });
      
      // Always update the main messages state for the current channel
      setMessages(apiMessages);
      
      console.log('📨 Messages loaded and set for channel:', channelId);
      console.log('📨 Number of messages set:', apiMessages.length);
      console.log('📨 First message content:', apiMessages[0]?.content || 'No messages');
    } catch (error) {
      console.error('Error loading messages from database:', error);
      console.log('Falling back to mock data due to database error');
      setError('Failed to load messages');
      
      // Fallback to mock data
      console.log('Using mock data fallback for channel:', channelId);
      const mockMessages = [
        {
          id: `mock-${channelId}-1`,
          channelId: channelId,
          content: `Welcome to channel ${channelId}!`,
          type: 'text' as const,
          messageType: 'text',
          timestamp: new Date(Date.now() - 3600000),
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          sender: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'System',
            email: 'system@example.com',
            avatar: '/placeholder.svg',
            rank: 'Admin',
            status: 'online' as const,
            lastSeen: new Date()
          },
          attachments: [],
          reactions: [],
          replies: [],
          isEdited: false,
          isDeleted: false,
          isPinned: false,
          isFlagged: false,
          isStarred: false,
          readBy: [],
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      console.log('Mock messages for channel:', mockMessages);
      
      // Store mock messages for this specific channel
      setChannelMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(channelId, mockMessages);
        return newMap;
      });
      
      // Always update the main messages state for the current channel
      setMessages(mockMessages);
      
      console.log('📨 Mock messages set for channel:', channelId);
      console.log('📨 Number of mock messages:', mockMessages.length);
    }
  }, []);

  // Load channels
  const loadChannels = useCallback(async () => {
    try {
      console.log('Loading channels from API...');
      setIsLoading(true);
      
      // Use API endpoint to load channels
      const cacheBuster = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const response = await fetch(`http://localhost:3000/api/mlm/communication/channels?userId=550e8400-e29b-41d4-a716-446655440000&t=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Channels API response:', data);
      
      if (data.success && data.data) {
        console.log('🔄 Setting channels state with data:', data.data);
        console.log('🔄 Data type:', typeof data.data);
        console.log('🔄 Data length:', data.data.length);
        setChannels(data.data);
        setForceUpdate(prev => prev + 1);
        console.log('🔄 Channels state set successfully, length:', data.data.length);
      } else {
        console.error('🔄 Invalid API response format:', data);
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error loading channels from API:', error);
      console.log('Falling back to mock channels due to API error');
      setError('Failed to load channels');
      
      // Fallback to mock data
      console.log('🔄 Setting mock channels:', mockChannels);
      setChannels(mockChannels);
      console.log('🔄 Mock channels set successfully');
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Initialize data
  useEffect(() => {
    console.log('🔄 useMLMCommunications: Initializing data');
    setUsers(mockUsers);
    
    // Connect to WebSocket
    wsConnect();

    return () => {
      wsDisconnect();
    };
  }, [wsConnect, wsDisconnect]);

  // Load channels separately to avoid dependency issues
  useEffect(() => {
    console.log('🔄 useMLMCommunications: Loading channels');
    loadChannels().then(() => {
      console.log('🔄 useMLMCommunications: loadChannels completed');
    }).catch((error) => {
      console.error('🔄 useMLMCommunications: loadChannels failed:', error);
    });
  }, []); // Empty dependency array - only run once

  // Remove test channels - they were overriding real data

  // Track channels changes
  useEffect(() => {
    console.log('📋 Channels state changed:', channels);
    console.log('📋 Channels length:', channels.length);
    console.log('📋 Channels type:', typeof channels);
    console.log('📋 Channels is array:', Array.isArray(channels));
    if (channels.length > 0) {
      console.log('📋 First channel:', channels[0]);
    }
  }, [channels]);

  // Track selectedChannel changes
  useEffect(() => {
    console.log('🎯 selectedChannel changed to:', selectedChannel);
    console.log('🎯 selectedChannel type:', typeof selectedChannel);
    console.log('🎯 selectedChannel id:', selectedChannel?.id);
  }, [selectedChannel]);


  // Ensure a channel is selected when channels are loaded
  useEffect(() => {
    if (channels.length > 0 && (selectedChannel === null || selectedChannel === undefined)) {
      console.log('🎯 No channel selected, setting first channel:', channels[0]);
      // Clear current messages immediately to prevent showing old messages
      setMessages([]);
      
      // Set the new selected channel
      setSelectedChannel(channels[0]);
      
      // Load messages for the new channel
      loadMessages(channels[0].id);
    }
  }, [channels, selectedChannel, loadMessages]);


  // Add reaction to a message
  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => {
        if (message.id === messageId) {
          const existingReaction = message.reactions.find(r => r.emoji === emoji && r.userId === '550e8400-e29b-41d4-a716-446655440000');
          if (!existingReaction) {
            // Create new reaction
            message.reactions.push({
              emoji,
              userId: '550e8400-e29b-41d4-a716-446655440000',
              timestamp: new Date()
            });
          }
        }
        return message;
      })
    );
  }, []);

  // Typing functionality
  const sendTypingIndicator = useCallback((channelId: string, isTyping: boolean) => {
    if (isConnected) {
      wsSendTyping(channelId, isTyping);
    }
  }, [isConnected, wsSendTyping]);

  // Channel management with WebSocket
  const joinChannel = useCallback((channelId: string) => {
    if (isConnected) {
      wsJoinChannel(channelId);
    }
  }, [isConnected, wsJoinChannel]);

  const leaveChannel = useCallback((channelId: string) => {
    if (isConnected) {
      wsLeaveChannel(channelId);
    }
  }, [isConnected, wsLeaveChannel]);

  // Select a channel
  const selectChannel = useCallback((channel: Channel) => {
    console.log('🎯 selectChannel called with:', channel);
    console.log('🎯 Current selectedChannel before change:', selectedChannel);
    console.log('🎯 Channel ID:', channel.id, 'Channel Name:', channel.name);
    
    // Clear current messages immediately to prevent showing old messages
    setMessages([]);
    
    // Set the new selected channel
    setSelectedChannel(channel);
    console.log('🎯 selectedChannel state updated to:', channel);
    
    // Join the channel via WebSocket
    if (isConnected) {
      wsJoinChannel(channel.id);
    }
    
    // Load messages for the new channel
    loadMessages(channel.id);
  }, [isConnected, wsJoinChannel, loadMessages]); // Added loadMessages dependency

  return {
    channels,
    selectedChannel,
    messages,
    users,
    isConnected: true, // Override to true since we're not using WebSocket
    isConnecting: false, // Override to false since we're not using WebSocket
    isLoading,
    error: error || wsError,
    typingUsers: Array.from(typingUsers),
    onlineUsers: Array.from(onlineUsers),
    messageStatuses,
    selectChannel,
    sendMessage,
    sendTypingIndicator,
    sendReaction,
    addReaction,
    updatePresence,
    joinChannel,
    leaveChannel,
    loadMessages,
    loadChannels,
    forceUpdate,
    // Development helpers
    clearCache: () => {
      console.log('🧹 Clearing all cached data...');
      setChannelMessages(new Map());
      setMessages([]);
      setSelectedChannel(null);
    },
    // WebSocket specific
    connect: wsConnect,
    disconnect: wsDisconnect
  };
};