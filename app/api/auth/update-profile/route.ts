import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { first_name, last_name, phone, bio, company, website, timezone } = body

    const updates: Record<string, any> = {}
    if (first_name !== undefined) updates.first_name = first_name.trim()
    if (last_name !== undefined) updates.last_name = last_name.trim()
    if (phone !== undefined) updates.phone = phone.trim()
    if (bio !== undefined) updates.bio = bio.trim()
    if (company !== undefined) updates.company = company.trim()
    if (website !== undefined) updates.website = website.trim()
    if (timezone !== undefined) updates.timezone = timezone
    updates.updated_at = new Date().toISOString()

    const { error } = await db().from('users')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      console.error('Update profile error:', error)
      return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}