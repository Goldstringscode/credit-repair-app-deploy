import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const key = process.env.ANTHROPIC_API_KEY

    if (!key) {
      return NextResponse.json({
        success: false,
        message: 'ANTHROPIC_API_KEY environment variable is not set',
        error: 'Missing API key'
      }, { status: 400 })
    }

    if (!key.startsWith('sk-ant-')) {
      return NextResponse.json({
        success: false,
        message: 'ANTHROPIC_API_KEY format appears invalid (should start with sk-ant-)',
        error: 'Invalid key format'
      }, { status: 400 })
    }

    // Create Anthropic client and test with a minimal message
    const client = new Anthropic({ apiKey: key })

    const completion = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say OK' }],
    })

    const responseText = completion.content[0]?.type === 'text'
      ? completion.content[0].text
      : 'no text'

    return NextResponse.json({
      success: true,
      message: 'Anthropic API connected successfully',
      model: completion.model,
      response: responseText,
      keyPrefix: key.substring(0, 16) + '...',
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Anthropic connection test error: ' + error.message,
      error: error.message
    }, { status: 500 })
  }
}
