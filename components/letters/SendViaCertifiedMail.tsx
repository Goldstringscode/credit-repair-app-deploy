'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Mail, CreditCard, Truck, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rate {
  carrier: string
  service: string
  serviceCode: string
  days: string
  cents: number
  dollars: string
  objectId: string
  recommended?: boolean
}

interface CostBreakdown {
  bureauCount: number
  tierName: string
  totalCents: number
  totalDollars: string
  perBureauDollars: string
  discountPercent: number
  discountAmount: number
  lineItems: { label: string; cents: number; dollars: string }[]
}

interface Props {
  letterContent: string
  letterType: string
  recipientName: string
  recipientAddress: string
  bureaus?: string[]          // All selected bureaus — drives multi-bureau pricing
  tier?: string               // 'standard' | 'certified' | 'priority'
  userId?: string
  personalInfo?: {
    firstName: string; lastName: string
    address: string; city: string; state: string; zip: string
    email: string; phone: string
  }
  onSuccess?: (trackingNumber: string) => void
  onError?: (error: string) => void
}

// ─── Credit bureau address book ───────────────────────────────────────────────

const BUREAU_ADDRESSES: Record<string, { name: string; street1: string; city: string; state: string; zip: string }> = {
  experian:  { name: 'Experian',  street1: '475 Anton Blvd',      city: 'Costa Mesa',   state: 'CA', zip: '92626' },
  equifax:   { name: 'Equifax',   street1: '1550 Peachtree St NW', city: 'Atlanta',      state: 'GA', zip: '30309' },
  transunion:{ name: 'TransUnion',street1: '2 Baldwin Pl PO Box 1000', city: 'Chester',  state: 'PA', zip: '19016' },
}

// ─── Tier pricing display ──────────────────────────────────────────────────────

const TIER_INFO: Record<string, { label: string; badge: string | null; badgeColor: string }> = {
  standard: { label: 'Standard Mail',    badge: null,           badgeColor: '' },
  certified:{ label: 'Certified Mail',   badge: 'Most Popular', badgeColor: 'bg-blue-100 text-blue-700' },
  priority: { label: 'Priority Mail',    badge: 'Fastest',      badgeColor: 'bg-orange-100 text-orange-700' },
}

// ─── Stripe test card helper ───────────────────────────────────────────────────

