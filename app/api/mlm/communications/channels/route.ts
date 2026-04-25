import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Auth check
  const { user, isAuthenticated, error: authError } = await getCurrentUser(req)

  // DEBUG: log auth result to Vercel logs
  console.log('[channels] auth:', { isAuthenticated, userId: user?.id, authError })

  if (!isAuthenticated || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized', debug: { isAuthenticated, authError } }, { status: 401 })
  }

  // Fetch channels - simple query, no joins
  const { data: channels, error } = await supabase
    .from('mlm_channels')
    .select('id, name, description, channel_type, member_count, is_active')
    .eq('is_active', true)
    .order('name')

  console.log('[channels] query result:', { count: channels?.length, error: error?.message })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Return channels with default unread count of 0 - no complex joins
  const result = (channels ?? []).map(ch => ({
    ...ch,
    unread_count: 0,
    last_message: null,
    last_message_at: null,
  }))

  return NextResponse.json({ success: true, data: result })
}