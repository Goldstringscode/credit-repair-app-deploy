import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) {
      return NextResponse.json({ success: false, error: 'ANTHROPIC_API_KEY not set' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: key })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say OK' }],
    })

    return NextResponse.json({
      success: true,
      message: 'Anthropic API working',
      response: msg.content[0]?.type === 'text' ? msg.content[0].text : 'ok',
      model: msg.model,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
