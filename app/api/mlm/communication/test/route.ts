import { NextRequest, NextResponse } from "next/server"
import { MLMCommunicationDatabase } from "@/lib/mlm-communication-database"

export async function GET(request: NextRequest) {
  try {
    console.log("Testing MLM communication database...")
    
    // Test database connection and table creation
    await MLMCommunicationDatabase.initializeTables()
    console.log("Database tables initialized successfully")
    
    // Test creating a channel
    const testChannel = await MLMCommunicationDatabase.createChannel({
      name: "test-channel",
      type: "team",
      description: "Test channel for debugging",
      isPrivate: false,
      createdBy: "test-user-123"
    })
    console.log("Test channel created:", testChannel)
    
    // Test creating a message
    const testMessage = await MLMCommunicationDatabase.createMessage({
      channelId: testChannel.id,
      content: "Test message for debugging",
      type: "text",
      messageType: "text",
      sender: {
        id: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        avatar: "/test-avatar.jpg",
        rank: "Member",
        status: "online"
      }
    })
    console.log("Test message created:", testMessage)
    
    // Test creating a voice message
    const testVoiceMessage = await MLMCommunicationDatabase.createMessage({
      channelId: testChannel.id,
      content: "🎤 Voice message (5s)",
      type: "file",
      messageType: "file",
      sender: {
        id: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        avatar: "/test-avatar.jpg",
        rank: "Member",
        status: "online"
      },
      attachments: [{
        id: "voice-attachment-test",
        name: "voice-message.webm",
        url: "data:audio/webm;base64,test-audio-data",
        type: "audio/webm",
        size: 1024,
        duration: 5
      }]
    })
    console.log("Test voice message created:", testVoiceMessage)
    
    // Test retrieving messages
    const messages = await MLMCommunicationDatabase.getMessages(testChannel.id)
    console.log("Retrieved messages:", messages)
    
    return NextResponse.json({
      success: true,
      message: "Database test completed successfully",
      data: {
        channel: testChannel,
        textMessage: testMessage,
        voiceMessage: testVoiceMessage,
        allMessages: messages
      }
    })
  } catch (error) {
    console.error("Database test failed:", error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const anyError = error as any
    return NextResponse.json({
      success: false,
      error: "Database test failed",
      details: {
        message,
        code: anyError?.code,
        detail: anyError?.detail,
        hint: anyError?.hint,
        stack: anyError?.stack
      }
    }, { status: 500 })
  }
}
