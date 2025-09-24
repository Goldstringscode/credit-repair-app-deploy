import { NextRequest, NextResponse } from 'next/server';
import { communicationDatabaseService } from '@/lib/database/communication-service';
import { withRateLimit } from '@/lib/rate-limiter';

// GET /api/mlm/communications/messages/[messageId] - Get a specific message
export async function GET(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  return withRateLimit(async (req) => {
    try {
      const { messageId } = params;

      if (!messageId) {
        return NextResponse.json(
          { success: false, error: 'Message ID is required' },
          { status: 400 }
        );
      }

      const message = await communicationDatabaseService.getMessageById(messageId);

      return NextResponse.json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Error fetching message:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch message' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT /api/mlm/communications/messages/[messageId] - Update a message
export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  return withRateLimit(async (req) => {
    try {
      const { messageId } = params;
      const body = await req.json();
      const { content, isEdited, isDeleted, isPinned, isFlagged, isStarred } = body;

      if (!messageId) {
        return NextResponse.json(
          { success: false, error: 'Message ID is required' },
          { status: 400 }
        );
      }

      const message = await communicationDatabaseService.updateMessage(messageId, {
        content,
        isEdited,
        isDeleted,
        isPinned,
        isFlagged,
        isStarred
      });

      return NextResponse.json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Error updating message:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update message' },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE /api/mlm/communications/messages/[messageId] - Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  return withRateLimit(async (req) => {
    try {
      const { messageId } = params;

      if (!messageId) {
        return NextResponse.json(
          { success: false, error: 'Message ID is required' },
          { status: 400 }
        );
      }

      await communicationDatabaseService.deleteMessage(messageId);

      return NextResponse.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete message' },
        { status: 500 }
      );
    }
  })(request);
}
