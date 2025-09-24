import { NextRequest, NextResponse } from 'next/server';

// Mock data - in production, this would come from Supabase
const mockDirectMessages = [
  {
    id: '1',
    senderId: '1',
    recipientId: '2',
    content: 'Hey Sarah, how are you doing?',
    timestamp: new Date(Date.now() - 600000),
    type: 'text',
    isRead: true,
    readAt: new Date(Date.now() - 500000),
    attachments: [],
    created_at: new Date(Date.now() - 600000),
    updated_at: new Date(Date.now() - 600000),
  },
  {
    id: '2',
    senderId: '2',
    recipientId: '1',
    content: 'Hi John! I\'m doing great, thanks for asking. How about you?',
    timestamp: new Date(Date.now() - 500000),
    type: 'text',
    isRead: true,
    readAt: new Date(Date.now() - 400000),
    attachments: [],
    created_at: new Date(Date.now() - 500000),
    updated_at: new Date(Date.now() - 500000),
  },
  {
    id: '3',
    senderId: '1',
    recipientId: '3',
    content: 'Mike, can we schedule a call for tomorrow?',
    timestamp: new Date(Date.now() - 300000),
    type: 'text',
    isRead: false,
    readAt: null,
    attachments: [],
    created_at: new Date(Date.now() - 300000),
    updated_at: new Date(Date.now() - 300000),
  },
];

const mockConversations = [
  {
    id: '1',
    participants: [
      { id: '1', name: 'John Smith', email: 'john@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face', rank: 'Diamond', status: 'online' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face', rank: 'Platinum', status: 'away' },
    ],
    lastMessage: {
      content: 'Hi John! I\'m doing great, thanks for asking. How about you?',
      sender: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 500000),
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    created_at: new Date(Date.now() - 600000),
    updated_at: new Date(Date.now() - 500000),
  },
  {
    id: '2',
    participants: [
      { id: '1', name: 'John Smith', email: 'john@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face', rank: 'Diamond', status: 'online' },
      { id: '3', name: 'Mike Wilson', email: 'mike@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', rank: 'Gold', status: 'busy' },
    ],
    lastMessage: {
      content: 'Mike, can we schedule a call for tomorrow?',
      sender: 'John Smith',
      timestamp: new Date(Date.now() - 300000),
    },
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    created_at: new Date(Date.now() - 300000),
    updated_at: new Date(Date.now() - 300000),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (conversationId) {
      // Get messages for a specific conversation
      const messages = mockDirectMessages.filter(
        msg => (msg.senderId === userId || msg.recipientId === userId) &&
               (msg.senderId === conversationId || msg.recipientId === conversationId)
      );

      // Sort by timestamp (newest first)
      messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply pagination
      const paginatedMessages = messages.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        data: paginatedMessages,
        count: messages.length,
        hasMore: offset + limit < messages.length,
      });
    } else {
      // Get all conversations for the user
      const conversations = mockConversations.filter(conv =>
        conv.participants.some(p => p.id === userId)
      );

      // Sort by last message timestamp (newest first)
      conversations.sort((a, b) => 
        new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
      );

      return NextResponse.json({
        success: true,
        data: conversations,
        count: conversations.length,
      });
    }

  } catch (error) {
    console.error('Error fetching direct messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch direct messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, recipientId, content, type = 'text', attachments = [] } = body;

    if (!senderId || !recipientId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, you would create the direct message in Supabase here
    // const { data, error } = await supabase
    //   .from('mlm_direct_messages')
    //   .insert({
    //     sender_id: senderId,
    //     recipient_id: recipientId,
    //     content,
    //     type,
    //     attachments,
    //   })
    //   .select()
    //   .single();

    const newMessage = {
      id: Date.now().toString(),
      senderId,
      recipientId,
      content,
      timestamp: new Date(),
      type,
      isRead: false,
      readAt: null,
      attachments,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Add to mock data
    mockDirectMessages.push(newMessage);

    // Update conversation
    const conversation = mockConversations.find(conv =>
      conv.participants.some(p => p.id === senderId) &&
      conv.participants.some(p => p.id === recipientId)
    );

    if (conversation) {
      conversation.lastMessage = {
        content,
        sender: 'John Smith', // In production, fetch from user data
        timestamp: new Date(),
      };
      conversation.updated_at = new Date();
    } else {
      // Create new conversation
      const newConversation = {
        id: Date.now().toString(),
        participants: [
          { id: senderId, name: 'John Smith', email: 'john@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face', rank: 'Diamond', status: 'online' },
          { id: recipientId, name: 'Recipient', email: 'recipient@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face', rank: 'Gold', status: 'offline' },
        ],
        lastMessage: {
          content,
          sender: 'John Smith',
          timestamp: new Date(),
        },
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockConversations.push(newConversation);
    }

    return NextResponse.json({
      success: true,
      data: newMessage,
    });

  } catch (error) {
    console.error('Error creating direct message:', error);
    return NextResponse.json(
      { error: 'Failed to create direct message' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, updates } = body;

    if (!messageId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, you would update the direct message in Supabase here
    // const { data, error } = await supabase
    //   .from('mlm_direct_messages')
    //   .update(updates)
    //   .eq('id', messageId)
    //   .select()
    //   .single();

    const messageIndex = mockDirectMessages.findIndex(m => m.id === messageId);
    if (messageIndex > -1) {
      mockDirectMessages[messageIndex] = {
        ...mockDirectMessages[messageIndex],
        ...updates,
        updated_at: new Date(),
      };
    }

    return NextResponse.json({
      success: true,
      data: mockDirectMessages[messageIndex],
    });

  } catch (error) {
    console.error('Error updating direct message:', error);
    return NextResponse.json(
      { error: 'Failed to update direct message' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // In production, you would delete the direct message in Supabase here
    // const { error } = await supabase
    //   .from('mlm_direct_messages')
    //   .delete()
    //   .eq('id', messageId);

    const messageIndex = mockDirectMessages.findIndex(m => m.id === messageId);
    if (messageIndex > -1) {
      mockDirectMessages.splice(messageIndex, 1);
    }

    return NextResponse.json({
      success: true,
      message: 'Direct message deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting direct message:', error);
    return NextResponse.json(
      { error: 'Failed to delete direct message' },
      { status: 500 }
    );
  }
}
