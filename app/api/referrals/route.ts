import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's referral code from users table
    const { data: userData } = await db().from('users')
      .select('id, email, first_name, last_name, subscription_tier')
      .eq('id', user.id).maybeSingle()

    // Get referrals - users who signed up with this user's referral code
    // Check referrals table first, fall back to affiliate/users table
    const { data: referrals } = await db().from('users')
      .select('id, email, first_name, last_name, subscription_tier, subscription_status, created_at')
      .eq('referred_by', user.id)
      .order('created_at', { ascending: false })

    // Get referral earnings from commissions
    const { data: earnings } = await db().from('mlm_commissions')
      .select('commission_amount, status, created_at')
      .eq('recipient_user_id', user.id)
      .in('commission_type', ['direct_referral', 'fast_start'])

    const totalEarnings = (earnings||[]).filter((e:any) => e.status === 'paid')
      .reduce((s:number, e:any) => s + Number(e.commission_amount), 0)
    const pendingEarnings = (earnings||[]).filter((e:any) => e.status !== 'paid')
      .reduce((s:number, e:any) => s + Number(e.commission_amount), 0)

    const referralList = (referrals||[]).map((r:any) => ({
      id: r.id,
      name: [r.first_name, r.last_name].filter(Boolean).join(' ') || r.email,
      email: r.email,
      status: r.subscription_status === 'active' ? 'Active' : 'Pending',
      signupDate: r.created_at?.substring(0, 10),
      plan: r.subscription_tier || 'free',
      reward: 40, // per referral reward
    }))

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creditrepairai.com'
    const referralCode = 'CR' + user.id.substring(0, 6).toUpperCase()
    const referralLink = appUrl + '/signup?ref=' + referralCode

    return NextResponse.json({
      success: true,
      referralCode,
      referralLink,
      stats: {
        totalReferrals: referralList.length,
        successfulReferrals: referralList.filter((r:any) => r.status === 'Active').length,
        pendingReferrals: referralList.filter((r:any) => r.status === 'Pending').length,
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        pendingEarnings: parseFloat(pendingEarnings.toFixed(2)),
        nextReward: 500,
      },
      referralHistory: referralList,
    })
  } catch (error) {
    console.error('Referrals API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch referrals' }, { status: 500 })
  }
}