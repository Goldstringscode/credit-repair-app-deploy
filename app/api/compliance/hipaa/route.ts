import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, requestType, healthData } = body
    
    const supabase = createSupabaseClient()
    
    // Create HIPAA request
    const { data: hipaaRequest, error } = await supabase
      .from('compliance_requests')
      .insert({
        user_id: userId,
        request_type: `hipaa_${requestType}`,
        framework: 'HIPAA',
        status: 'pending',
        priority: getPriorityForHIPAARequest(requestType),
        description: getDescriptionForHIPAARequest(requestType),
        reason: 'Patient rights request under HIPAA',
        requested_data: healthData,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // HIPAA allows 30 days
      })
      .select()
      .single()

    if (error) {
      console.error('HIPAA request creation error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create HIPAA request' },
        { status: 500 }
      )
    }

    // If it's a data access request, also create a health data record
    if (requestType === 'access' && healthData) {
      const { error: healthDataError } = await supabase
        .from('hipaa_health_data')
        .insert({
          user_id: userId,
          data_type: healthData.dataType,
          sensitivity_level: healthData.sensitivity,
          access_level: healthData.accessLevel,
          encrypted: healthData.encrypted,
          last_accessed: new Date().toISOString()
        })

      if (healthDataError) {
        console.error('HIPAA health data creation error:', healthDataError)
      }
    }

    // Log the action
    await supabase
      .from('compliance_audit_log')
      .insert({
        user_id: userId,
        action: `hipaa_${requestType}_requested`,
        framework: 'HIPAA',
        request_id: hipaaRequest.id,
        details: {
          requestType,
          healthData
        }
      })

    // Send notification to admin
    await supabase
      .from('compliance_notifications')
      .insert({
        type: 'compliance_alert',
        title: `New HIPAA ${requestType.replace('_', ' ')} Request`,
        message: `User ${userId} has submitted a ${requestType.replace('_', ' ')} request under HIPAA.`,
        priority: getPriorityForHIPAARequest(requestType)
      })

    return NextResponse.json({
      success: true,
      data: hipaaRequest,
      message: 'HIPAA request submitted successfully'
    })

  } catch (error) {
    console.error('HIPAA API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process HIPAA request' },
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
      .eq('framework', 'HIPAA')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: requests, error } = await query
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('HIPAA requests fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch HIPAA requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: requests
    })

  } catch (error) {
    console.error('HIPAA API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch HIPAA requests' },
      { status: 500 }
    )
  }
}

function getPriorityForHIPAARequest(requestType: string): string {
  const priorityMap: { [key: string]: string } = {
    'access': 'normal',
    'amendment': 'normal',
    'disclosure': 'high',
    'restriction': 'high',
    'accounting': 'normal'
  }
  
  return priorityMap[requestType] || 'normal'
}

function getDescriptionForHIPAARequest(requestType: string): string {
  const descriptionMap: { [key: string]: string } = {
    'access': 'Patient requests access to their health information',
    'amendment': 'Patient requests amendment to their health information',
    'disclosure': 'Patient requests disclosure of health information',
    'restriction': 'Patient requests restriction on use/disclosure of health information',
    'accounting': 'Patient requests accounting of disclosures of health information'
  }
  
  return descriptionMap[requestType] || 'HIPAA patient rights request'
}