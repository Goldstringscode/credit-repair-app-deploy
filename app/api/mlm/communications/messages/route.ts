import { NextRequest, NextResponse } from 'next/server';
import { communicationDatabaseService } from '@/lib/database/communication-service';
import { withRateLimit } from '@/lib/rate-limiter';

// GET /api/mlm/communications/messages - Get messages for a channel
export async function GET(request: NextRequest) {
  return withRateLimit(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const channelId = searchParams.get('channelId');
      const userId = searchParams.get('userId');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      if (!channelId || !userId) {
        return NextResponse.json(
          { success: false, error: 'Channel ID and User ID are required' },
          { status: 400 }
        );
      }

      const messages = await communicationDatabaseService.getChannelMessages(
        channelId,
        userId,
        limit,
        offset
      );

      return NextResponse.json({
        success: true,
        data: messages,
        pagination: {
          limit,
          offset,
          hasMore: messages.length === limit
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }
  })(request);
}

// POST /api/mlm/communications/messages - Create a new message
export async function POST(request: NextRequest) {
  return withRateLimit(async (req) => {
    try {
      const body = await req.json();
      const { channelId, senderId, content, messageType, parentMessageId, attachments } = body;

      if (!channelId || !senderId || !content) {
        return NextResponse.json(
          { success: false, error: 'Channel ID, Sender ID, and content are required' },
          { status: 400 }
        );
      }

      const message = await communicationDatabaseService.createMessage({
        channelId,
        senderId,
        content,
        messageType: messageType || 'text',
        parentMessageId,
        attachments
      });

      return NextResponse.json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Error creating message:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create message' },
        { status: 500 }
      );
    }
  })(request);
}