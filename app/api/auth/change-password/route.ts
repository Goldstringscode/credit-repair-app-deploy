import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Both passwords required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    // Get current password hash
    const { data: userData } = await db().from('users')
      .select('password_hash').eq('id', user.id).maybeSingle()

    if (!userData?.password_hash) {
      return NextResponse.json({ success: false, error: 'Cannot change password for this account type' }, { status: 400 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userData.password_hash)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12)

    const { error } = await db().from('users')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}