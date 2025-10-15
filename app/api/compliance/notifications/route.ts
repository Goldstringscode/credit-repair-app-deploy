import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const adminId = searchParams.get('adminId')
    const isRead = searchParams.get('isRead')
    const type = searchParams.get('type')
    
    const supabase = createSupabaseClient()
    
    let query = supabase
      .from('compliance_notifications')
      .select('*')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (adminId) {
      query = query.eq('admin_id', adminId)
    }
    
    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true')
    }
    
    if (type) {
      query = query.eq('type', type)
    }
    
    const { data: notifications, error } = await query
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('Compliance notifications fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch compliance notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notifications
    })

  } catch (error) {
    console.error('Compliance notifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compliance notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, adminId, type, title, message, priority } = body
    
    const supabase = createSupabaseClient()
    
    // Create compliance notification
    const { data: notification, error } = await supabase
      .from('compliance_notifications')
      .insert({
        user_id: userId,
        admin_id: adminId,
        type: type,
        title: title,
        message: message,
        priority: priority || 'normal'
      })
      .select()
      .single()

    if (error) {
      console.error('Compliance notification creation error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create compliance notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Compliance notification created successfully'
    })

  } catch (error) {
    console.error('Compliance notifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create compliance notification' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, isRead, readBy } = body
    
    const supabase = createSupabaseClient()
    
    // Update notification read status
    const { data: updatedNotification, error } = await supabase
      .from('compliance_notifications')
      .update({
        is_read: isRead,
        read_at: isRead ? new Date().toISOString() : null
      })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) {
      console.error('Compliance notification update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update compliance notification' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase
      .from('compliance_audit_log')
      .insert({
        admin_id: readBy,
        action: 'compliance_notification_read',
        framework: 'COMPLIANCE',
        details: {
          notificationId,
          isRead
        }
      })

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: 'Compliance notification updated successfully'
    })

  } catch (error) {
    console.error('Compliance notifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update compliance notification' },
      { status: 500 }
    )
  }
}
