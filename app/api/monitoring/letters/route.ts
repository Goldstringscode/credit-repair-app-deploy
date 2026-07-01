import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const [mailResult, lettersResult] = await Promise.all([
      db()
        .from('certified_mail_requests')
        .select('*')
        .eq('user_id', user.userId)
        .order('created_at', { ascending: false }),
      db()
        .from('letters')
        .select('*')
        .eq('user_id', user.userId)
        .order('generated_at', { ascending: false })
    ])

    return NextResponse.json({
      success: true,
      data: {
        certifiedMail: mailResult.data ?? [],
        letters: lettersResult.data ?? []
      }
    })
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
