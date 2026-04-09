import { NextRequest, NextResponse } from 'next/server';
import { communicationDatabaseService } from '@/lib/database/communication-service';

// Debug logging function
const debugLog = (message: string, data?: any) => {
  console.log(`[VOICE DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!channelId || !userId) {
      return NextResponse.json({ error: 'Channel ID and User ID are required' }, { status: 400 });
    }

    console.log(`📨 Fetching messages for channel: ${channelId}`);

    const channelMessages = await communicationDatabaseService.getChannelMessages(channelId, userId, limit, offset);
    console.log(`📨 Found ${channelMessages.length} messages for channel ${channelId}`);

    return NextResponse.json({ success: true, data: channelMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, userId, content, messageType, attachments } = body;

    debugLog('POST request received', {
      channelId,
      userId,
      content,
      messageType,
      attachments: attachments?.map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        size: a.size,
        url: a.url ? a.url.substring(0, 50) + '...' : 'no url',
        duration: a.duration,
      })),
    });

    if (!channelId || !userId || !content) {
      return NextResponse.json({ error: 'Channel ID, User ID, and content are required' }, { status: 400 });
    }

    // Process attachments — normalise voice message URLs
    const processedAttachments: any[] = [];
    if (attachments && attachments.length > 0) {
      debugLog('Processing attachments', { count: attachments.length });
      for (let index = 0; index < attachments.length; index++) {
        const attachment = attachments[index];
        debugLog(`Processing attachment ${index}:`, {
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          url: attachment.url?.substring(0, 50) + '...',
          urlType: attachment.url?.startsWith('blob:') ? 'blob' : attachment.url?.startsWith('data:') ? 'data' : 'other',
        });

        let url = attachment.url || '#';
        if (attachment.type === 'audio/webm' && url && !url.startsWith('data:') && !url.startsWith('blob:')) {
          url = `data:${attachment.type};base64,${url}`;
        }

        processedAttachments.push({
          id: attachment.id || `attachment-${Date.now()}-${index}`,
          name: attachment.name || 'Unknown file',
          size: attachment.size || 0,
          type: attachment.type || 'application/octet-stream',
          url,
          duration: attachment.duration || 0,
        });
      }
    }

    const newMessage = await communicationDatabaseService.createMessage({
      channel_id: channelId,
      sender_id: userId,
      content,
      message_type: messageType || 'text',
      attachments: processedAttachments,
    });

    if (!newMessage) {
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    debugLog('Message created successfully', {
      messageId: newMessage.id,
      attachmentCount: processedAttachments.length,
      hasVoiceMessage: processedAttachments.some((a) => a.type === 'audio/webm'),
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

// Handle voice message uploads specifically
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, userId, audioData, duration, blobType, blobSize } = body;

    if (!channelId || !userId || !audioData) {
      return NextResponse.json({ error: 'Channel ID, User ID, and audio data are required' }, { status: 400 });
    }

    console.log(`🎤 Creating voice message for channel: ${channelId}`);
    console.log(`🎤 Audio data length: ${audioData.length}`);
    console.log(`🎤 Duration: ${duration}s`);

    const voiceMessage = await communicationDatabaseService.createMessage({
      channel_id: channelId,
      sender_id: userId,
      content: `🎤 Voice message (${duration || 0}s)`,
      message_type: 'file',
      attachments: [
        {
          id: `voice-attachment-${Date.now()}`,
          name: 'voice-message.webm',
          type: blobType || 'audio/webm',
          size: blobSize || 0,
          url: `data:${blobType || 'audio/webm'};base64,${audioData}`,
          duration: duration || 0,
        },
      ],
    });

    if (!voiceMessage) {
      return NextResponse.json({ error: 'Failed to create voice message' }, { status: 500 });
    }

    console.log('✅ Voice message created:', voiceMessage.id);

    return NextResponse.json({
      success: true,
      message: 'Voice message sent successfully',
      data: voiceMessage,
    });
  } catch (error) {
    console.error('Error creating voice message:', error);
    return NextResponse.json({ error: 'Failed to create voice message' }, { status: 500 });
  }
}
