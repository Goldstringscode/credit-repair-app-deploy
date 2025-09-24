import { NextRequest, NextResponse } from 'next/server';
import { communicationDatabaseService } from '@/lib/database/communication-service';
import { withRateLimit } from '@/lib/rate-limiter';

// GET /api/mlm/communications/channels - Get user channels
export async function GET(request: NextRequest) {
  return withRateLimit(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId');

      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID is required' },
          { status: 400 }
        );
      }

      const channels = await communicationDatabaseService.getUserChannels(userId);

      return NextResponse.json({
        success: true,
        data: channels
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch channels' },
        { status: 500 }
      );
    }
  })(request);
}

// POST /api/mlm/communications/channels - Create a new channel
export async function POST(request: NextRequest) {
  return withRateLimit(async (req) => {
    try {
      const body = await req.json();
      const { name, type, description, createdBy, isPrivate, memberIds } = body;

      if (!name || !type || !createdBy) {
        return NextResponse.json(
          { success: false, error: 'Name, type, and createdBy are required' },
          { status: 400 }
        );
      }

      const channel = await communicationDatabaseService.createChannel({
        name,
        type,
        description,
        createdBy,
        isPrivate,
        memberIds
      });

      return NextResponse.json({
        success: true,
        data: channel
      });
    } catch (error) {
      console.error('Error creating channel:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create channel' },
        { status: 500 }
      );
    }
  })(request);
}