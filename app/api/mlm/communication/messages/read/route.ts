import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/jwt'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  const user = verifyToken(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { channel_id } = await req.json().catch(() => ({}))
  if (!channel_id) return NextResponse.json({ error: 'channel_id required' }, { status: 400 })
  await supabase.from('mlm_channel_members').upsert({
    channel_id, user_id: user.userId, last_read_at: new Date().toISOString(),
  }, { onConflict: 'channel_id,user_id' })
  return NextResponse.json({ success: true })
}