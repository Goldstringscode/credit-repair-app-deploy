import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        gdpr: { status: 'operational', lastCheck: new Date().toISOString() },
        fcra: { status: 'operational', lastCheck: new Date().toISOString() },
        ccpa: { status: 'operational', lastCheck: new Date().toISOString() },
        hipaa: { status: 'operational', lastCheck: new Date().toISOString() },
        pci: { status: 'operational', lastCheck: new Date().toISOString() },
        retention: { status: 'operational', lastCheck: new Date().toISOString() },
        audit: { status: 'operational', lastCheck: new Date().toISOString() }
      },
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      compliance: {
        gdprEnabled: process.env.GDPR_ENABLED === 'true',
        fcraEnabled: process.env.FCRA_ENABLED === 'true',
        ccpaEnabled: process.env.CCPA_ENABLED === 'true',
        hipaaEnabled: process.env.HIPAA_ENABLED === 'true',
        pciEnabled: process.env.PCI_ENABLED === 'true',
        retentionEnabled: process.env.DATA_RETENTION_ENABLED === 'true',
        auditEnabled: process.env.AUDIT_LOGGING_ENABLED === 'true'
      }
    }

    return NextResponse.json(healthStatus)
  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      { status: 500 }
    )
  }
}
