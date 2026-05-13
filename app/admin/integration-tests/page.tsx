'use client'
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = 'idle' | 'running' | 'pass' | 'fail'
interface TestResult { pass: boolean; msg: string; data?: any }
interface SuiteResult { summary: { total: number; passed: number; failed: number; allPass: boolean }; results: Record<string, TestResult> }

// ─── Test metadata ─────────────────────────────────────────────────────────
const SUITES = [
  {
    id: 'config', label: 'Config Check', icon: '⚙️',
    desc: 'Verify all API keys and environment variables are set',
    tests: ['shippo_config','stripe_config','stripe_webhook','anthropic_config'],
  },
  {
    id: 'shippo', label: 'Shippo / Mail', icon: '📮',
    desc: 'Address validation, rate fetching, and test label creation via Shippo',
    tests: ['shippo_rates','shippo_label'],
  },
  {
    id: 'stripe', label: 'Stripe / Payments', icon: '💳',
    desc: 'Create a test payment intent and verify Stripe sandbox is responding',
    tests: ['stripe_payment_intent'],
  },
  {
    id: 'letters', label: 'Letter Generation', icon: '📝',
    desc: 'AI enhancement and full letter generation with Claude Haiku',
    tests: ['enhance_explanation','letter_generation'],
  },
]

const TEST_LABELS: Record<string, string> = {
  shippo_config: 'Shippo API Key',
  shippo_rates: 'Shippo Shipping Rates',
  shippo_label: 'Shippo Test Label',
  stripe_config: 'Stripe API Key',
  stripe_webhook: 'Stripe Webhook Secret',
  stripe_payment_intent: 'Stripe Payment Intent',
  anthropic_config: 'Anthropic API Key',
  enhance_explanation: 'AI Enhance Explanation',
  letter_generation: 'Letter Generation (Claude)',
}

