import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sanitizeError } from '@/lib/api-error'
import { getCached, setCached } from '@/lib/cache'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ── GET — fetch all invoices (payments + manually created) ──────────
export async function GET(request: NextRequest) {
  try {
    const _hit = getCached<object>('admin:invoices')
    if (_hit) return NextResponse.json(_hit)

    const supabase = db()
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const search = searchParams.get('search')?.toLowerCase()

    // 1. Payment-generated invoices
    const [paymentsResult, usersResult] = await Promise.all([
      supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('users').select('id, email, first_name, last_name, subscription_tier'),
    ])
    const userMap = Object.fromEntries(((usersResult.data)||[]).map((u:any)=>[u.id, u]))

    const paymentInvoices = ((paymentsResult.data)||[]).map((p:any) => {
      const user = userMap[p.user_id] || {}
      const customerName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'Unknown'
      const amount = p.amount || 0
      let status = 'draft'
      if (p.status==='succeeded') status='paid'
      else if (p.status==='pending'||p.status==='processing') status='sent'
      else if (p.status==='failed'||p.status==='canceled') status='cancelled'
      else if (p.status==='requires_payment_method') status='overdue'
      const invNum = p.stripe_invoice_id
        ? 'INV-'+p.stripe_invoice_id.replace('in_','').slice(0,8).toUpperCase()
        : p.stripe_payment_intent_id
        ? 'INV-'+p.stripe_payment_intent_id.replace('pi_','').slice(0,8).toUpperCase()
        : 'PAY-'+p.id.slice(0,8).toUpperCase()
      return {
        id: p.id, number: invNum, customerId: p.user_id||'', customerName,
        customerEmail: user.email||'', subscriptionId: p.stripe_payment_intent_id||undefined,
        amount, currency: p.currency||'usd', status,
        description: p.payment_type==='certified_mail'?'Certified Mail Service':(user.subscription_tier||'Subscription')+' Plan',
        createdAt: p.created_at, dueDate: new Date(new Date(p.created_at).getTime()+30*24*60*60*1000).toISOString().split('T')[0],
        paidAt: status==='paid'?p.created_at:undefined, paymentMethod:'Card',
        lineItems:[{id:'line_'+p.id,description:p.payment_type==='certified_mail'?'Certified Mail Service':(user.subscription_tier||'Subscription')+' Plan',quantity:1,unitPrice:amount,total:amount,type:p.payment_type==='certified_mail'?'service':'subscription'}],
        subtotal:Math.round(amount/1.08), tax:amount-Math.round(amount/1.08), total:amount, source:'payment'
      }
    })

    // 2. Manually created invoices
    const { data: manualInvoices } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    const manualMapped = ((manualInvoices)||[]).map((i:any) => ({
      id: i.id, number: i.number, customerId: i.user_id||'', customerName: i.customer_name,
      customerEmail: i.customer_email, amount: i.total, currency: i.currency, status: i.status,
      description: i.description||'Manual Invoice', createdAt: i.created_at,
      dueDate: i.due_date, paidAt: i.paid_at||undefined, sentAt: i.sent_at||undefined,
      paymentMethod: undefined, notes: i.notes||undefined,
      lineItems: i.line_items||[], subtotal: i.subtotal, tax: i.tax, total: i.total, source:'manual'
    }))

    // 3. Merge, sort, filter
    let all = [...manualMapped, ...paymentInvoices]
      .sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())

    if (statusFilter && statusFilter!=='all') all = all.filter(i=>i.status===statusFilter)
    if (search) all = all.filter(i=>
      i.customerName.toLowerCase().includes(search)||
      i.customerEmail.toLowerCase().includes(search)||
      i.number.toLowerCase().includes(search)
    )

    const full = [...manualMapped, ...paymentInvoices]
    const metrics = {
      totalInvoices: full.length,
      draftInvoices: full.filter(i=>i.status==='draft').length,
      sentInvoices: full.filter(i=>i.status==='sent').length,
      paidInvoices: full.filter(i=>i.status==='paid').length,
      overdueInvoices: full.filter(i=>i.status==='overdue').length,
      totalRevenue: full.filter(i=>i.status==='paid').reduce((s,i)=>s+i.total,0),
      pendingRevenue: full.filter(i=>i.status==='sent'||i.status==='overdue').reduce((s,i)=>s+i.total,0),
      averageInvoiceAmount: full.length>0?Math.round(full.reduce((s,i)=>s+i.total,0)/full.length):0,
      paymentRate: full.length>0?Math.round(full.filter(i=>i.status==='paid').length/full.length*100):0,
    }
    return NextResponse.json({ success: true, data: { invoices: all, metrics } })
  } catch (err:any) {
    return NextResponse.json({ success: false, error: sanitizeError(err) }, { status: 500 })
  }
}

// ── POST — create a manual invoice ──────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = db()
    const body = await request.json()
    const { userId, customerName, customerEmail, lineItems, dueDate, notes, currency='usd' } = body

    if (!customerName || !customerEmail) {
      return NextResponse.json({ success: false, error: 'Customer name and email are required' }, { status: 400 })
    }
    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one line item is required' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = lineItems.reduce((s:number, item:any) => s + (item.quantity * item.unitPrice), 0)
    const tax = Math.round(subtotal * 0.08)
    const total = subtotal + tax

    // Generate invoice number: INV-YYYY-NNNN
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true })
    const num = String((count||0)+1).padStart(4,'0')
    const year = new Date().getFullYear()
    const number = 'INV-'+year+'-'+num

    const lineItemsWithIds = lineItems.map((item:any, i:number) => ({
      id: 'line_'+Date.now()+'_'+i,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.quantity) * Number(item.unitPrice),
      type: item.type || 'service',
    }))

    const { data, error } = await supabase.from('invoices').insert({
      number,
      user_id: userId || null,
      customer_name: customerName,
      customer_email: customerEmail,
      status: 'draft',
      currency,
      subtotal,
      tax,
      total,
      description: lineItemsWithIds[0]?.description || 'Invoice',
      notes: notes || null,
      due_date: dueDate || new Date(Date.now()+30*24*60*60*1000).toISOString().split('T')[0],
      line_items: lineItemsWithIds,
    }).select().single()

    if (error) throw error

const _res = { success: true, data: {
      id: data.id, number: data.number, customerName: data.customer_name,
      customerEmail: data.customer_email, status: data.status, total: data.total,
      currency: data.currency, createdAt: data.created_at, dueDate: data.due_date,
    }}
    setCached('admin:invoices', _res, 30)
    return NextResponse.json(_res)
  } catch (err:any) {
    return NextResponse.json({ success: false, error: sanitizeError(err) }, { status: 500 })
  }
}