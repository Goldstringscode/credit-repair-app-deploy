import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sanitizeError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function verifyResendWebhook(request: NextRequest): Promise<{ valid: boolean; body: string }> {
  const body = await request.text()
  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')
  const secret = process.env.RESEND_WEBHOOK_SECRET

  if (!secret) {
    console.warn('[Resend Webhook] RESEND_WEBHOOK_SECRET not configured - skipping verification')
    return { valid: true, body }
  }
  if (!svixId || !svixTimestamp || !svixSignature) {
    return { valid: false, body }
  }
  try {
    const msgToSign = svixId + '.' + svixTimestamp + '.' + body
    const keyBytes = Uint8Array.from(atob(secret.replace('whsec_', '')), c => c.charCodeAt(0))
    const msgBytes = new TextEncoder().encode(msgToSign)
    const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const sigBytes = await crypto.subtle.sign('HMAC', cryptoKey, msgBytes)
    const computed = 'v1,' + btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    const valid = svixSignature.split(' ').some(s => s === computed)
    return { valid, body }
  } catch (err) {
    console.error('[Resend Webhook] Signature error:', err)
    return { valid: false, body }
  }
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { valid, body } = await verifyResendWebhook(request)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const { type, data } = event

    const TRACKED = ['email.sent','email.delivered','email.opened','email.clicked','email.bounced','email.complained','email.delivery_delayed']
    if (!TRACKED.includes(type)) {
      return NextResponse.json({ received: true })
    }

    const supabase = db()

    const campaignId = (data?.tags || []).find((t: any) => t.name === 'campaign_id')?.value || null

    await supabase.from('email_events').insert({
      resend_email_id: data?.email_id || data?.id || null,
      event_type: type,
      to_email: Array.isArray(data?.to) ? data.to[0] : (data?.to || null),
      from_email: data?.from || null,
      subject: data?.subject || null,
      click_url: data?.click?.link || null,
      user_agent: data?.click?.userAgent || data?.open?.userAgent || null,
      ip_address: data?.click?.ipAddress || data?.open?.ipAddress || null,
      campaign_id: campaignId,
      occurred_at: data?.created_at || new Date().toISOString(),
      raw_payload: event,
    })

    // Update campaign aggregate stats
    if (campaignId && ['email.opened','email.clicked','email.delivered','email.bounced'].includes(type)) {
      const field = type === 'email.opened' ? 'opened_count'
        : type === 'email.clicked' ? 'clicked_count'
        : type === 'email.bounced' ? 'bounced_count'
        : 'delivered_count'
      await supabase.from('email_campaigns')
        .update({ [field]: supabase.rpc })  // use raw increment below
      // Increment via raw SQL to avoid race conditions
      await supabase.rpc('increment_campaign_stat', {
        p_campaign_id: campaignId,
        p_field: field,
      }).maybeSingle()
    }

    console.log('[Resend Webhook]', type, '->', data?.to)
    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('[Resend Webhook] Error:', sanitizeError(err, 'resend-webhook'))
    return NextResponse.json({ received: true })
  }
}
