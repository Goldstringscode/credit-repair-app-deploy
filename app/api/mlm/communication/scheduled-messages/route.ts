import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

// GET - Fetch scheduled messages for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const channelId = searchParams.get('channelId')
    const status = searchParams.get('status') // pending, sent, cancelled, failed

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`📅 Fetching scheduled messages for user: ${userId}`)

    // For now, return mock data since we don't have a scheduled_messages table yet
    const mockScheduledMessages = [
      {
        id: 'sched-1',
        channelId: '550e8400-e29b-41d4-a716-446655440001',
        content: 'Good morning team! Let\'s start the day with energy! 💪',
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: 'pending',
        createdAt: new Date().toISOString(),
        messageType: 'text',
        attachments: [],
        recurring: null
      },
      {
        id: 'sched-2',
        channelId: '550e8400-e29b-41d4-a716-446655440002',
        content: 'Weekly team meeting reminder - Tomorrow at 2 PM',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        messageType: 'text',
        attachments: [],
        recurring: {
          type: 'weekly',
          interval: 1,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }
      },
      {
        id: 'sched-3',
        channelId: '550e8400-e29b-41d4-a716-446655440001',
        content: 'Training session completed! Great job everyone! 🎉',
        scheduledFor: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        status: 'sent',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        sentAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        messageType: 'text',
        attachments: [],
        recurring: null
      }
    ]

    // Filter by channel if specified
    let filteredMessages = mockScheduledMessages
    if (channelId) {
      filteredMessages = mockScheduledMessages.filter(msg => msg.channelId === channelId)
    }

    // Filter by status if specified
    if (status) {
      filteredMessages = filteredMessages.filter(msg => msg.status === status)
    }

    console.log(`📅 Found ${filteredMessages.length} scheduled messages`)

    return NextResponse.json({
      success: true,
      data: filteredMessages
    })
  } catch (error) {
    console.error('Error fetching scheduled messages:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new scheduled message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      channelId, 
      userId, 
      content, 
      scheduledFor, 
      messageType = 'text', 
      attachments = [],
      recurring = null
    } = body

    if (!channelId || !userId || !content || !scheduledFor) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`📅 Creating scheduled message for channel: ${channelId}, user: ${userId}`)

    // Validate scheduled time is in the future
    const scheduledTime = new Date(scheduledFor)
    const now = new Date()
    
    if (scheduledTime <= now) {
      return NextResponse.json(
        { success: false, error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    // For now, return mock data since we don't have a scheduled_messages table yet
    const mockScheduledMessage = {
      id: `sched-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      channelId,
      content,
      scheduledFor: scheduledTime.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      messageType,
      attachments,
      recurring
    }

    console.log('✅ Scheduled message created successfully:', mockScheduledMessage)

    return NextResponse.json({
      success: true,
      data: mockScheduledMessage
    })
  } catch (error) {
    console.error('Error creating scheduled message:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update a scheduled message
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, updates } = body

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      )
    }

    console.log(`📅 Updating scheduled message: ${messageId}`)

    // For now, return mock success since we don't have a scheduled_messages table yet
    const mockUpdatedMessage = {
      id: messageId,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    console.log('✅ Scheduled message updated successfully:', mockUpdatedMessage)

    return NextResponse.json({
      success: true,
      data: mockUpdatedMessage
    })
  } catch (error) {
    console.error('Error updating scheduled message:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel a scheduled message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      )
    }

    console.log(`📅 Cancelling scheduled message: ${messageId}`)

    // For now, return mock success since we don't have a scheduled_messages table yet
    console.log('✅ Scheduled message cancelled successfully')

    return NextResponse.json({
      success: true,
      message: 'Scheduled message cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling scheduled message:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
