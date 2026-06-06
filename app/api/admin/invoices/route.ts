import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = db()
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const search = searchParams.get('search')?.toLowerCase()
    const dateRange = searchParams.get('dateRange')

    // Date range filter
    let since: string | null = null
    if (dateRange === '30d') since = new Date(Date.now() - 30*24*60*60*1000).toISOString()
    else if (dateRange === '90d') since = new Date(Date.now() - 90*24*60*60*1000).toISOString()
    else if (dateRange === '1y') since = new Date(Date.now() - 365*24*60*60*1000).toISOString()

    // Fetch payments joined with user info
    let query = supabase
      .from('payments')
      .select(`
        id, amount, currency, status, created_at, payment_type,
        stripe_payment_intent_id, stripe_invoice_id,
        user_id,
        users!inner(id, email, first_name, last_name, subscription_tier)
      `)
      .order('created_at', { ascending: false })
      .limit(500)

    if (since) query = query.gte('created_at', since)

    const { data: payments, error } = await query

    if (error) {
      console.error('Payments query error:', error.message)
      // Fallback: fetch payments and users separately
      const [{ data: paymentsData }, { data: usersData }] = await Promise.all([
        supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('users').select('id, email, first_name, last_name, subscription_tier'),
      ])
      const userMap = Object.fromEntries((usersData || []).map((u: any) => [u.id, u]))
      const merged = (paymentsData || []).map((p: any) => ({ ...p, users: userMap[p.user_id] || null }))
      return buildResponse(merged, statusFilter, search)
    }

    return buildResponse(payments || [], statusFilter, search)
  } catch (err: any) {
    console.error('Invoices route error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

function buildResponse(payments: any[], statusFilter: string | null, search: string | null | undefined) {
  // Map each payment to an Invoice object
  const invoices = payments.map((p: any) => {
    const user = p.users || {}
    const customerName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'Unknown'
    const amount = p.amount || 0
    const subtotal = Math.round(amount / 1.08)  // approximate pre-tax
    const tax = amount - subtotal
    const createdAt = p.created_at || new Date().toISOString()
    const dueDate = new Date(new Date(createdAt).getTime() + 30*24*60*60*1000).toISOString().split('T')[0]

    // Map Stripe/payment status to invoice status
    let status: string
    if (p.status === 'succeeded') status = 'paid'
    else if (p.status === 'pending' || p.status === 'processing') status = 'sent'
    else if (p.status === 'failed' || p.status === 'canceled') status = 'cancelled'
    else if (p.status === 'requires_payment_method') status = 'overdue'
    else status = 'draft'

    // Invoice number from payment intent or generated
    const invoiceNum = p.stripe_invoice_id
      ? 'INV-' + p.stripe_invoice_id.replace('in_', '').slice(0, 8).toUpperCase()
      : p.stripe_payment_intent_id
      ? 'INV-' + p.stripe_payment_intent_id.replace('pi_', '').slice(0, 8).toUpperCase()
      : 'INV-' + p.id.slice(0, 8).toUpperCase()

    return {
      id: p.id,
      number: invoiceNum,
      customerId: p.user_id || '',
      customerName,
      customerEmail: user.email || '',
      subscriptionId: p.stripe_payment_intent_id || undefined,
      amount,
      currency: p.currency || 'usd',
      status,
      description: p.payment_type === 'certified_mail'
        ? 'Certified Mail Service'
        : (user.subscription_tier || 'Subscription') + ' Plan',
      createdAt,
      dueDate,
      paidAt: status === 'paid' ? createdAt : undefined,
      paymentMethod: 'Card',
      lineItems: [{
        id: 'line_' + p.id,
        description: p.payment_type === 'certified_mail'
          ? 'Certified Mail Service'
          : (user.subscription_tier || 'Subscription') + ' Plan',
        quantity: 1,
        unitPrice: amount,
        total: amount,
        type: p.payment_type === 'certified_mail' ? 'service' : 'subscription',
      }],
      subtotal,
      tax,
      total: amount,
      notes: status === 'overdue' ? 'Payment overdue — please contact support.' : undefined,
      pdfUrl: undefined,
      sentAt: status !== 'draft' ? createdAt : undefined,
    }
  })

  // Apply filters
  let filtered = invoices
  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter(i => i.status === statusFilter)
  }
  if (search) {
    filtered = filtered.filter(i =>
      i.customerName.toLowerCase().includes(search) ||
      i.customerEmail.toLowerCase().includes(search) ||
      i.number.toLowerCase().includes(search) ||
      i.description.toLowerCase().includes(search)
    )
  }

  // Metrics from full unfiltered set
  const totalInvoices = invoices.length
  const draftInvoices = invoices.filter(i => i.status === 'draft').length
  const sentInvoices = invoices.filter(i => i.status === 'sent').length
  const paidInvoices = invoices.filter(i => i.status === 'paid').length
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const pendingRevenue = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0)
  const averageInvoiceAmount = totalInvoices > 0 ? Math.round(invoices.reduce((s, i) => s + i.total, 0) / totalInvoices) : 0
  const paymentRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0

  const metrics = {
    totalInvoices, draftInvoices, sentInvoices, paidInvoices, overdueInvoices,
    totalRevenue, pendingRevenue, averageInvoiceAmount, paymentRate,
  }

  return NextResponse.json({ success: true, data: { invoices: filtered, metrics } })
}
