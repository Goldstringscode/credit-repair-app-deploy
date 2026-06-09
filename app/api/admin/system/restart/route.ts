import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sanitizeError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function checkService(name: string, fn: () => Promise<any>): Promise<{
  name: string, status: 'running'|'error', latencyMs: number, message: string
}> {
  const start = Date.now()
  try {
    await fn()
    return { name, status: 'running', latencyMs: Date.now()-start, message: 'Healthy' }
  } catch (err: any) {
    return { name, status: 'error', latencyMs: Date.now()-start, message: err.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const startTime = Date.now()

    // Re-ping all services to get fresh health status
    const results = await Promise.all([
      checkService('Database (Supabase)', async () => {
        const { error } = await supabase.from('users').select('id').limit(1)
        if (error) throw error
      }),
      checkService('AI Service (Anthropic)', async () => {
        if (!process.env.ANTHROPIC_API_KEY) throw new Error('API key not configured')
        const res = await fetch('https://api.anthropic.com/v1/models', {
          headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      }),
      checkService('Email Service (Resend)', async () => {
        if (!process.env.RESEND_API_KEY) throw new Error('API key not configured')
        const res = await fetch('https://api.resend.com/domains', {
          headers: { 'Authorization': 'Bearer ' + process.env.RESEND_API_KEY }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      }),
      checkService('Payments (Stripe)', async () => {
        if (!process.env.STRIPE_SECRET_KEY) throw new Error('API key not configured')
        const res = await fetch('https://api.stripe.com/v1/balance', {
          headers: { 'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      }),
      checkService('Shipping (Shippo)', async () => {
        if (!process.env.SHIPPO_API_KEY) throw new Error('API key not configured')
        const res = await fetch('https://api.goshippo.com/addresses/?results=1', {
          headers: { 'Authorization': 'ShippoToken ' + process.env.SHIPPO_API_KEY }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      }),
    ])

    const allHealthy = results.every(r => r.status === 'running')
    const errorCount = results.filter(r => r.status === 'error').length
    const avgLatency = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length)

    return NextResponse.json({
      success: true,
      message: allHealthy
        ? `All ${results.length} services verified healthy`
        : `${results.length - errorCount} of ${results.length} services healthy`,
      services: results,
      avgLatencyMs: avgLatency,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      overallStatus: allHealthy ? 'healthy' : errorCount === results.length ? 'critical' : 'warning',
    })
  } catch (err: any) {
    console.error('Restart services error:', err.message)
    return NextResponse.json({ success: false, error: sanitizeError(err) }, { status: 500 })
  }
}
