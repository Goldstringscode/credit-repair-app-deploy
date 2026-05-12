import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY
  const keyPrefix = process.env.ANTHROPIC_API_KEY?.substring(0, 10)
  return NextResponse.json({
    anthropic: { configured: hasKey, keyPrefix: hasKey ? keyPrefix + '...' : null },
    openai: { configured: !!process.env.OPENAI_API_KEY },
    provider: hasKey ? 'anthropic-claude' : 'template-fallback',
    model: 'claude-sonnet-4-5',
  })
}
