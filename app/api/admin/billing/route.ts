import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  const _auth = await verifyAdminRequest(request)
  if ('error' in _auth) return _auth.error

  try {
    const supabase = db()

    const [usersRes, paymentsRes, certMailRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('certified_mail_requests').select('*').order('created_at', { ascending: false }),
    ])

    if (usersRes.error) console.error('billing users error:', JSON.stringify(usersRes.error))
    if (paymentsRes.error) console.error('billing payments error:', JSON.stringify(paymentsRes.error))

    const users = usersRes.data || []
    const payments = paymentsRes.data || []
    const certMail = certMailRes.data || []

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Build subscriptions from users table (subscription info is on the user)
    const subscriptions = users.map((u: any) => ({
      id: u.id,
      userId: u.id,
      userName: ((u.first_name||'')+(u.last_name?' '+u.last_name:'')).trim() || u.email?.split('@')[0] || 'User',
      userEmail: u.email || '',
      plan: u.subscription_tier || 'free',
      status: u.subscription_status || 'inactive',
      stripeCustomerId: u.stripe_customer_id || '',
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }))

    // Plan breakdown
    const planCounts: Record<string,number> = {}
    const planRevenue: Record<string,number> = {}
    users.forEach((u: any) => {
      const plan = u.subscription_tier || 'free'
      planCounts[plan] = (planCounts[plan]||0) + 1
    })
    payments.forEach((p: any) => {
      const plan = p.plan_type || 'unknown'
      planRevenue[plan] = (planRevenue[plan]||0) + (parseFloat(p.amount)||0)
    })

    // Revenue stats
    const totalPaymentRevenue = payments.filter((p:any)=>p.status==='succeeded').reduce((s:number,p:any)=>s+(parseFloat(p.amount)||0),0)
    const totalMailRevenue = certMail.filter((m:any)=>['sent','delivered','completed'].includes(m.status)).reduce((s:number,m:any)=>s+(m.amount_cents||0)/100,0)
    const totalRevenue = totalPaymentRevenue + totalMailRevenue

    const monthlyPayments = payments.filter((p:any)=>p.status==='succeeded'&&new Date(p.created_at)>=thisMonth).reduce((s:number,p:any)=>s+(parseFloat(p.amount)||0),0)
    const monthlyMail = certMail.filter((m:any)=>['sent','delivered','completed'].includes(m.status)&&new Date(m.created_at)>=thisMonth).reduce((s:number,m:any)=>s+(m.amount_cents||0)/100,0)
    const monthlyRevenue = monthlyPayments + monthlyMail

    const lastMonthPayments = payments.filter((p:any)=>{const d=new Date(p.created_at);return p.status==='succeeded'&&d>=lastMonth&&d<thisMonth}).reduce((s:number,p:any)=>s+(parseFloat(p.amount)||0),0)
    const lastMonthMail = certMail.filter((m:any)=>{const d=new Date(m.created_at);return['sent','delivered','completed'].includes(m.status)&&d>=lastMonth&&d<thisMonth}).reduce((s:number,m:any)=>s+(m.amount_cents||0)/100,0)
    const lastMonthRevenue = lastMonthPayments + lastMonthMail

    // Active subscribers
    const activeSubscribers = users.filter((u:any)=>u.subscription_status==='active').length
    const freeUsers = users.filter((u:any)=>!u.subscription_tier||u.subscription_tier==='free').length
    const newThisMonth = users.filter((u:any)=>new Date(u.created_at)>=thisMonth).length

    // All payments combined
    const usersMap: Record<string,any> = {}
    users.forEach((u:any)=>{ usersMap[u.id]=u })
    const getName = (uid:string) => {
      const u = usersMap[uid]
      return u ? ((u.first_name||'')+(u.last_name?' '+u.last_name:'')).trim()||u.email?.split('@')[0]||'User' : 'Unknown'
    }

    const allPayments = [
      ...payments.map((p:any)=>({
        id:p.id, type:'subscription', userId:p.user_id,
        userName:getName(p.user_id), userEmail:usersMap[p.user_id]?.email||'',
        description:'Plan: '+(p.plan_type||'subscription'), amount:parseFloat(p.amount)||0,
        status:p.status||'succeeded', createdAt:p.created_at,
      })),
      ...certMail.map((m:any)=>({
        id:m.id, type:'certified_mail', userId:m.user_id,
        userName:getName(m.user_id), userEmail:usersMap[m.user_id]?.email||'',
        description:(m.dispute_type||'dispute').replace(/_/g,' ')+' letter'+(m.bureau_name?' → '+m.bureau_name:''),
        amount:(m.amount_cents||0)/100, status:m.status||'unknown', createdAt:m.created_at,
      })),
    ].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue, monthlyRevenue, lastMonthRevenue,
        subscriptionRevenue: totalPaymentRevenue,
        certMailRevenue: totalMailRevenue,
        totalUsers: users.length,
        activeSubscribers, freeUsers, newThisMonth,
        planCounts, planRevenue,
      },
      subscriptions,
      payments: allPayments,
    })
  } catch (err: any) {
    console.error('Admin billing error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
