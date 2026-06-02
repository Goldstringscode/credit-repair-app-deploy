import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Send a single email via Resend API directly
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) { console.error('RESEND_API_KEY not set'); return false }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Credit Repair AI <noreply@creditrepairai.com>',
        to: [to],
        subject,
        html,
      })
    })
    const data = await res.json()
    if (!res.ok) { console.error('Resend error for', to, ':', JSON.stringify(data)); return false }
    console.log('Sent to', to, '- id:', data.id)
    return true
  } catch (err: any) {
    console.error('sendEmail error for', to, ':', err.message)
    return false
  }
}

// Build simple HTML email from plain text content
function buildHtml(subject: string, content: string): string {
  const escaped = content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
<div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:24px;border-radius:8px 8px 0 0;text-align:center">
  <h1 style="color:#fff;margin:0;font-size:22px">Credit Repair AI</h1>
</div>
<div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
  <h2 style="color:#1f2937;margin-top:0">${subject}</h2>
  <div style="color:#4b5563;line-height:1.7">${escaped}</div>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
  <p style="font-size:12px;color:#9ca3af;text-align:center">Credit Repair AI — Helping you achieve financial freedom</p>
</div>
</body></html>`
}

export async function GET(request: NextRequest) {
  try {
    const supabase = db()
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error && error.code !== '42P01') throw error // ignore "table not found" 
    
    const campaigns = data || []
    const metrics = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c: any) => c.status === 'sending').length,
      draftCampaigns: campaigns.filter((c: any) => c.status === 'draft').length,
      scheduledCampaigns: campaigns.filter((c: any) => c.status === 'scheduled').length,
      totalRecipients: campaigns.reduce((s: number, c: any) => s + (c.sent_count || 0), 0),
      totalSent: campaigns.reduce((s: number, c: any) => s + (c.sent_count || 0), 0),
      totalOpened: campaigns.reduce((s: number, c: any) => s + (c.opened_count || 0), 0),
      totalClicked: campaigns.reduce((s: number, c: any) => s + (c.clicked_count || 0), 0),
      openRate: 0, clickRate: 0,
    }
    return NextResponse.json({ success: true, data: { campaigns, metrics } })
  } catch (err: any) {
    console.error('GET campaigns error:', err.message)
    return NextResponse.json({ success: true, data: { campaigns: [] } })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject, content, recipientFilter, recipientFilters, recipientMode, selectedUserIds, externalEmails, scheduledFor, status, estimatedRecipients } = body

    if (!name || !subject || !content) {
      return NextResponse.json({ success: false, error: 'name, subject, and content are required' }, { status: 400 })
    }

    const supabase = db()
    const campaign = {
      name, subject, content,
      recipient_filter: recipientFilter || 'all',
      recipient_filters: recipientFilters || null,
      recipient_mode: recipientMode || 'filter',
      selected_user_ids: selectedUserIds || [],
      external_emails: externalEmails || [],
      scheduled_for: scheduledFor || null,
      status: status || 'draft',
      estimated_recipients: estimatedRecipients || 0,
      sent_count: 0, opened_count: 0, clicked_count: 0,
    }

    const { data, error } = await supabase.from('email_campaigns').insert(campaign).select().single()
    if (error) throw error

    return NextResponse.json({ success: true, data: { campaign: data } })
  } catch (err: any) {
    console.error('POST campaign error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, ...updateData } = body

    if (!id) return NextResponse.json({ success: false, error: 'Campaign ID required' }, { status: 400 })

    const supabase = db()

    // If sending/resending - actually send emails to recipients
    if (status === 'sending' || status === 'sent') {
      // Get the campaign details
      // Try to get campaign from DB, fall back to using body data
      const { data: dbCampaign } = await supabase
        .from('email_campaigns').select('*').eq('id', id).maybeSingle()
      
      // Use DB data if available, otherwise use data from the request body (for mock/legacy campaigns)
      const campaign = dbCampaign || {
        id,
        subject: updateData.subject || updateData.name || 'Campaign',
        content: updateData.content || updateData.body || '',
        recipient_filter: updateData.recipientFilter || 'all',
        recipient_mode: updateData.recipientMode || 'filter',
        selected_user_ids: updateData.selectedUserIds || [],
        external_emails: updateData.externalEmails || [],
        recipient_filters: updateData.recipientFilters || null,
      }
      
      console.log('Campaign source:', dbCampaign ? 'database' : 'request body')

      // Build recipient list based on mode
      const recipientMode = campaign.recipient_mode || 'filter'
      // Derive simple filter from stored recipientFilters object if available
      let filter = campaign.recipient_filter || 'all'
      const storedFilters = campaign.recipient_filters
      if (storedFilters) {
        const statuses = storedFilters.subscriptionStatus || []
        const types = storedFilters.userTypes || []
        if (statuses.includes('active') || types.includes('active')) filter = 'active'
        else if (types.includes('basic') || types.includes('trial')) filter = 'free'
        else if (statuses.includes('cancelled')) filter = 'all'
      }
      let emailList: any[] = []

      if (recipientMode === 'custom' && (campaign.selected_user_ids || []).length > 0) {
        // Fetch only selected users
        const { data: selectedUsers } = await supabase
          .from('users').select('id, email, first_name, last_name')
          .in('id', campaign.selected_user_ids)
        emailList = (selectedUsers || []).filter((u: any) => u.email?.includes('@'))
      } else if (recipientMode !== 'custom') {
        // Fetch users by filter
        let usersQuery = supabase.from('users').select('id, email, first_name, last_name, subscription_status, subscription_tier')
        if (filter === 'active') usersQuery = usersQuery.eq('subscription_status', 'active')
        else if (filter === 'free') usersQuery = usersQuery.or('subscription_tier.is.null,subscription_tier.eq.free')
        else if (filter === 'paid') usersQuery = usersQuery.neq('subscription_tier', 'free').not('subscription_tier', 'is', null)
        const { data: recipients } = await usersQuery
        emailList = (recipients || []).filter((u: any) => u.email?.includes('@'))
      }

      // Add external (non-registered) email addresses
      const externalEmailsList = campaign.external_emails || []
      const externalRecipients = externalEmailsList.map((email: string) => ({
        id: 'external', email, first_name: '', last_name: '',
      }))
      emailList = [...emailList, ...externalRecipients]
      
      console.log('Sending campaign', id, 'to', emailList.length, 'recipients')

      const subject = updateData.subject || campaign.subject
      const content = updateData.content || campaign.content
      const html = buildHtml(subject, content)

      let sentCount = 0
      // Send in batches to avoid rate limits
      for (let i = 0; i < emailList.length; i++) {
        const user = emailList[i]
        const personalizedHtml = html
          .replace(/\{firstName\}/g, user.first_name || 'there')
          .replace(/\{lastName\}/g, user.last_name || '')
          .replace(/\{email\}/g, user.email)
        
        const ok = await sendEmail(user.email, subject, personalizedHtml)
        if (ok) sentCount++
        
        // Small delay between sends to avoid rate limiting
        if (i < emailList.length - 1) await new Promise(r => setTimeout(r, 100))
      }

      // Update campaign status and stats
      const { data: updated, error: updateErr } = await supabase
        .from('email_campaigns')
        .update({ status: 'sent', sent_count: sentCount, sent_at: new Date().toISOString(), ...updateData })
        .eq('id', id).select().single()

      if (updateErr) console.error('Update error:', updateErr)

      return NextResponse.json({
        success: true,
        data: { campaign: updated || { id, status: 'sent', sent_count: sentCount } },
        sentCount,
        recipientCount: emailList.length,
        message: 'Sent to ' + sentCount + ' of ' + emailList.length + ' recipients'
      })
    }

    // Regular update (status change, edit, etc.)
    const { data, error } = await supabase
      .from('email_campaigns')
      .update({ status, ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()

    if (error) throw error
    return NextResponse.json({ success: true, data: { campaign: data } })
  } catch (err: any) {
    console.error('PUT campaign error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    
    const supabase = db()
    const { error } = await supabase.from('email_campaigns').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
