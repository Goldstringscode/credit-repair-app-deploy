import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminRequest } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const _auth = await verifyAdminRequest(request)
  if ('error' in _auth) return _auth.error

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '200')

    let query = supabase.from('users').select('*').order('created_at', { ascending: false }).limit(limit)

    if (search) {
      query = query.or('email.ilike.%' + search + '%,first_name.ilike.%' + search + '%,last_name.ilike.%' + search + '%')
    }

    const { data, error } = await query

    if (error) {
      console.error('Admin users error:', JSON.stringify(error))
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const users = (data || []).map((u: any) => ({
      id: u.id,
      name: ((u.first_name || '') + ' ' + (u.last_name || '')).trim() || u.email?.split('@')[0] || 'User',
      email: u.email,
      role: u.role || 'user',
      status: u.subscription_status || 'inactive',
      plan: u.subscription_tier || 'free',
      joinDate: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '',
      lastLogin: u.updated_at || u.created_at,
      subscription: u.subscription_tier || 'free',
      phone: u.phone || '',
      createdAt: u.created_at,
      isVerified: u.is_verified || false,
      stripeCustomerId: u.stripe_customer_id || '',
    }))

    console.log('Admin users returned:', users.length)

    return NextResponse.json({ success: true, users, total: users.length })
  } catch (err: any) {
    console.error('Admin users catch error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
