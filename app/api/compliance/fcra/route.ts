import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, data } = body
    
    const supabase = createSupabaseClient()
    
    if (action === 'dispute') {
      // Create FCRA dispute
      const { data: dispute, error } = await supabase
        .from('fcra_disputes')
        .insert({
          user_id: userId,
          credit_bureau: data.bureau,
          account_name: data.accountName,
          account_number: data.accountNumber,
          dispute_reason: data.description,
          supporting_documents: data.documents,
          status: 'submitted'
        })
        .select()
        .single()

      if (error) {
        console.error('FCRA dispute creation error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to create FCRA dispute' },
          { status: 500 }
        )
      }

      // Log the action
      await supabase
        .from('compliance_audit_log')
        .insert({
          user_id: userId,
          action: 'fcra_dispute_submitted',
          framework: 'FCRA',
          details: {
            bureau: data.bureau,
            accountName: data.accountName,
            reason: data.description
          }
        })

      return NextResponse.json({
        success: true,
        data: dispute,
        message: 'FCRA dispute submitted successfully'
      })

    } else if (action === 'free_report') {
      // Create free report request
      const { data: reportRequest, error } = await supabase
        .from('compliance_requests')
        .insert({
          user_id: userId,
          request_type: 'free_credit_report',
          framework: 'FCRA',
          status: 'pending',
          priority: 'normal',
          description: 'User requests free annual credit report',
          reason: 'Annual free report entitlement under FCRA',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('FCRA report request creation error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to create FCRA report request' },
          { status: 500 }
        )
      }

      // Log the action
      await supabase
        .from('compliance_audit_log')
        .insert({
          user_id: userId,
          action: 'fcra_free_report_requested',
          framework: 'FCRA',
          request_id: reportRequest.id,
          details: {
            bureau: data.bureau
          }
        })

      return NextResponse.json({
        success: true,
        data: reportRequest,
        message: 'Free credit report request submitted successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400 }
    )

  } catch (error) {
    console.error('FCRA API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process FCRA request' },
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
      .from('fcra_disputes')
      .select('*')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: disputes, error } = await query
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('FCRA disputes fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch FCRA disputes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: disputes
    })

  } catch (error) {
    console.error('FCRA API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FCRA disputes' },
      { status: 500 }
    )
  }
}