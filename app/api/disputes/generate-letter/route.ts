import { type NextRequest, NextResponse } from 'next/server'
import { aiDisputeLetterGenerator } from '@/lib/ai-dispute-letter-generator'
import { sanitizeAiFields } from '@/lib/sanitize-ai-input'
import { sanitizeError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      personalInfo,
      disputeItems,
      letterType,
      letterTier,
      creditBureau,
      additionalContext,
      recipients,
    } = body

    if (!personalInfo || !disputeItems || !letterType || !letterTier) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: personalInfo, disputeItems, letterType, letterTier' },
        { status: 400 }
      )
    }

    const validLetterTypes = ['dispute', 'debt_validation', 'cease_and_desist', 'goodwill', 'pay_for_delete', 'verification']
    if (!validLetterTypes.includes(letterType)) {
      return NextResponse.json({ success: false, error: 'Invalid letter type' }, { status: 400 })
    }

    let recipientList: Array<{ id: string; name: string; address: string; city: string; state: string; zip: string; type: string }>

    if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      recipientList = recipients
    } else if (creditBureau) {
      const bureauAddresses: Record<string, { address: string; city: string; state: string; zip: string }> = {
        experian:   { address: 'PO Box 4500',   city: 'Allen',   state: 'TX', zip: '75013' },
        transunion: { address: 'PO Box 2000',   city: 'Chester', state: 'PA', zip: '19016' },
        equifax:    { address: 'PO Box 740256', city: 'Atlanta', state: 'GA', zip: '30374' },
      }
      const bureauInfo = bureauAddresses[creditBureau.toLowerCase()] || { address: '', city: '', state: '', zip: '' }
      recipientList = [{ id: creditBureau, name: creditBureau, type: 'bureau', ...bureauInfo }]
    } else {
      return NextResponse.json(
        { success: false, error: 'Provide either recipients array or creditBureau' },
        { status: 400 }
      )
    }

    if (recipientList.length > 20) {
      return NextResponse.json({ success: false, error: 'Maximum 20 recipients per request' }, { status: 400 })
    }

    let sanitizedInfo: Record<string, string>
    let sanitizedItems: any[]
    let sanitizedContext: string

    try {
      sanitizedInfo = sanitizeAiFields({
        firstName:         personalInfo?.firstName ?? '',
        lastName:          personalInfo?.lastName ?? '',
        additionalContext: additionalContext ?? '',
      })
      sanitizedItems = (disputeItems || []).map((item: any) => ({
        ...item,
        reason:      sanitizeAiFields({ reason: item.reason ?? '' }).reason,
        accountName: sanitizeAiFields({ accountName: item.accountName ?? '' }).accountName,
      }))
      sanitizedContext = sanitizedInfo.additionalContext
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid input detected. Please revise your submission.' },
        { status: 400 }
      )
    }

    const sanitizedPersonalInfo = { ...personalInfo, ...sanitizedInfo }

    const letters: Array<{
      recipientId: string; recipientName: string; recipientAddress: string
      letterTier: string; letterType: string; content: string
    }> = []

    for (const recipient of recipientList) {
      const recipientPersonalInfo = {
        ...sanitizedPersonalInfo,
        creditBureau: recipient.name,
        recipientName: recipient.name,
        recipientAddress: recipient.type === 'self'
          ? (personalInfo?.address || '')
          : `${recipient.address}, ${recipient.city}, ${recipient.state} ${recipient.zip}`.trim(),
      }

      const letter = await aiDisputeLetterGenerator.generateDisputeLetter(
        recipientPersonalInfo,
        sanitizedItems,
        letterTier,
        recipient.name,
        sanitizedContext
      )

      letters.push({
        recipientId:      recipient.id,
        recipientName:    recipient.name,
        recipientAddress: recipient.type === 'self'
          ? 'Personal copy'
          : `${recipient.address}, ${recipient.city}, ${recipient.state} ${recipient.zip}`,
        letterTier,
        letterType,
        content: letter,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        letters,
        count: letters.length,
        message: `Successfully generated ${letters.length} letter${letters.length !== 1 ? 's' : ''}`,
      }
    })

  } catch (err: any) {
    console.error('Letter generation failed:', err.message)
    return NextResponse.json(
      { success: false, error: sanitizeError(err, 'generate-letter') },
      { status: 500 }
    )
  }
}
