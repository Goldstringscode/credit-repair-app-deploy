import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, requestType, reason, requestedData } = body
    
    const supabase = createSupabaseClient()
    
    // Create GDPR request
    const { data: gdprRequest, error } = await supabase
      .from('compliance_requests')
      .insert({
        user_id: userId,
        request_type: requestType,
        framework: 'GDPR',
        status: 'pending',
        priority: getPriorityForRequestType(requestType),
        description: getDescriptionForRequestType(requestType),
        reason: reason,
        requested_data: requestedData,
        due_date: calculateDueDate(requestType)
      })
      .select()
      .single()

    if (error) {
      console.error('GDPR request creation error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create GDPR request' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase
      .from('compliance_audit_log')
      .insert({
        user_id: userId,
        action: `gdpr_${requestType}_requested`,
        framework: 'GDPR',
        request_id: gdprRequest.id,
        details: {
          requestType,
          reason,
          requestedData
        }
      })

    // Send notification to admin
    await supabase
      .from('compliance_notifications')
      .insert({
        type: 'compliance_alert',
        title: `New GDPR ${requestType.replace('_', ' ')} Request`,
        message: `User ${userId} has submitted a ${requestType.replace('_', ' ')} request under GDPR.`,
        priority: getPriorityForRequestType(requestType)
      })

    return NextResponse.json({
      success: true,
      data: gdprRequest,
      message: 'GDPR request submitted successfully'
    })

  } catch (error) {
    console.error('GDPR API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process GDPR request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    
    const supabase = createSupabaseClient()
    
    let query = supabase
      .from('compliance_requests')
      .select('*')
      .eq('framework', 'GDPR')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: requests, error } = await query
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('GDPR requests fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch GDPR requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: requests
    })

  } catch (error) {
    console.error('GDPR API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GDPR requests' },
      { status: 500 }
    )
  }
}

function getPriorityForRequestType(requestType: string): string {
  const priorityMap: { [key: string]: string } = {
    'data_export': 'normal',
    'data_deletion': 'high',
    'data_rectification': 'normal',
    'data_portability': 'normal',
    'consent_withdrawal': 'high'
  }
  
  return priorityMap[requestType] || 'normal'
}

function getDescriptionForRequestType(requestType: string): string {
  const descriptionMap: { [key: string]: string } = {
    'data_export': 'User requests export of their personal data',
    'data_deletion': 'User requests deletion of their personal data',
    'data_rectification': 'User requests correction of their personal data',
    'data_portability': 'User requests transfer of their personal data',
    'consent_withdrawal': 'User withdraws consent for data processing'
  }
  
  return descriptionMap[requestType] || 'GDPR request'
}

function calculateDueDate(requestType: string): string {
  const now = new Date()
  const daysToAdd = requestType === 'data_deletion' ? 30 : 30 // GDPR requires 30 days for most requests
  
  const dueDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000))
  return dueDate.toISOString()
}