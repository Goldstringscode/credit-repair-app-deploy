'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Mail, CreditCard, Truck, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Rate { carrier: string; service: string; serviceCode: string; days: string; cents: number; dollars: string; objectId: string; recommended?: boolean; simulated?: boolean }
interface CostBreakdown { bureauCount: number; tierName: string; totalCents: number; totalDollars: string; perBureauDollars: string; discountPercent: number; discountAmount: number; lineItems: { label: string; cents: number; dollars: string }[] }
interface SentResult { bureau: string; bureauName: string; trackingNumber: string; trackingUrl?: string; labelUrl?: string }
interface Props { letterContent: string; letterType: string; recipientName: string; recipientAddress: string; bureaus?: string[]; customRecipients?: Array<{ id?: string; name: string; address: string; city: string; state: string; zip: string }>; tier?: string; userId?: string; personalInfo?: { firstName: string; lastName: string; address: string; city: string; state: string; zip: string; email: string; phone: string }; onSuccess?: (t: string) => void; onError?: (e: string) => void }

const BUREAU_ADDRESSES: Record<string, { name: string; street1: string; city: string; state: string; zip: string }> = {
  experian:   { name: 'Experian',   street1: '475 Anton Blvd',          city: 'Costa Mesa', state: 'CA', zip: '92626' },
  equifax:    { name: 'Equifax',    street1: '1550 Peachtree St NW',     city: 'Atlanta',    state: 'GA', zip: '30309' },
  transunion: { name: 'TransUnion', street1: '2 Baldwin Pl PO Box 1000', city: 'Chester',    state: 'PA', zip: '19016' },
}
const TIER_INFO: Record<string, { label: string; badge: string | null; badgeColor: string }> = {
  standard:  { label: 'Standard Mail',  badge: null,           badgeColor: '' },
  certified: { label: 'Certified Mail', badge: 'Most Popular', badgeColor: 'bg-blue-100 text-blue-700' },
  priority:  { label: 'Priority Mail',  badge: 'Fastest',      badgeColor: 'bg-orange-100 text-orange-700' },
}