const TEST_CARDS = [
  { number: '4242 4242 4242 4242', label: 'Visa (succeeds)' },
  { number: '5555 5555 5555 4444', label: 'Mastercard (succeeds)' },
  { number: '4000 0000 0000 9995', label: 'Visa (declined)' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function SendViaCertifiedMail({
  letterContent, letterType, recipientName, recipientAddress,
  bureaus = [], tier = 'certified', userId, personalInfo, onSuccess, onError,
}: Props) {
  const bureauList = bureaus.length > 0 ? bureaus : ['experian']
  const bureauCount = bureauList.length
  const tierInfo = TIER_INFO[tier] || TIER_INFO.certified

  // ─── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<'rates' | 'payment' | 'processing' | 'done'>('rates')
  const [rates, setRates] = useState<Rate[]>([])
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null)
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [sentResults, setSentResults] = useState<{bureau: string; bureauName: string; trackingNumber: string; trackingUrl?: string; labelUrl?: string}[]>([])

  // Stripe card fields (manual entry — no saved cards yet)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState(personalInfo ? personalInfo.firstName + ' ' + personalInfo.lastName : '')

  // ─── Load rates + pricing on mount ──────────────────────────────────────────
  const loadRatesAndPricing = useCallback(async () => {
    setLoadingRates(true)
    try {
      const [ratesRes, costRes] = await Promise.all([
        fetch('/api/certified-mail/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bureauCount, toAddress: BUREAU_ADDRESSES[bureauList[0]] }),
        }),
        fetch('/api/certified-mail/calculate-cost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier, bureauCount, bureaus: bureauList }),
        }),
      ])
      const [ratesData, costData] = await Promise.all([ratesRes.json(), costRes.json()])

      if (ratesData.success && ratesData.rates?.length) {
        setRates(ratesData.rates)
        const preferred = ratesData.rates.find((r: Rate) => r.recommended) || ratesData.rates[0]
        setSelectedRate(preferred)
      }
      if (costData.success) {
        setCostBreakdown(costData)
      }
    } catch (e: any) {
      toast.error('Failed to load shipping rates: ' + e.message)
    } finally {
      setLoadingRates(false)
    }
  }, [bureauCount, tier, bureauList])

  useEffect(() => { loadRatesAndPricing() }, [loadRatesAndPricing])

  // ─── Payment submission ──────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!selectedRate) { toast.error('Please select a shipping rate'); return }
    if (!cardNumber.replace(/s/g,'') || !cardExpiry || !cardCvc) {
      toast.error('Please fill in all card fields')
      return
    }
    setLoadingPayment(true)
    setStep('processing')

    try {
      // Step 1: Create the mail request + Stripe payment intent
      const sender = personalInfo ? {
        name: personalInfo.firstName + ' ' + personalInfo.lastName,
        street1: personalInfo.address,
        city: personalInfo.city, state: personalInfo.state, zip: personalInfo.zip,
        email: personalInfo.email, phone: personalInfo.phone,
      } : {
        name: 'Credit Repair AI User',
        street1: '215 Clayton St', city: 'San Francisco', state: 'CA', zip: '94117',
      }

      // Send to each bureau
      const results: { bureau: string; trackingNumber: string }[] = []
      for (const bureauId of bureauList) {
        const bureauAddr = BUREAU_ADDRESSES[bureauId]
        const recipient = bureauAddr || { name: recipientName, street1: recipientAddress, city: '', state: '', zip: '' }

        const createRes = await fetch('/api/certified-mail/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId || 'unknown',
            recipient: { ...recipient, country: 'US' },
            sender: { ...sender, country: 'US' },
            letter: {
              content: letterContent,
              disputeType: letterType,
              bureauName: bureauAddr?.name || recipientName,
            },
            serviceTier: tier,
            selectedRateObjectId: selectedRate.objectId,
          }),
        })
        const createData = await createRes.json()
        if (!createData.success) throw new Error(createData.error || 'Failed to create mail request for ' + (bureauAddr?.name || bureauId))

        // Step 2: Process payment via the payment intent
        const payRes = await fetch('/api/certified-mail/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackingId: createData.trackingId,
            paymentIntentId: createData.paymentIntentId,
            // Card details passed for Stripe to confirm
            card: {
              number: cardNumber.replace(/s/g,''),
              expMonth: parseInt(cardExpiry.split('/')[0]),
              expYear: parseInt('20' + cardExpiry.split('/')[1]),
              cvc: cardCvc,
              name: cardName,
            },
          }),
        })
        const payData = await payRes.json()
        if (!payData.success) throw new Error(payData.error || 'Payment failed for ' + (bureauAddr?.name || bureauId))

        results.push({
          bureau: bureauId,
          bureauName: bureauAddr?.name || recipientName,
          trackingNumber: payData.trackingNumber || '',
          trackingUrl: payData.trackingUrl,
          labelUrl: payData.labelUrl,
        })
      }

      // All bureaus sent successfully
      setSentResults(results)
      setStep('done')
      const plural = bureauList.length > 1
      toast.success(plural ? `${bureauList.length} letters sent via certified mail!` : 'Letter sent via certified mail!')
      onSuccess?.(results.map(r => r.trackingNumber).join(','))
    } catch (e: any) {
      toast.error(e.message || 'Failed to send letter')
      setStep('payment')
      onError?.(e.message)
    } finally {
      setLoadingPayment(false)
    }
  }

  // ─── Card number formatting ───────────────────────────────────────────────
  const formatCard = (v: string) => v.replace(/D/g,'').replace(/(.{4})/g,'$1 ').trim().substring(0,19)
  const formatExpiry = (v: string) => { const d = v.replace(/D/g,''); return d.length>=3 ? d.substring(0,2)+'/'+d.substring(2,4) : d }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <Card className="border-green-300 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-green-800 text-lg mb-1">
              {sentResults.length > 1 ? `${sentResults.length} Letters Sent!` : 'Letter Sent!'}
            </h3>
            <p className="text-green-700 text-sm">
              {sentResults.length > 1
                ? `Your dispute letters have been sent to all ${sentResults.length} credit bureaus via USPS Certified Mail.`
                : `Your dispute letter has been sent to ${sentResults[0]?.bureauName} via USPS Certified Mail.`}
            </p>
          </div>
          <div className="space-y-3">
            {sentResults.map((result, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-800 text-sm">{result.bureauName}</div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Sent ✅</span>
                </div>
                {result.trackingNumber ? (
                  <>
                    <p className="text-xs text-gray-500 mb-1">USPS Tracking Number</p>
                    <p className="font-mono font-bold text-gray-800 text-sm mb-2">{result.trackingNumber}</p>
                    <div className="flex gap-2">
                      <a href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${result.trackingNumber}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline">
                        Track on USPS.com →
                      </a>
                      {result.labelUrl && (
                        <a href={result.labelUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-purple-600 hover:underline">
                          Download Label →
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Tracking number will be available shortly</p>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-gray-400 mt-4">
            Credit bureaus must respond within 30 days per FCRA Section 611
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Send via Certified Mail
            </CardTitle>
            {tierInfo.badge && <Badge className={tierInfo.badge.badgeColor}>{tierInfo.badge}</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          {/* Sending to */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Sending To</p>
            <div className="flex flex-wrap gap-2">
              {bureauList.map(b => {
                const addr = BUREAU_ADDRESSES[b]
                return (
                  <div key={b} className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
                    <div className="font-semibold text-blue-800">{addr?.name || b}</div>
                    <div className="text-blue-600 text-xs">{addr ? addr.street1 + ', ' + addr.city + ', ' + addr.state : recipientAddress}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cost breakdown */}
          {costBreakdown ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowBreakdown(!showBreakdown)}>
                <div>
                  <span className="text-sm text-gray-600">{tierInfo.label} — {bureauCount} bureau{bureauCount > 1 ? 's' : ''}</span>
                  <div className="text-xl font-bold text-gray-900 mt-0.5">{costBreakdown.totalDollars}</div>
                </div>
                <div className="text-right">
                  {bureauCount > 1 && <div className="text-xs text-gray-400">{costBreakdown.perBureauDollars}/bureau</div>}
                  {costBreakdown.discountPercent > 0 && (
                    <Badge className="bg-green-100 text-green-700 mt-1">{costBreakdown.discountPercent}% multi-bureau discount</Badge>
                  )}
                  {showBreakdown ? <ChevronUp className="h-4 w-4 text-gray-400 mt-1 ml-auto" /> : <ChevronDown className="h-4 w-4 text-gray-400 mt-1 ml-auto" />}
                </div>
              </div>
              {showBreakdown && (
                <div className="mt-3 border-t border-gray-200 pt-3 space-y-1.5">
                  {costBreakdown.lineItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className={item.cents < 0 ? 'text-green-600' : 'text-gray-600'}>{item.label}</span>
                      <span className={item.cents < 0 ? 'text-green-600 font-medium' : 'text-gray-800 font-medium'}>{item.dollars}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm border-t border-gray-200 pt-2 mt-2">
                    <span>Total</span>
                    <span>{costBreakdown.totalDollars}</span>
                  </div>
                </div>
              )}
            </div>
          ) : loadingRates ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading pricing...
            </div>
          ) : null}

          {/* Shipping rates */}
          {step === 'rates' && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Shipping Method</p>
              {loadingRates ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading rates from Shippo...
                </div>
              ) : rates.length > 0 ? (
                <div className="space-y-2">
                  {rates.map(rate => (
                    <div key={rate.objectId}
                      onClick={() => setSelectedRate(rate)}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedRate?.objectId === rate.objectId ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selectedRate?.objectId === rate.objectId ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                        <div>
                          <div className="font-medium text-sm text-gray-800 flex items-center gap-2">
                            {rate.service}
                            {rate.recommended && <Badge className="bg-blue-100 text-blue-700 text-xs">Recommended</Badge>}
                          </div>
                          <div className="text-xs text-gray-500">{rate.carrier} · {rate.days}</div>
                        </div>
                      </div>
                      <div className="font-bold text-gray-800">{rate.dollars}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-2">No rates available. Check Shippo API key.</p>
              )}

              <Button onClick={() => setStep('payment')} disabled={!selectedRate || loadingRates}
                className="w-full mt-4" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                <CreditCard className="h-4 w-4 mr-2" />
                Continue to Payment
              </Button>
            </div>
          )}

          {/* Payment form */}
          {(step === 'payment' || step === 'processing') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Payment Details</p>
                <button onClick={() => setStep('rates')} className="text-xs text-blue-600 hover:underline">← Change shipping</button>
              </div>

              {/* Selected rate summary */}
              {selectedRate && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>{selectedRate.service} · {selectedRate.days}</span>
                  </div>
                  <span className="font-medium">{selectedRate.dollars}</span>
                </div>
              )}

              {/* Card fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Name on Card</label>
                  <input value={cardName} onChange={e=>setCardName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Card Number</label>
                  <input value={cardNumber} onChange={e=>setCardNumber(formatCard(e.target.value))}
                    placeholder="4242 4242 4242 4242" maxLength={19}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Expiry (MM/YY)</label>
                    <input value={cardExpiry} onChange={e=>setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="12/26" maxLength={5}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">CVC</label>
                    <input value={cardCvc} onChange={e=>setCardCvc(e.target.value.replace(/D/g,'').substring(0,4))}
                      placeholder="123" maxLength={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Test cards helper */}
              <details className="mt-3">
                <summary className="text-xs text-blue-500 cursor-pointer">Test cards (sandbox mode)</summary>
                <div className="mt-2 space-y-1">
                  {TEST_CARDS.map(tc => (
                    <button key={tc.number} onClick={() => setCardNumber(tc.number)}
                      className="block w-full text-left text-xs bg-gray-50 rounded p-2 hover:bg-blue-50 font-mono">
                      <span className="font-bold">{tc.number}</span> <span className="text-gray-500 font-sans">— {tc.label}</span>
                    </button>
                  ))}
                  <p className="text-xs text-gray-400 mt-1">Any future date · Any 3-digit CVC · Any ZIP</p>
                </div>
              </details>

              <Button onClick={handlePay} disabled={loadingPayment || step === 'processing'}
                className="w-full mt-4 text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                {loadingPayment || step === 'processing'
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                  : <><Mail className="h-4 w-4 mr-2" /> Pay {costBreakdown?.totalDollars || ''} & Send Letter{bureauList.length > 1 ? 's' : ''}</>}
              </Button>
              <p className="text-xs text-center text-gray-400 mt-2">🔒 Secured by Stripe · USPS Certified Mail</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
