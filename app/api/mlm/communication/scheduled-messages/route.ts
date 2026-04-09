import { NextRequest, NextResponse } from 'next/server';
import { communicationDatabaseService } from '@/lib/database/communication-service';

// GET - Fetch scheduled messages for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const channelId = searchParams.get('channelId') ?? undefined;
    const status = searchParams.get('status') ?? undefined;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`📅 Fetching scheduled messages for user: ${userId}`);

    const messages = await communicationDatabaseService.getScheduledMessages(userId, channelId, status);

    console.log(`📅 Found ${messages.length} scheduled messages`);

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching scheduled messages:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new scheduled message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      channelId,
      userId,
      content,
      scheduledFor,
      messageType = 'text',
      attachments = [],
      recurring = null,
    } = body;

    if (!channelId || !userId || !content || !scheduledFor) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate scheduled time is in the future
    const scheduledTime = new Date(scheduledFor);
    const now = new Date();

    if (scheduledTime <= now) {
      return NextResponse.json(
        { success: false, error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    console.log(`📅 Creating scheduled message for channel: ${channelId}, user: ${userId}`);

    const scheduled = await communicationDatabaseService.createScheduledMessage({
      channel_id: channelId,
      user_id: userId,
      content,
      scheduled_for: scheduledTime.toISOString(),
      message_type: messageType,
      attachments,
      recurring,
    });

    if (!scheduled) {
      return NextResponse.json(
        { success: false, error: 'Failed to create scheduled message' },
        { status: 500 }
      );
    }

    console.log('✅ Scheduled message created successfully:', scheduled.id);

    return NextResponse.json({ success: true, data: scheduled });
  } catch (error) {
    console.error('Error creating scheduled message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a scheduled message
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, updates } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    console.log(`📅 Updating scheduled message: ${messageId}`);

    const updated = await communicationDatabaseService.updateScheduledMessage(messageId, updates);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update scheduled message' },
        { status: 500 }
      );
    }

    console.log('✅ Scheduled message updated successfully:', updated.id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating scheduled message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a scheduled message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    console.log(`📅 Cancelling scheduled message: ${messageId}`);

    const success = await communicationDatabaseService.cancelScheduledMessage(messageId);

    console.log(success ? '✅ Scheduled message cancelled successfully' : '⚠️ Could not cancel (not found or already sent)');

    return NextResponse.json({
      success,
      message: success ? 'Scheduled message cancelled successfully' : 'Message not found or already processed',
    });
  } catch (error) {
    console.error('Error cancelling scheduled message:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
