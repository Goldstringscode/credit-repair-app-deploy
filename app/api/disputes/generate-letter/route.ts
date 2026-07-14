import { type NextRequest, NextResponse } from 'next/server'
import { aiDisputeLetterGenerator } from '@/lib/ai-dispute-letter-generator'
import { sanitizeAiFields } from '@/lib/sanitize-ai-input'
import { sanitizeError } from '@/lib/api-error'
import { requireAuth, type User } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limiter'
import { getSupabaseClient } from '@/lib/supabase-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function handler(request: NextRequest, user: User) {
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

    // Build recipient list — support both multi-recipient (new) and single creditBureau (legacy)
    const bureauAddresses: Record<string, { address: string; city: string; state: string; zip: string }> = {
      experian:   { address: 'PO Box 4500',   city: 'Allen',   state: 'TX', zip: '75013' },
      transunion: { address: 'PO Box 2000',   city: 'Chester', state: 'PA', zip: '19016' },
      equifax:    { address: 'PO Box 740256', city: 'Atlanta', state: 'GA', zip: '30374' },
    }

    let recipientList: Array<{ id: string; name: string; address: string; city: string; state: string; zip: string; type: string }>

    if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      recipientList = recipients
    } else if (creditBureau) {
      const bureauInfo = bureauAddresses[String(creditBureau).toLowerCase()] || { address: '', city: '', state: '', zip: '' }
      recipientList = [{ id: String(creditBureau), name: String(creditBureau), type: 'bureau', ...bureauInfo }]
    } else {
      return NextResponse.json(
        { success: false, error: 'Provide either recipients array or creditBureau' },
        { status: 400 }
      )
    }

    if (recipientList.length > 20) {
      return NextResponse.json({ success: false, error: 'Maximum 20 recipients per request' }, { status: 400 })
    }

    // Sanitize user-supplied fields
    let sanitizedPersonalInfo = personalInfo
    let sanitizedItems = disputeItems
    let sanitizedContext = additionalContext || ''

    try {
      const s = sanitizeAiFields({
        firstName:         personalInfo?.firstName ?? '',
        lastName:          personalInfo?.lastName ?? '',
        additionalContext: additionalContext ?? '',
      })
      sanitizedPersonalInfo = { ...personalInfo, firstName: s.firstName, lastName: s.lastName }
      sanitizedContext = s.additionalContext
      sanitizedItems = (disputeItems || []).map((item: any) => {
        // Sanitize every free-text field that can flow into the AI prompt.
        // The dashboard sends disputeReason / creditorName / accountNumber on each
        // item; older callers may send reason / accountName. Sanitize whichever
        // are present so nothing reaches Anthropic unchecked.
        const sf = sanitizeAiFields({
          disputeReason: item.disputeReason ?? '',
          creditorName:  item.creditorName  ?? '',
          accountName:   item.accountName   ?? '',
          accountNumber: item.accountNumber ?? '',
          reason:        item.reason        ?? '',
        })
        return {
          ...item,
          ...(item.disputeReason !== undefined ? { disputeReason: sf.disputeReason } : {}),
          ...(item.creditorName  !== undefined ? { creditorName:  sf.creditorName  } : {}),
          ...(item.accountName   !== undefined ? { accountName:   sf.accountName   } : {}),
          ...(item.accountNumber !== undefined ? { accountNumber: sf.accountNumber } : {}),
          ...(item.reason        !== undefined ? { reason:        sf.reason        } : {}),
        }
      })
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid input detected. Please revise your submission.' },
        { status: 400 }
      )
    }

    // Determine letter tier and type
    const tierMap: Record<string, string> = { premium: 'premium', enhanced: 'enhanced', standard: 'standard' }
    const resolvedTier = tierMap[String(letterTier).toLowerCase()] || 'standard'

    // Generate one letter per recipient
    const letters: Array<{
      recipientId: string; recipientName: string; recipientAddress: string
      letterTier: string; letterType: string; content: string; metadata?: any
    }> = []

    for (const recipient of recipientList) {
      const recipientPersonalInfo = {
        ...sanitizedPersonalInfo,
        creditBureau: recipient.name,
        recipientName: recipient.name,
        recipientAddress: recipient.type === 'self'
          ? (personalInfo?.address || '')
          : [recipient.address, recipient.city, recipient.state, recipient.zip].filter(Boolean).join(', '),
      }

      let letterResult: any
      try {
        letterResult = await aiDisputeLetterGenerator.generateDisputeLetter(
          recipientPersonalInfo,
          sanitizedItems,
          resolvedTier,
          recipient.name,
          sanitizedContext
        )
      } catch (genErr: any) {
        console.error('Generator failed for recipient', recipient.name, genErr.message)
        continue  // skip this recipient, try remaining ones
      }

      // The generator may return the letter directly as a string, or as an object with .content
      const content = typeof letterResult === 'string'
        ? letterResult
        : (letterResult?.content ?? letterResult?.letter ?? JSON.stringify(letterResult))

      letters.push({
        recipientId:      recipient.id,
        recipientName:    recipient.name,
        recipientAddress: recipient.type === 'self'
          ? 'Personal copy'
          : [recipient.address, recipient.city, recipient.state, recipient.zip].filter(Boolean).join(', '),
        letterTier:  resolvedTier,
        letterType,
        content,
        metadata: letterResult?.metadata || null,
      })
    }

    if (letters.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Letter generation failed for all recipients. Check server logs.' },
        { status: 500 }
      )
    }

    const firstLetter = letters[0]

    // Persist each generated letter to the letters table, tied to the
    // authenticated user's id (not client-supplied), so letters actually
    // show up in the dashboard and there's a real ownership record. A
    // persistence failure is logged but does not fail the whole request —
    // the user already paid the AI generation cost and should still get
    // their letter content back even if the DB write has a problem.
    let persisted = true
    try {
      const supabase = getSupabaseClient()
      const { error: insertError } = await supabase.from('letters').insert(
        letters.map((l) => ({
          user_id: user.id,
          letter_type: l.letterType,
          recipient: l.recipientName,
          recipient_address: l.recipientAddress,
          letter_content: l.content,
        }))
      )
      if (insertError) {
        console.error('[generate-letter] Failed to persist letters:', insertError.message)
        persisted = false
      }
    } catch (persistErr: any) {
      console.error('[generate-letter] Failed to persist letters:', persistErr.message)
      persisted = false
    }

    // Return both new shape (letters[]) AND legacy shape (letter) for backward compat
    return NextResponse.json({
      success: true,
      data: {
        // Legacy shape — page reads result.data.letter.content
        letter: {
          content:  firstLetter.content,
          metadata: firstLetter.metadata,
          recipient: firstLetter.recipientName,
        },
        // New shape — multi-recipient
        letters,
        persisted,
        count: letters.length,
        message: `Successfully generated ${letters.length} letter${letters.length !== 1 ? 's' : ''}`,
      }
    })

  } catch (err: any) {
    console.error('[generate-letter] Error:', err.message)
    return NextResponse.json(
      { success: false, error: sanitizeError(err, 'generate-letter') },
      { status: 500 }
    )
  }
}

// Require authentication (blocks anonymous cost-DoS on this AI-backed
// endpoint entirely) and rate-limit even authenticated callers to 5
// requests/minute via the existing 'ai' limiter.
export const POST = withRateLimit(requireAuth(handler), 'ai')
