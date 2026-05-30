import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = db()
      .from('users')
      .select('id, email, first_name, last_name, role, created_at, updated_at, is_verified, subscription_tier, subscription_status, phone')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or('email.ilike.%' + search + '%,first_name.ilike.%' + search + '%,last_name.ilike.%' + search + '%')
    }
    if (role) query = query.eq('role', role)
    if (status) query = query.eq('subscription_status', status)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const users = (data || []).map(u => ({
      id: u.id,
      name: ((u.first_name || '') + ' ' + (u.last_name || '')).trim() || u.email?.split('@')[0] || 'User',
      email: u.email,
      role: u.role || 'user',
      status: u.subscription_status || 'inactive',
      joinDate: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '',
      lastLogin: u.updated_at,
      subscription: u.subscription_tier || 'free',
      phone: u.phone || '',
      createdAt: u.created_at,
      isVerified: u.is_verified || false,
    }))

    return NextResponse.json({
      success: true,
      users,
      total: count || users.length,
    })
  } catch (err: any) {
    console.error('Admin users error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
