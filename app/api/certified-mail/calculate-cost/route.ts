import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ─── Pricing constants ────────────────────────────────────────────────────────

export const LETTER_TIERS = {
  standard: { name: 'Standard', basePriceCents: 299, description: 'AI-generated letter', badge: null },
  certified: { name: 'Certified', basePriceCents: 799, description: 'Certified mail + tracking', badge: 'Most Popular' },
  priority:  { name: 'Priority', basePriceCents: 1299, description: 'Priority mail + return receipt', badge: 'Fastest' },
}

// Per-bureau postage add-on (applied after the first bureau)
export const ADDITIONAL_BUREAU_CENTS = 350   // $3.50 per extra bureau

// Multi-bureau discount schedule
export const BUREAU_DISCOUNTS: Record<number, number> = {
  1: 0,    // No discount for 1
  2: 5,    // 5% discount for 2
  3: 10,   // 10% discount for all 3
}

export interface CostBreakdown {
  bureauCount: number
  tier: string
  tierName: string
  basePrice: number           // Cents — one letter
  additionalBureauPrice: number  // Cents — extra letters
  subtotalBeforeDiscount: number
  discountPercent: number
  discountAmount: number
  totalCents: number
  totalDollars: string
  perBureauCents: number
  perBureauDollars: string
  lineItems: { label: string; cents: number; dollars: string }[]
}

export function calculateCost(tier: string, bureauCount: number): CostBreakdown {
  const tierConfig = LETTER_TIERS[tier as keyof typeof LETTER_TIERS] || LETTER_TIERS.standard
  const count = Math.max(1, Math.min(bureauCount, 3))

  const basePrice = tierConfig.basePriceCents
  const additionalBureauPrice = Math.max(0, count - 1) * ADDITIONAL_BUREAU_CENTS
  const subtotal = basePrice + additionalBureauPrice
  const discountPercent = BUREAU_DISCOUNTS[count] || 0
  const discountAmount = Math.round(subtotal * discountPercent / 100)
  const total = subtotal - discountAmount
  const perBureau = Math.round(total / count)

  const lineItems = [
    { label: tierConfig.name + ' Letter (1 bureau)', cents: basePrice, dollars: '$' + (basePrice/100).toFixed(2) },
    ...(count > 1 ? [{ label: 'Additional bureaus ×' + (count-1) + ' ($3.50 each)', cents: additionalBureauPrice, dollars: '$' + (additionalBureauPrice/100).toFixed(2) }] : []),
    ...(discountAmount > 0 ? [{ label: count + '-bureau discount (' + discountPercent + '% off)', cents: -discountAmount, dollars: '-$' + (discountAmount/100).toFixed(2) }] : []),
  ]

  return {
    bureauCount: count,
    tier,
    tierName: tierConfig.name,
    basePrice,
    additionalBureauPrice,
    subtotalBeforeDiscount: subtotal,
    discountPercent,
    discountAmount,
    totalCents: total,
    totalDollars: '$' + (total/100).toFixed(2),
    perBureauCents: perBureau,
    perBureauDollars: '$' + (perBureau/100).toFixed(2),
    lineItems,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tier = 'certified', bureauCount = 1, bureaus } = await request.json()
    const count = bureaus ? bureaus.length : Number(bureauCount)
    const breakdown = calculateCost(tier, count)
    return NextResponse.json({ success: true, ...breakdown })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tier = searchParams.get('tier') || 'certified'
  const bureauCount = parseInt(searchParams.get('bureauCount') || '1')
  const breakdown = calculateCost(tier, bureauCount)
  return NextResponse.json({ success: true, ...breakdown })
}
