import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: mlmUser } = await supabase.from('mlm_users')
    .select('mlm_code, rank').eq('user_id', user.id).maybeSingle()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://credit-repair-app-deploy.vercel.app'
  const inviteLink = mlmUser?.mlm_code ? baseUrl + '/signup?ref=' + mlmUser.mlm_code : null

  return NextResponse.json({ success: true, inviteLink, mlmCode: mlmUser?.mlm_code, rank: mlmUser?.rank })
}

export async function POST(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, name } = await req.json().catch(() => ({}))

  const { data: mlmUser } = await supabase.from('mlm_users')
    .select('mlm_code').eq('user_id', user.id).maybeSingle()

  if (!mlmUser?.mlm_code) return NextResponse.json({ error: 'No MLM account found' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://credit-repair-app-deploy.vercel.app'
  const inviteLink = baseUrl + '/signup?ref=' + mlmUser.mlm_code

  // In production, send email here via your email provider
  // For now, return the link so the UI can display/copy it
  console.log('[MLM Invite] Invite for', email, name, '-> link:', inviteLink)

  return NextResponse.json({
    success: true,
    inviteLink,
    mlmCode: mlmUser.mlm_code,
    message: 'Invite link generated. Share this link with ' + (name || email) + ': ' + inviteLink
  })
}