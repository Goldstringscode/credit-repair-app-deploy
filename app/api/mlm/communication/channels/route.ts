import { NextRequest, NextResponse } from 'next/server';
import { communicationDatabaseService } from '@/lib/database/communication-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log(`📋 Fetching channels for user: ${userId}`);

    const channels = await communicationDatabaseService.getUserChannels(userId);

    return NextResponse.json({ success: true, data: channels });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, isPrivate, userId, scope } = body;

    if (!name || !type || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const channel = await communicationDatabaseService.createChannel({
      name,
      type,
      description: description || '',
      scope: scope || 'general',
      created_by: userId,
      is_private: isPrivate || false,
    });

    if (!channel) {
      return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Channel created successfully',
      data: channel,
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}
