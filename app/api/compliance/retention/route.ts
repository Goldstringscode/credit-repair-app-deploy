import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const dataType = searchParams.get('dataType')
    
    const supabase = createSupabaseClient()
    
    let query = supabase
      .from('data_retention_records')
      .select(`
        *,
        data_retention_policies (
          name,
          description,
          retention_period_days,
          auto_delete
        )
      `)
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (dataType) {
      query = query.eq('data_type', dataType)
    }
    
    const { data: records, error } = await query
      .order('expires_at', { ascending: true })

    if (error) {
      console.error('Data retention records fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch data retention records' },
        { status: 500 }
      )
    }

    // Get retention policies
    const { data: policies, error: policiesError } = await supabase
      .from('data_retention_policies')
      .select('*')
      .eq('is_active', true)

    if (policiesError) {
      console.error('Data retention policies fetch error:', policiesError)
    }

    return NextResponse.json({
      success: true,
      data: {
        records,
        policies: policies || []
      }
    })

  } catch (error) {
    console.error('Data retention API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data retention data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, recordIds, policyId, exemptReason } = body
    
    const supabase = createSupabaseClient()
    
    if (action === 'process_expired') {
      // Process expired records for deletion
      const { data: expiredRecords, error: fetchError } = await supabase
        .from('data_retention_records')
        .select('*')
        .lt('expires_at', new Date().toISOString())
        .is('deleted_at', null)
        .is('exempt_reason', null)

      if (fetchError) {
        console.error('Expired records fetch error:', fetchError)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch expired records' },
          { status: 500 }
        )
      }

      // Mark records as deleted
      const { data: updatedRecords, error: updateError } = await supabase
        .from('data_retention_records')
        .update({
          deleted_at: new Date().toISOString()
        })
        .in('id', expiredRecords.map(r => r.id))
        .select()

      if (updateError) {
        console.error('Records deletion error:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to delete expired records' },
          { status: 500 }
        )
      }

      // Log the action
      await supabase
        .from('compliance_audit_log')
        .insert({
          action: 'data_retention_cleanup',
          framework: 'RETENTION',
          details: {
            action: 'process_expired',
            recordsProcessed: updatedRecords.length,
            recordIds: updatedRecords.map(r => r.id)
          }
        })

      return NextResponse.json({
        success: true,
        data: updatedRecords,
        message: `Successfully processed ${updatedRecords.length} expired records`
      })

    } else if (action === 'exempt_records') {
      // Exempt records from deletion
      const { data: exemptedRecords, error: exemptError } = await supabase
        .from('data_retention_records')
        .update({
          exempt_reason: exemptReason
        })
        .in('id', recordIds)
        .select()

      if (exemptError) {
        console.error('Records exemption error:', exemptError)
        return NextResponse.json(
          { success: false, error: 'Failed to exempt records' },
          { status: 500 }
        )
      }

      // Log the action
      await supabase
        .from('compliance_audit_log')
        .insert({
          action: 'data_retention_exemption',
          framework: 'RETENTION',
          details: {
            action: 'exempt_records',
            recordIds,
            exemptReason
          }
        })

      return NextResponse.json({
        success: true,
        data: exemptedRecords,
        message: `Successfully exempted ${exemptedRecords.length} records`
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Data retention API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process data retention action' },
      { status: 500 }
    )
  }
}