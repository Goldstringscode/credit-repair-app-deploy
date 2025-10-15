import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, requestType, businessPurpose, thirdParties } = body
    
    const supabase = createSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      )
    }
    
    // Create CCPA consumer request
    const { data: ccpaRequest, error } = await supabase
      .from('ccpa_consumer_requests')
      .insert({
        user_id: userId,
        request_type: requestType,
        verification_status: 'pending',
        business_purpose: businessPurpose,
        third_parties: thirdParties,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('CCPA request creation error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create CCPA request', details: error.message },
        { status: 500 }
      )
    }

    // Also create a compliance request for tracking
    const { data: complianceRequest, error: complianceError } = await supabase
      .from('compliance_requests')
      .insert({
        user_id: userId,
        request_type: `ccpa_${requestType}`,
        framework: 'CCPA',
        status: 'pending',
        priority: getPriorityForCCPARequest(requestType),
        description: getDescriptionForCCPARequest(requestType),
        reason: 'Consumer rights request under CCPA',
        due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString() // CCPA allows 45 days
      })
      .select()
      .single()

    if (complianceError) {
      console.error('CCPA compliance request creation error:', complianceError)
    }

    // Log the action
    await supabase
      .from('compliance_audit_log')
      .insert({
        user_id: userId,
        action: `ccpa_${requestType}_requested`,
        framework: 'CCPA',
        request_id: ccpaRequest.id,
        details: {
          requestType,
          businessPurpose,
          thirdParties
        }
      })

    // Send notification to admin
    await supabase
      .from('compliance_notifications')
      .insert({
        type: 'compliance_alert',
        title: `New CCPA ${requestType.replace('_', ' ')} Request`,
        message: `User ${userId} has submitted a ${requestType.replace('_', ' ')} request under CCPA.`,
        priority: getPriorityForCCPARequest(requestType)
      })

    return NextResponse.json({
      success: true,
      data: ccpaRequest,
      message: 'CCPA request submitted successfully'
    })

  } catch (error) {
    console.error('CCPA API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process CCPA request', details: error.message },
      { status: 500 }
    )
  }
}

function getPriorityForCCPARequest(requestType: string): string {
  const priorityMap: { [key: string]: string } = {
    'know': 'normal',
    'delete': 'high',
    'opt_out': 'high',
    'non_discrimination': 'normal',
    'data_portability': 'normal'
  }
  
  return priorityMap[requestType] || 'normal'
}

function getDescriptionForCCPARequest(requestType: string): string {
  const descriptionMap: { [key: string]: string } = {
    'know': 'Consumer requests to know what personal information is collected',
    'delete': 'Consumer requests deletion of personal information',
    'opt_out': 'Consumer opts out of sale of personal information',
    'non_discrimination': 'Consumer requests non-discrimination protection',
    'data_portability': 'Consumer requests data portability'
  }
  
  return descriptionMap[requestType] || 'CCPA consumer request'
}
