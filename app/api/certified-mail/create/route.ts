import { NextRequest, NextResponse } from 'next/server'
import { certifiedMailService } from '@/lib/certified-mail-service-shipengine'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { user, isAuthenticated } = await getCurrentUser(request)
    if (!isAuthenticated || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { letter, recipient, sender, serviceTier = 'certified', bureaus = [] } = body

    if (!letter?.content || !recipient || !sender) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: letter, recipient, sender' },
        { status: 400 }
      )
    }

    const result = await certifiedMailService.createMailRequest({
      userId: user.id,
      recipient,
      sender,
      letter: {
        content: letter.content,
        disputeType: letter.disputeType || 'dispute',
        bureauName: letter.bureauName || recipient.name,
      },
      serviceTier,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('certified-mail/create error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