function PaymentForm({ bureauList, tier, letterContent, letterType, recipientName, userId, personalInfo, onSuccess, onError, rates, selectedRate, setSelectedRate, loadingRates, costBreakdown }: any) {
  const stripe = useStripe()
  const elements = useElements()
  const [step, setStep] = useState<'rates'|'payment'|'processing'|'done'>('rates')
  const [loading, setLoading] = useState(false)
  const [sentResults, setSentResults] = useState<SentResult[]>([])
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateSaved, setTemplateSaved] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [intentId, setIntentId] = useState<string | null>(null)

  // Create PaymentIntent when user reaches payment step
  const initPayment = useCallback(async () => {
    if (!bureauList?.length && !recipientName) return
    try {
      // Look up full bureau address object from BUREAU_ADDRESSES constant
      const bureauId = (Array.isArray(bureauList) ? bureauList[0] : bureauList) || recipientName
      const bureauAddr = BUREAU_ADDRESSES[bureauId as keyof typeof BUREAU_ADDRESSES]
      const addr = bureauAddr || { name: recipientName, street1: '', city: '', state: '', zip: '' }
      const sender = personalInfo ? {
        name:    personalInfo.firstName + ' ' + personalInfo.lastName,
        street1: personalInfo.address || '',
        city:    personalInfo.city || '',
        state:   personalInfo.state || '',
        zip:     personalInfo.zipCode || personalInfo.zip || '',
        country: 'US',
        // USPS (via Shippo) requires a sender email AND phone. Pass them through when
        // the profile has them; the API also has a server-side fallback so the label
        // purchase never fails on a missing contact field.
        email:   personalInfo.email || '',
        phone:   personalInfo.phone || personalInfo.phoneNumber || '',
      } : { name: 'User', street1: '', city: '', state: 'CA', zip: '90001', country: 'US', email: '', phone: '' }
      const res = await fetch('/api/certified-mail/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letter: { content: letterContent, disputeType: letterType, bureauName: addr.name },
          recipient: {
              name:    addr.name    || String(bureauId),
              street1: addr.street1 || '',
              city:    addr.city    || '',
              state:   addr.state   || '',
              zip:     addr.zip     || '',
              country: 'US',
            },
          sender,
          serviceTier: tier,
        }),
      })
      const data = await res.json()
      if (data.success && data.paymentClientSecret) {
        setClientSecret(data.paymentClientSecret)
        setTrackingId(data.trackingId)
        setIntentId(data.paymentIntentId)
      } else {
        toast.error(data.error || 'Failed to initialize payment')
      }
    } catch (err: any) {
      toast.error('Failed to initialize payment: ' + err.message)
    }
  }, [bureauList, recipientName, personalInfo, letterContent, letterType, tier])

  useEffect(() => {
    if (step === 'payment' && !clientSecret) {
      initPayment()
    }
  }, [step, clientSecret, initPayment])

  const handlePay = async () => {
    if (!stripe || !elements) { toast.error('Stripe not loaded'); return }
    if (!selectedRate) { toast.error('Select a shipping rate'); return }
    if (!clientSecret) { toast.error('Payment not initialized. Please wait...'); return }

    const cardEl = elements.getElement(CardElement)
    if (!cardEl) { toast.error('Card element not found'); return }

    setLoading(true); setStep('processing')
    try {
      // Confirm payment client-side (required for 3DS / SCA compliance)
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardEl,
          billing_details: {
            name: personalInfo ? personalInfo.firstName + ' ' + personalInfo.lastName : 'User',
          },
        },
      })

      if (confirmError) throw new Error('Card error: ' + confirmError.message)
      if (!paymentIntent || (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'processing')) {
        throw new Error('Payment not completed: ' + paymentIntent?.status)
      }

      // Payment confirmed — tell server to finalize and purchase shipping label
      const payRes = await fetch('/api/certified-mail/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId, paymentIntentId: paymentIntent.id }),
      })
      const payData = await payRes.json()
      if (!payData.success) throw new Error(payData.error || 'Failed to process shipping')

      // Save template if requested
      const result: SentResult = {
        bureau: recipientName || 'Custom',
        bureauName: recipientName || 'Custom',
        trackingNumber: payData.trackingNumber,
        trackingUrl: payData.trackingUrl,
        labelUrl: payData.labelUrl,
        estimatedDelivery: payData.estimatedDelivery,
        cost: payData.cost,
      }
      setSentResults([result])
      setStep('done')
      onSuccess?.([result])
    } catch (err: any) {
      toast.error(err.message || 'Payment failed')
      setStep('payment')
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return
    setSavingTemplate(true)
    try {
      const res = await fetch('/api/letter-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: templateName.trim(), content: letterContent, letterType, bureaus: bureauList, tier }) })
      const data = await res.json()
      if (data.success) { setTemplateSaved(true); setShowSaveTemplate(false); toast.success('Template saved!') }
      else toast.error(data.error || 'Failed to save')
    } catch (e: any) { toast.error('Failed: ' + e.message) }
    finally { setSavingTemplate(false) }
  }

  if (step === 'done') return (
    <div className="bg-green-50 border border-green-300 rounded-xl p-5">
      <div className="text-center mb-4">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="font-bold text-green-800 text-lg mb-1">{sentResults.length > 1 ? sentResults.length + ' Letters Sent!' : 'Letter Sent!'}</h3>
        <p className="text-green-700 text-sm">{sentResults.length > 1 ? 'Letters sent to all ' + sentResults.length + ' bureaus via USPS Certified Mail.' : 'Letter sent to ' + sentResults[0]?.bureauName + ' via USPS Certified Mail.'}</p>
      </div>
      <div className="space-y-3">
        {sentResults.map((r, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-800 text-sm">{r.bureauName}</div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Sent ✅</span>
            </div>
            {r.trackingNumber ? (<>
              <p className="text-xs text-gray-500 mb-1">USPS Tracking Number</p>
              <p className="font-mono font-bold text-gray-800 text-sm mb-2">{r.trackingNumber}</p>
              <div className="flex gap-3">
                <a href={"https://tools.usps.com/go/TrackConfirmAction?tLabels=" + r.trackingNumber} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Track on USPS.com →</a>
                {r.labelUrl && <a href={r.labelUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline">Download Label →</a>}
              </div>
            </>) : <p className="text-xs text-gray-400">Tracking number available shortly</p>}
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-gray-400 mt-4">Credit bureaus must respond within 30 days per FCRA Section 611</p>
      <div className="mt-4 border-t border-green-200 pt-4">
        {!showSaveTemplate && !templateSaved && <button onClick={() => setShowSaveTemplate(true)} className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50">💾 Save as Template for Future Use</button>}
        {showSaveTemplate && <div className="space-y-2"><p className="text-xs font-medium text-gray-700">Name this template:</p><input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="e.g. Capital One - Experian" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" /><div className="flex gap-2"><button onClick={handleSaveTemplate} disabled={!templateName.trim() || savingTemplate} className="flex-1 text-sm font-semibold py-2 rounded-lg text-white disabled:opacity-50" style={{background:'linear-gradient(135deg,#667eea,#764ba2)'}}>{savingTemplate ? 'Saving...' : 'Save Template'}</button><button onClick={() => setShowSaveTemplate(false)} className="px-4 text-sm text-gray-500 border border-gray-200 rounded-lg">Cancel</button></div></div>}
        {templateSaved && <p className="text-center text-sm text-green-600 font-medium">✅ Saved! View in <a href="/dashboard/my-templates" className="underline">My Templates</a></p>}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {step === 'rates' && <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Shipping Method</p>
        {loadingRates ? <div className="flex items-center gap-2 text-gray-400 text-sm py-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading rates...</div>
        : rates.length > 0 ? <div className="space-y-2">{rates.map((rate: Rate) => (
          <div key={rate.objectId} onClick={() => setSelectedRate(rate)} className={"flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all " + (selectedRate?.objectId === rate.objectId ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300')}>
            <div className="flex items-center gap-3">
              <div className={"w-4 h-4 rounded-full border-2 flex-shrink-0 " + (selectedRate?.objectId === rate.objectId ? 'border-blue-500 bg-blue-500' : 'border-gray-300')} />
              <div><div className="font-medium text-sm text-gray-800 flex items-center gap-2">{rate.service}{rate.recommended && <Badge className="bg-blue-100 text-blue-700 text-xs">Recommended</Badge>}{rate.simulated && <Badge className="bg-gray-100 text-gray-500 text-xs">Test Mode</Badge>}</div><div className="text-xs text-gray-500">{rate.carrier} · {rate.days}</div></div>
            </div>
            <div className="font-bold text-gray-800">{rate.dollars}</div>
          </div>
        ))}</div>
        : <p className="text-sm text-gray-400 py-2">Unable to load rates. Please try again.</p>}
        {selectedRate && !selectedRate.recommended && <div className="mt-3 bg-amber-50 border border-amber-300 rounded-lg p-3 flex gap-2"><span className="text-amber-500 text-lg">⚠️</span><p className="text-xs text-amber-800"><strong>Proceed at your own risk.</strong> Credit bureaus only legally recognize <strong>USPS Certified Mail</strong> as proof of delivery under the FCRA.</p></div>}
        {selectedRate?.recommended && <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2"><span className="text-green-500 text-lg">✅</span><p className="text-xs text-green-800"><strong>Certified Mail is strongly recommended.</strong> The only method credit bureaus are legally required to accept under the FCRA.</p></div>}
        <button onClick={() => setStep('payment')} disabled={!selectedRate || loadingRates} className="w-full mt-4 py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg,#667eea,#764ba2)'}}><CreditCard className="h-4 w-4" /> Continue to Payment</button>
      </div>}

      {(step === 'payment' || step === 'processing') && <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Payment Details</p>
          <button onClick={() => setStep('rates')} className="text-xs text-blue-600 hover:underline">← Change shipping</button>
        </div>
        {selectedRate && <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center justify-between text-sm"><div className="flex items-center gap-2 text-gray-600"><Truck className="h-4 w-4" /><span>{selectedRate.service} · {selectedRate.days}</span></div><span className="font-medium">{selectedRate.dollars}</span></div>}
        <label className="text-xs font-medium text-gray-600 mb-1 block">Card Details</label>
              <div className="border border-gray-300 rounded-lg px-3 py-3.5 bg-white focus-within:ring-2 focus-within:ring-blue-500 mb-1">
                <CardElement options={{ style: { base: { fontSize: '14px', color: '#1f2937', fontFamily: 'system-ui, sans-serif', '::placeholder': { color: '#9ca3af' } }, invalid: { color: '#ef4444' } } }} />
              </div>
              {!clientSecret && <p className="text-xs text-gray-400 mt-1">Setting up secure payment...</p>}
            <details className="mb-4"><summary className="text-xs text-blue-500 cursor-pointer">Test cards (sandbox)</summary><div className="mt-2 space-y-1">{[{n:'4242 4242 4242 4242',l:'Visa — succeeds'},{n:'5555 5555 5555 4444',l:'Mastercard — succeeds'},{n:'4000 0000 0000 9995',l:'Visa — declined'}].map(tc=><div key={tc.n} className="text-xs bg-gray-50 rounded p-2"><span className="font-mono font-bold">{tc.n}</span> <span className="text-gray-500">— {tc.l}</span></div>)}<p className="text-xs text-gray-400 mt-1">Any future date · Any 3-digit CVC · Any ZIP</p></div></details>
        <button onClick={handlePay} disabled={loading || step === 'processing' || !stripe} className="w-full py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg,#667eea,#764ba2)'}}>
          {loading || step === 'processing' ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><Mail className="h-4 w-4" /> Pay {costBreakdown?.totalDollars || ''} &amp; Send Letter{bureauList.length > 1 ? 's' : ''}</>}
        </button>
        <p className="text-xs text-center text-gray-400 mt-2">🔒 Secured by Stripe · USPS Certified Mail</p>
      </div>}
    </div>
  )
}

export default function SendViaCertifiedMail({ letterContent, letterType, recipientName, recipientAddress, bureaus = [], customRecipients = [], tier = 'certified', userId, personalInfo, onSuccess, onError }: Props) {
  const bureauList = bureaus.length > 0 ? bureaus : ['experian']
  const bureauCount = bureauList.length
  const customList = Array.isArray(customRecipients) ? customRecipients : []
  const totalRecipients = bureauCount + customList.length
  const tierInfo = TIER_INFO[tier] || TIER_INFO.certified
  const [rates, setRates] = useState<Rate[]>([])
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null)
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null)
  const [loadingRates, setLoadingRates] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const loadRatesAndPricing = useCallback(async () => {
    setLoadingRates(true)
    try {
      const [rr, cr] = await Promise.all([
        fetch('/api/certified-mail/rates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bureauCount: totalRecipients, toAddress: BUREAU_ADDRESSES[bureauList[0]] }) }),
        fetch('/api/certified-mail/calculate-cost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier, bureauCount: totalRecipients, bureaus: bureauList }) }),
      ])
      const [rd, cd] = await Promise.all([rr.json(), cr.json()])
      const rl = rd.rates || []
      if (rl.length > 0) { setRates(rl); setSelectedRate(rl.find((r: Rate) => r.recommended) || rl[0]) }
      if (cd.success) setCostBreakdown(cd)
    } catch (e: any) { toast.error('Failed to load rates: ' + e.message) }
    finally { setLoadingRates(false) }
  }, [bureauCount, tier])

  useEffect(() => { loadRatesAndPricing() }, [loadRatesAndPricing])

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-bold text-gray-800 flex items-center gap-2"><Mail className="h-5 w-5 text-blue-600" /> Send via Certified Mail</div>
        {tierInfo.badge && <Badge className={tierInfo.badgeColor}>{tierInfo.badge}</Badge>}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Sending To</p>
        <div className="flex flex-wrap gap-2">{bureauList.map((b: string) => { const addr = BUREAU_ADDRESSES[b]; return (<div key={b} className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm"><div className="font-semibold text-blue-800">{addr?.name || b}</div><div className="text-blue-600 text-xs">{addr ? addr.street1 + ', ' + addr.city + ', ' + addr.state : recipientAddress}</div></div>) })}
          {customList.map((r: any, i: number) => (
            <div key={'custom-'+(r.id || i)} className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <p className="text-sm font-semibold text-gray-800">{r.name}</p>
              <p className="text-xs text-gray-500">{r.address}, {r.city}, {r.state} {r.zip}</p>
            </div>
          ))}</div>
      </div>
      {costBreakdown && (
        <div className="bg-gray-50 rounded-lg p-4 cursor-pointer" onClick={() => setShowBreakdown(!showBreakdown)}>
          <div className="flex items-center justify-between">
            <div><span className="text-sm text-gray-600">{tierInfo.label} — {totalRecipients} recipient{totalRecipients > 1 ? 's' : ''}</span><div className="text-xl font-bold text-gray-900 mt-0.5">{costBreakdown.totalDollars}</div></div>
            <div className="text-right">{bureauCount > 1 && <div className="text-xs text-gray-400">{costBreakdown.perBureauDollars}/bureau</div>}{costBreakdown.discountPercent > 0 && <Badge className="bg-green-100 text-green-700 mt-1">{costBreakdown.discountPercent}% discount</Badge>}{showBreakdown ? <ChevronUp className="h-4 w-4 text-gray-400 mt-1 ml-auto" /> : <ChevronDown className="h-4 w-4 text-gray-400 mt-1 ml-auto" />}</div>
          </div>
          {showBreakdown && <div className="mt-3 border-t border-gray-200 pt-3 space-y-1.5">{costBreakdown.lineItems.map((item, i) => (<div key={i} className="flex justify-between text-sm"><span className={item.cents < 0 ? 'text-green-600' : 'text-gray-600'}>{item.label}</span><span className={item.cents < 0 ? 'text-green-600 font-medium' : 'text-gray-800 font-medium'}>{item.dollars}</span></div>))}<div className="flex justify-between font-bold text-sm border-t border-gray-200 pt-2 mt-2"><span>Total</span><span>{costBreakdown.totalDollars}</span></div></div>}
        </div>
      )}
      <Elements stripe={stripePromise}>
        <PaymentForm bureauList={bureauList} tier={tier} tierInfo={tierInfo} letterContent={letterContent} letterType={letterType} recipientName={recipientName} userId={userId} personalInfo={personalInfo} onSuccess={onSuccess} onError={onError} rates={rates} selectedRate={selectedRate} setSelectedRate={setSelectedRate} loadingRates={loadingRates} costBreakdown={costBreakdown} showBreakdown={showBreakdown} setShowBreakdown={setShowBreakdown} />
      </Elements>
    </div>
  )
}