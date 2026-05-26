import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — list user's saved templates
export async function GET(request: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(request)
  if (!isAuthenticated || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await db()
    .from('letter_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    // Table may not exist yet
    if (error.message.includes('does not exist')) {
      return NextResponse.json({ success: true, templates: [] })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, templates: data || [] })
}

// POST — save a new template
export async function POST(request: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(request)
  if (!isAuthenticated || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, content, letterType, bureaus, tier, recipientName, recipientAddress } = body

  if (!name || !content) {
    return NextResponse.json({ error: 'name and content are required' }, { status: 400 })
  }

  const { data, error } = await db()
    .from('letter_templates')
    .insert({
      user_id: user.id,
      name: name.trim(),
      content,
      letter_type: letterType || 'dispute',
      bureaus: bureaus || [],
      tier: tier || 'certified',
      recipient_name: recipientName || '',
      recipient_address: recipientAddress || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, template: data })
}

// DELETE — delete a template
export async function DELETE(request: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(request)
  if (!isAuthenticated || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await db()
    .from('letter_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // ensure user owns it

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
