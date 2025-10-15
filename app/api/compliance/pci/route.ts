import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventType, severity, description, affectedSystems, remediationActions } = body
    
    const supabase = createSupabaseClient()
    
    // Create PCI security event
    const { data: securityEvent, error } = await supabase
      .from('pci_security_events')
      .insert({
        event_type: eventType,
        severity: severity,
        description: description,
        affected_systems: affectedSystems,
        remediation_actions: remediationActions,
        status: 'open'
      })
      .select()
      .single()

    if (error) {
      console.error('PCI security event creation error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create PCI security event' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase
      .from('compliance_audit_log')
      .insert({
        action: `pci_${eventType}_detected`,
        framework: 'PCI',
        details: {
          eventType,
          severity,
          description,
          affectedSystems
        }
      })

    // Send notification for critical/high severity events
    if (severity === 'critical' || severity === 'high') {
      await supabase
        .from('compliance_notifications')
        .insert({
          type: 'compliance_alert',
          title: `PCI Security Alert: ${eventType}`,
          message: `A ${severity} severity PCI security event has been detected: ${description}`,
          priority: severity
        })
    }

    return NextResponse.json({
      success: true,
      data: securityEvent,
      message: 'PCI security event recorded successfully'
    })

  } catch (error) {
    console.error('PCI API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process PCI security event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')
    
    const supabase = createSupabaseClient()
    
    let query = supabase
      .from('pci_security_events')
      .select('*')
    
    if (severity) {
      query = query.eq('severity', severity)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data: events, error } = await query
      .order('detected_at', { ascending: false })

    if (error) {
      console.error('PCI security events fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch PCI security events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: events
    })

  } catch (error) {
    console.error('PCI API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch PCI security events' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, status, remediationActions, resolvedBy } = body
    
    const supabase = createSupabaseClient()
    
    // Update PCI security event
    const { data: updatedEvent, error } = await supabase
      .from('pci_security_events')
      .update({
        status: status,
        remediation_actions: remediationActions,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('PCI security event update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update PCI security event' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase
      .from('compliance_audit_log')
      .insert({
        admin_id: resolvedBy,
        action: `pci_security_event_${status}`,
        framework: 'PCI',
        details: {
          eventId,
          status,
          remediationActions
        }
      })

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'PCI security event updated successfully'
    })

  } catch (error) {
    console.error('PCI API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update PCI security event' },
      { status: 500 }
    )
  }
}