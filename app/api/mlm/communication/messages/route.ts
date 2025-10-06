import { NextRequest, NextResponse } from "next/server"
import { getChannelMessages, saveChannelMessage, updateChannelMessages } from "@/lib/message-storage"

// Debug logging function
const debugLog = (message: string, data?: any) => {
  console.log(`[VOICE DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

// Mock users for message creation
const mockUsers = {
  "550e8400-e29b-41d4-a716-446655440000": {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "John Smith",
    email: "john@example.com",
    avatar: "/avatars/john.jpg",
    rank: "Diamond",
    status: "online"
  },
  "mlm-user-456": {
    id: "mlm-user-456",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "/avatars/sarah.jpg",
    rank: "Gold",
    status: "online"
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get("channelId")
    const userId = searchParams.get("userId")

    if (!channelId || !userId) {
      return NextResponse.json({ error: "Channel ID and User ID are required" }, { status: 400 })
    }

    console.log(`📨 Fetching messages for channel: ${channelId}`)

    // Load messages from file storage
    const channelMessages = getChannelMessages(channelId)
    console.log(`📨 Found ${channelMessages.length} messages for channel ${channelId}`)

      return NextResponse.json({
        success: true,
      data: channelMessages
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channelId, userId, content, messageType, attachments } = body

    debugLog("POST request received", {
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
        duration: a.duration
      }))
    })

    if (!channelId || !userId || !content) {
      return NextResponse.json({ error: "Channel ID, User ID, and content are required" }, { status: 400 })
    }

    // Get user info
    const user = mockUsers[userId as keyof typeof mockUsers]
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Process attachments for voice messages
    let processedAttachments = []
    if (attachments && attachments.length > 0) {
        debugLog("Processing attachments", { count: attachments.length });
        processedAttachments = attachments.map((attachment: any, index: number) => {
          debugLog(`Processing attachment ${index}:`, {
            id: attachment.id,
            name: attachment.name,
            type: attachment.type,
            url: attachment.url?.substring(0, 50) + '...',
            urlType: attachment.url?.startsWith('blob:') ? 'blob' : attachment.url?.startsWith('data:') ? 'data' : 'other'
          });
        if (attachment instanceof File) {
          // Handle File objects (shouldn't happen in API, but just in case)
          return {
            id: `attachment-${Date.now()}-${index}`,
            name: attachment.name,
            size: attachment.size,
            type: attachment.type,
            url: URL.createObjectURL(attachment),
            duration: 0
          }
        } else {
          // Handle processed attachment objects
          let url = attachment.url || '#'
          
              // Check if this is a voice message with base64 data
              if (attachment.type === 'audio/webm' && attachment.url && attachment.url.startsWith('data:audio/webm;base64,')) {
                // It's already a proper data URL, use it as-is
                url = attachment.url
                debugLog('Voice message with base64 data detected', { url: url.substring(0, 50) + '...' });
              } else if (attachment.type === 'audio/webm' && attachment.url && attachment.url.startsWith('blob:')) {
                // It's a voice message with blob URL - this shouldn't happen with our new approach
                debugLog('WARNING: Voice message with blob URL detected', { url: attachment.url });
                // Don't try to convert blob URLs to data URLs - this creates malformed URLs
                url = attachment.url
              } else if (attachment.type === 'audio/webm' && attachment.url && !attachment.url.startsWith('data:') && !attachment.url.startsWith('blob:')) {
                // It's a voice message with raw base64 data, create proper data URL
                debugLog('Voice message with raw base64 data detected, creating data URL', { originalUrl: attachment.url.substring(0, 50) + '...' });
                url = `data:${attachment.type};base64,${attachment.url}`
              }
          
              const processedAttachment = {
                id: attachment.id || `attachment-${Date.now()}-${index}`,
                name: attachment.name || 'Unknown file',
                size: attachment.size || 0,
                type: attachment.type || 'application/octet-stream',
                url: url,
                duration: attachment.duration || 0
              };
              
              debugLog(`Final processed attachment ${index}:`, {
                id: processedAttachment.id,
                name: processedAttachment.name,
                type: processedAttachment.type,
                url: processedAttachment.url?.substring(0, 50) + '...',
                urlType: processedAttachment.url?.startsWith('blob:') ? 'blob' : processedAttachment.url?.startsWith('data:') ? 'data' : 'other'
              });
              
              return processedAttachment;
        }
      })
    }

    // Create new message
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      channelId,
      content,
      type: messageType || "text",
      messageType: messageType || "text",
      sender: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        rank: user.rank,
        status: user.status,
        lastSeen: new Date()
      },
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: processedAttachments,
      reactions: [],
      replies: [],
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      isFlagged: false,
      isStarred: false,
      readBy: [userId]
    }

    // Save message to file storage
    saveChannelMessage(channelId, newMessage)

    debugLog("Message created and saved successfully", { 
      messageId: newMessage.id, 
      attachmentCount: processedAttachments.length,
      hasVoiceMessage: processedAttachments.some(a => a.type === 'audio/webm')
    });
    
    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}

// Handle voice message uploads specifically
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { channelId, userId, audioData, duration, blobType, blobSize } = body

    if (!channelId || !userId || !audioData) {
      return NextResponse.json({ error: "Channel ID, User ID, and audio data are required" }, { status: 400 })
    }

    // Get user info
    const user = mockUsers[userId as keyof typeof mockUsers]
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`🎤 Creating voice message for channel: ${channelId}`)
    console.log(`🎤 Audio data length: ${audioData.length}`)
    console.log(`🎤 Duration: ${duration}s`)

    // Create voice message
    const voiceMessage = {
      id: `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        channelId,
      content: `🎤 Voice message (${duration || 0}s)`,
      type: "file",
      messageType: "file",
        sender: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        rank: user.rank,
        status: user.status,
          lastSeen: new Date()
        },
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [{
        id: `voice-attachment-${Date.now()}`,
        name: 'voice-message.webm',
        type: blobType || 'audio/webm',
        size: blobSize || 0,
        url: `data:${blobType || 'audio/webm'};base64,${audioData}`, // Store as proper data URL
        duration: duration || 0
      }],
        reactions: [],
        replies: [],
        isEdited: false,
        isDeleted: false,
        isPinned: false,
        isFlagged: false,
        isStarred: false,
      readBy: [userId]
      }

    // Save voice message to file storage
    saveChannelMessage(channelId, voiceMessage)

    console.log("✅ Voice message created and saved:", voiceMessage)

      return NextResponse.json({
        success: true,
      message: "Voice message sent successfully",
      data: voiceMessage
      })
  } catch (error) {
    console.error("Error creating voice message:", error)
    return NextResponse.json({ error: "Failed to create voice message" }, { status: 500 })
  }
}