export default function IntegrationTestsPage() {
  const [suiteStatus, setSuiteStatus] = useState<Record<string, Status>>({})
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [log, setLog] = useState<string[]>([])
  const [running, setRunning] = useState(false)

  const addLog = (msg: string) => setLog(p => [new Date().toLocaleTimeString() + ' — ' + msg, ...p])

  const runSuite = async (suiteId: string) => {
    setSuiteStatus(p => ({ ...p, [suiteId]: 'running' }))
    addLog('Running ' + suiteId + ' tests...')
    try {
      const res = await fetch('/api/admin/test-integrations?suite=' + suiteId)
      const data: SuiteResult = await res.json()
      setResults(p => ({ ...p, ...data.results }))
      const pass = data.summary.allPass
      setSuiteStatus(p => ({ ...p, [suiteId]: pass ? 'pass' : 'fail' }))
      addLog((pass ? '✅ ' : '❌ ') + suiteId + ': ' + data.summary.passed + '/' + data.summary.total + ' passed')
    } catch (e: any) {
      setSuiteStatus(p => ({ ...p, [suiteId]: 'fail' }))
      addLog('❌ ' + suiteId + ' error: ' + e.message)
    }
  }

  const runAll = async () => {
    setRunning(true)
    setResults({})
    setLog([])
    setSuiteStatus({})
    addLog('🚀 Starting all integration tests...')
    const res = await fetch('/api/admin/test-integrations?suite=all').then(r => r.json()).catch(e => ({ error: e.message }))
    if (res.error) { addLog('❌ Error: ' + res.error); setRunning(false); return }
    const data: SuiteResult = res
    setResults(data.results)
    // Update suite statuses
    const newStatus: Record<string, Status> = {}
    SUITES.forEach(suite => {
      const suiteTests = suite.tests.filter(t => t in data.results)
      const allPass = suiteTests.every(t => data.results[t]?.pass)
      newStatus[suite.id] = suiteTests.length === 0 ? 'idle' : allPass ? 'pass' : 'fail'
    })
    setSuiteStatus(newStatus)
    addLog('🏁 Done: ' + data.summary.passed + '/' + data.summary.total + ' passed')
    setRunning(false)
  }

  const totalPassed = Object.values(results).filter(r => r.pass).length
  const totalFailed = Object.values(results).filter(r => !r.pass).length
  const hasResults = Object.keys(results).length > 0

  const suiteColor = (s: Status) => ({
    idle: 'border-gray-200 bg-white',
    running: 'border-yellow-300 bg-yellow-50',
    pass: 'border-green-400 bg-green-50',
    fail: 'border-red-400 bg-red-50',
  }[s] ?? 'border-gray-200 bg-white')

  const resultBadge = (r?: TestResult) => {
    if (!r) return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Not run</span>
    return r.pass
      ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">✅ Pass</span>
      : <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">❌ Fail</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
        <h1 className="text-2xl font-bold mb-1">🔧 Integration Test Suite</h1>
        <p className="text-white/80 text-sm">End-to-end tests for Shippo, Stripe, and Letter Generation</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button onClick={runAll} disabled={running}
          className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
          {running ? '⏳ Running...' : '🚀 Run All Tests'}
        </button>
        {SUITES.map(s => (
          <button key={s.id} onClick={() => runSuite(s.id)} disabled={running}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-50">
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      {hasResults && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-gray-800">{totalPassed + totalFailed}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Total</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600">{totalPassed}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Passed ✅</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-red-500">{totalFailed}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Failed ❌</div>
          </div>
        </div>
      )}

      {/* Test suites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {SUITES.map(suite => {
          const status = suiteStatus[suite.id] ?? 'idle'
          return (
            <div key={suite.id} className={`rounded-xl border-2 p-5 transition-all ${suiteColor(status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-800">{suite.icon} {suite.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{suite.desc}</div>
                </div>
                {status === 'running' && <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />}
                {status === 'pass' && <span className="text-green-600 font-bold text-lg">✅</span>}
                {status === 'fail' && <span className="text-red-500 font-bold text-lg">❌</span>}
              </div>
              <div className="space-y-2">
                {suite.tests.map(testId => {
                  const r = results[testId]
                  return (
                    <div key={testId} className="bg-white/70 rounded-lg p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-gray-700">{TEST_LABELS[testId] ?? testId}</span>
                        {resultBadge(r)}
                      </div>
                      {r && (
                        <p className={`text-xs mt-1 ${r.pass ? 'text-green-700' : 'text-red-600'}`}>{r.msg}</p>
                      )}
                      {r?.data && (
                        <details className="mt-1">
                          <summary className="text-xs text-blue-500 cursor-pointer">Details</summary>
                          <pre className="text-xs bg-gray-900 text-green-400 rounded p-2 mt-1 overflow-x-auto max-h-32">
                            {JSON.stringify(r.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stripe test cards box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-blue-800 mb-3">💳 Stripe Test Cards (Sandbox)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { card: '4242 4242 4242 4242', result: 'Payment succeeds', color: 'text-green-700' },
            { card: '4000 0025 0000 3155', result: '3D Secure auth required', color: 'text-yellow-700' },
            { card: '4000 0000 0000 9995', result: 'Payment declined', color: 'text-red-700' },
            { card: '4000 0000 0000 0002', result: 'Card declined (generic)', color: 'text-red-700' },
          ].map(({ card, result, color }) => (
            <div key={card} className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="font-mono font-bold text-gray-800 text-sm">{card}</div>
              <div className={`text-xs mt-0.5 ${color}`}>{result}</div>
              <div className="text-xs text-gray-400 mt-0.5">Any future date • Any 3-digit CVV • Any ZIP</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-3">
          Use these cards when testing the certified mail payment flow. They only work with test API keys (sk_test_...).
        </p>
      </div>

      {/* Shippo test info */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-orange-800 mb-2">📮 Shippo Test Mode</h3>
        <p className="text-sm text-orange-700">
          When using a <code className="bg-orange-100 px-1 rounded">shippo_test_</code> API key, all labels are created in test mode — no real postage is purchased and no mail is physically sent. Tracking numbers are real format but inactive. Switch to a live key (<code className="bg-orange-100 px-1 rounded">shippo_live_</code>) when ready to send actual letters.
        </p>
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs max-h-48 overflow-y-auto">
          {log.map((l, i) => (
            <div key={i} className={`py-0.5 ${l.includes('✅') || l.includes('🏁') ? 'text-emerald-400' : l.includes('❌') ? 'text-red-400' : 'text-gray-300'}`}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
