import { NextRequest, NextResponse } from 'next/server';
import { communicationDatabaseService } from '@/lib/database/communication-service';

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
      // Mark as read while fetching
      await communicationDatabaseService.markConversationRead(conversationId, userId);

      const messages = await communicationDatabaseService.getDirectMessages(conversationId, limit, offset);

      return NextResponse.json({
        success: true,
        data: messages,
        count: messages.length,
        hasMore: messages.length === limit,
      });
    } else {
      const conversations = await communicationDatabaseService.getDirectConversations(userId);

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

    // Get or create the conversation between the two users
    const conversation = await communicationDatabaseService.getOrCreateDirectConversation(senderId, recipientId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      );
    }

    const newMessage = await communicationDatabaseService.createDirectMessage({
      conversation_id: conversation.id,
      sender_id: senderId,
      content,
      message_type: type,
      attachments,
    });

    if (!newMessage) {
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: newMessage, conversation },
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

    const updated = await communicationDatabaseService.updateDirectMessage(messageId, {
      ...updates,
      is_edited: true,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updated,
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

    const success = await communicationDatabaseService.deleteDirectMessage(messageId);

    return NextResponse.json({
      success,
      message: success ? 'Direct message deleted successfully' : 'Failed to delete message',
    });
  } catch (error) {
    console.error('Error deleting direct message:', error);
    return NextResponse.json(
      { error: 'Failed to delete direct message' },
      { status: 500 }
    );
  }
}
