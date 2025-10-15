import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    // Get compliance overview data
    const [
      gdprRequests,
      fcraDisputes,
      ccpaRequests,
      hipaaData,
      pciEvents,
      retentionRecords,
      auditLogs
    ] = await Promise.all([
      // GDPR requests
      supabase
        .from('compliance_requests')
        .select('*')
        .eq('framework', 'GDPR'),
      
      // FCRA disputes
      supabase
        .from('fcra_disputes')
        .select('*'),
      
      // CCPA requests
      supabase
        .from('compliance_requests')
        .select('*')
        .eq('framework', 'CCPA'),
      
      // HIPAA data
      supabase
        .from('hipaa_health_data')
        .select('*'),
      
      // PCI security events
      supabase
        .from('pci_security_events')
        .select('*'),
      
      // Data retention records
      supabase
        .from('data_retention_records')
        .select('*'),
      
      // Audit logs
      supabase
        .from('compliance_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100)
    ])

    // Calculate compliance metrics
    const gdprCompliance = calculateComplianceRate(gdprRequests.data || [])
    const fcraCompliance = calculateComplianceRate(fcraDisputes.data || [])
    const ccpaCompliance = calculateComplianceRate(ccpaRequests.data || [])
    const hipaaCompliance = calculateHIPAACompliance(hipaaData.data || [])
    const pciCompliance = calculatePCICompliance(pciEvents.data || [])
    const retentionCompliance = calculateRetentionCompliance(retentionRecords.data || [])

    const complianceStatus = {
      gdpr: {
        requests: gdprRequests.data?.length || 0,
        completed: gdprRequests.data?.filter(r => r.status === 'completed').length || 0,
        pending: gdprRequests.data?.filter(r => r.status === 'pending').length || 0,
        complianceRate: gdprCompliance
      },
      fcra: {
        disputes: fcraDisputes.data?.length || 0,
        freeReports: 0, // This would come from a separate table
        resolved: fcraDisputes.data?.filter(d => d.status === 'resolved').length || 0,
        complianceRate: fcraCompliance
      },
      ccpa: {
        requests: ccpaRequests.data?.length || 0,
        completed: ccpaRequests.data?.filter(r => r.status === 'completed').length || 0,
        pending: ccpaRequests.data?.filter(r => r.status === 'pending').length || 0,
        complianceRate: ccpaCompliance
      },
      hipaa: {
        requests: hipaaData.data?.length || 0,
        completed: hipaaData.data?.length || 0,
        breaches: 0, // This would be calculated from security events
        complianceRate: hipaaCompliance
      },
      pci: {
        cards: 0, // This would come from payment data
        transactions: 0, // This would come from transaction logs
        vulnerabilities: pciEvents.data?.filter(e => e.event_type === 'vulnerability_found' && e.status === 'open').length || 0,
        complianceRate: pciCompliance
      },
      retention: {
        totalRecords: retentionRecords.data?.length || 0,
        expired: retentionRecords.data?.filter(r => r.expires_at < new Date()).length || 0,
        deleted: retentionRecords.data?.filter(r => r.deleted_at !== null).length || 0,
        exempt: retentionRecords.data?.filter(r => r.exempt_reason !== null).length || 0,
        complianceRate: retentionCompliance
      },
      audit: {
        totalEvents: auditLogs.data?.length || 0,
        criticalEvents: auditLogs.data?.filter(l => l.action.includes('critical')).length || 0,
        highRiskEvents: auditLogs.data?.filter(l => l.action.includes('high_risk')).length || 0,
        complianceRate: 98 // This would be calculated based on audit results
      }
    }

    return NextResponse.json({
      success: true,
      data: complianceStatus,
      recentActivities: auditLogs.data?.slice(0, 10) || []
    })

  } catch (error) {
    console.error('Compliance API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load compliance data' },
      { status: 500 }
    )
  }
}

function calculateComplianceRate(requests: any[]): number {
  if (requests.length === 0) return 100
  
  const completed = requests.filter(r => r.status === 'completed').length
  const total = requests.length
  
  return Math.round((completed / total) * 100)
}

function calculateHIPAACompliance(healthData: any[]): number {
  if (healthData.length === 0) return 100
  
  const encrypted = healthData.filter(d => d.encrypted).length
  const total = healthData.length
  
  return Math.round((encrypted / total) * 100)
}

function calculatePCICompliance(events: any[]): number {
  if (events.length === 0) return 100
  
  const resolved = events.filter(e => e.status === 'resolved').length
  const total = events.length
  
  return Math.round((resolved / total) * 100)
}

function calculateRetentionCompliance(records: any[]): number {
  if (records.length === 0) return 100
  
  const compliant = records.filter(r => {
    const now = new Date()
    const expiresAt = new Date(r.expires_at)
    return r.deleted_at !== null || expiresAt > now
  }).length
  
  const total = records.length
  
  return Math.round((compliant / total) * 100)
}
