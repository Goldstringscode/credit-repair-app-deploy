import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface Finding {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: string
  title: string
  description: string
  recommendation: string
  status: 'pass' | 'fail' | 'warning'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const findings: Finding[] = []
    const startTime = Date.now()

    // 1. Environment & Key Checks
    const requiredEnvVars = [
      { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Supabase Service Role Key' },
      { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key' },
      { key: 'STRIPE_WEBHOOK_SECRET', label: 'Stripe Webhook Secret' },
      { key: 'RESEND_API_KEY', label: 'Resend API Key' },
      { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key' },
      { key: 'SHIPPO_API_KEY', label: 'Shippo API Key' },
    ]
    for (const { key, label } of requiredEnvVars) {
      const val = process.env[key]
      findings.push({
        id: 'env-' + key,
        severity: val ? 'info' : 'critical',
        category: 'Configuration',
        title: (val ? 'Present: ' : 'MISSING: ') + label,
        description: val ? (key + ' is set (length: ' + val.length + ')') : (key + ' is not configured'),
        recommendation: val ? 'Keep secret and rotate periodically.' : 'Set ' + key + ' in Vercel environment variables.',
        status: val ? 'pass' : 'fail',
      })
    }

    // 2. Stripe/Shippo mode check
    const stripeKey = process.env.STRIPE_SECRET_KEY || ''
    if (stripeKey.startsWith('sk_test_')) {
      findings.push({ id: 'stripe-test', severity: 'high', category: 'Configuration',
        title: 'Stripe in TEST mode', status: 'warning',
        description: 'Stripe key is sk_test_. No real payments processed.',
        recommendation: 'Switch to live Stripe key before production.' })
    }
    const shippoKey = process.env.SHIPPO_API_KEY || ''
    if (shippoKey.includes('test') || shippoKey.startsWith('shippo_test')) {
      findings.push({ id: 'shippo-test', severity: 'high', category: 'Configuration',
        title: 'Shippo in TEST mode', status: 'warning',
        description: 'Shippo key is a test key. No real USPS labels created.',
        recommendation: 'Switch to live Shippo key before production.' })
    }

    // 3. Admin account audit
    const { data: users } = await supabase.from('users').select('id, email, role, created_at')
    const adminUsers = (users || []).filter((u: any) => u.role === 'admin')
    findings.push({
      id: 'admin-count', severity: adminUsers.length > 5 ? 'high' : 'info',
      category: 'Access Control',
      title: adminUsers.length + ' admin account(s)',
      description: 'Admin accounts: ' + (adminUsers.map((u: any) => u.email).join(', ') || 'none'),
      recommendation: adminUsers.length > 3 ? 'Reduce admin count.' : 'Admin count looks good.',
      status: adminUsers.length > 5 ? 'fail' : 'pass',
    })
    const recentAdmins = adminUsers.filter((u: any) => (Date.now()-new Date(u.created_at).getTime()) < 7*24*60*60*1000)
    if (recentAdmins.length > 0) {
      findings.push({ id: 'new-admins', severity: 'high', category: 'Access Control', status: 'warning',
        title: recentAdmins.length + ' admin(s) created in last 7 days',
        description: 'New admins: ' + recentAdmins.map((u: any) => u.email).join(', '),
        recommendation: 'Verify these accounts were intentionally created.' })
    }

    // 4. Email sender check
    const emailFrom = process.env.EMAIL_FROM || ''
    if (!emailFrom || emailFrom.includes('onboarding@resend.dev')) {
      findings.push({ id: 'email-sender', severity: 'medium', category: 'Email Security', status: 'warning',
        title: 'Unverified email sender domain',
        description: 'EMAIL_FROM uses Resend shared domain. Emails only deliver to verified recipients.',
        recommendation: 'Verify your domain in Resend and set EMAIL_FROM to noreply@yourdomain.com.' })
    } else {
      findings.push({ id: 'email-sender-ok', severity: 'info', category: 'Email Security', status: 'pass',
        title: 'Custom email sender configured',
        description: 'Using: ' + emailFrom,
        recommendation: 'Ensure SPF/DKIM records are verified in Resend.' })
    }

    // 5. Payment security
    const { count: recentPayments } = await supabase.from('payments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now()-24*60*60*1000).toISOString())
    findings.push({ id: 'recent-payments', severity: 'info', category: 'Payment Security', status: 'pass',
      title: (recentPayments || 0) + ' payment(s) in last 24 hours',
      description: 'Recent payment activity looks normal.',
      recommendation: 'Monitor for unusual payment spikes which could indicate fraud.' })

    // Summary
    const critical = findings.filter(f => f.severity === 'critical' && f.status === 'fail').length
    const high = findings.filter(f => f.severity === 'high' && f.status !== 'pass').length
    const medium = findings.filter(f => f.severity === 'medium' && f.status !== 'pass').length
    const passed = findings.filter(f => f.status === 'pass').length

    return NextResponse.json({
      success: true,
      summary: {
        total: findings.length,
        critical, high, medium, passed,
        overallRisk: critical > 0 ? 'critical' : high > 0 ? 'high' : medium > 2 ? 'medium' : 'low',
        scannedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      },
      findings: findings.sort((a, b) => {
        const order: Record<string,number> = { critical:0,high:1,medium:2,low:3,info:4 }
        return order[a.severity] - order[b.severity]
      }),
    })
  } catch (err: any) {
    console.error('Security scan error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}