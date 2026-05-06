import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function DELETE(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { confirmation } = await request.json()
    if (confirmation !== 'DELETE') {
      return NextResponse.json({ success: false, error: 'Invalid confirmation' }, { status: 400 })
    }

    const { data: userData } = await db().from('users').select('role').eq('id', user.id).maybeSingle()
    if (userData?.role === 'admin') {
      return NextResponse.json({ success: false, error: 'Admin accounts cannot be deleted' }, { status: 403 })
    }

    // Soft delete
    const { error } = await db().from('users').update({
      email: 'deleted_' + user.id + '@deleted.com',
      first_name: 'Deleted',
      last_name: 'User',
      subscription_status: 'inactive',
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    if (error) return NextResponse.json({ success: false, error: 'Failed to delete account' }, { status: 500 })

    const response = NextResponse.json({ success: true })
    response.cookies.delete('auth-token')
    response.cookies.delete('session')
    return response
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}