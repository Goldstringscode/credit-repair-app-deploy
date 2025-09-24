import { NextRequest, NextResponse } from 'next/server';
import { communicationDatabaseService } from '@/lib/database/communication-service';
import { withRateLimit } from '@/lib/rate-limiter';

// POST /api/mlm/communications/reactions - Add a reaction to a message
export async function POST(request: NextRequest) {
  return withRateLimit(async (req) => {
    try {
      const body = await req.json();
      const { messageId, userId, emoji } = body;

      if (!messageId || !userId || !emoji) {
        return NextResponse.json(
          { success: false, error: 'Message ID, User ID, and emoji are required' },
          { status: 400 }
        );
      }

      await communicationDatabaseService.addReaction(messageId, userId, emoji);

      return NextResponse.json({
        success: true,
        message: 'Reaction added successfully'
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add reaction' },
        { status: 500 }
      );
    }
  })(request);
}

// DELETE /api/mlm/communications/reactions - Remove a reaction from a message
export async function DELETE(request: NextRequest) {
  return withRateLimit(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const messageId = searchParams.get('messageId');
      const userId = searchParams.get('userId');
      const emoji = searchParams.get('emoji');

      if (!messageId || !userId || !emoji) {
        return NextResponse.json(
          { success: false, error: 'Message ID, User ID, and emoji are required' },
          { status: 400 }
        );
      }

      await communicationDatabaseService.removeReaction(messageId, userId, emoji);

      return NextResponse.json({
        success: true,
        message: 'Reaction removed successfully'
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove reaction' },
        { status: 500 }
      );
    }
  })(request);
}