'use client'
import { useState, useEffect } from 'react'

const TESTS = [
  { id: 'welcome', name: 'Welcome Email', desc: 'New CR user registers', icon: '👋' },
  { id: 'password_reset', name: 'Password Reset', desc: 'User requests password reset', icon: '🔑' },
  { id: 'mlm_welcome', name: 'MLM Welcome', desc: 'New MLM partner registers', icon: '🏆' },
  { id: 'team_join', name: 'Team Join', desc: 'Member joins a team', icon: '🤝' },
  { id: 'new_team_member', name: 'New Team Member', desc: 'Alert to sponsor when downline joins', icon: '🎉' },
  { id: 'team_creation', name: 'Team Creation', desc: 'User creates a new MLM team', icon: '🚀' },
  { id: 'commission_earned', name: 'Commission Earned', desc: 'Commission calculated', icon: '💰' },
  { id: 'rank_advancement', name: 'Rank Advancement', desc: 'User advances to higher rank', icon: '⭐' },
  { id: 'payout_processed', name: 'Payout Processed', desc: 'Payout request approved', icon: '✅' },
  { id: 'invitation', name: 'Team Invitation', desc: 'Member invites someone', icon: '✉️' },
  { id: 'dispute_letter', name: 'Dispute Letter', desc: 'AI generates a dispute letter', icon: '📝' },
  { id: 'score_improvement', name: 'Score Improvement', desc: 'Credit score improves', icon: '📈' },
  { id: 'payment_success', name: 'Payment Confirmed', desc: 'Successful Stripe payment', icon: '💳' },
  { id: 'training_complete', name: 'Training Complete', desc: 'User completes a course', icon: '🎓' },
  { id: 'task_complete', name: 'Task Complete', desc: 'Onboarding task done', icon: '☑️' },
]

type Status = 'idle' | 'running' | 'success' | 'error'
type TestState = { status: Status; id?: string; error?: string }

export default function EmailTestPage() {
  const [state, setState] = useState<Record<string, TestState>>(
    Object.fromEntries(TESTS.map(t => [t.id, { status: 'idle' }]))
  )
  const [toEmail, setToEmail] = useState('')
  const [log, setLog] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetch('/api/email-test')
      .then(r => r.json())
      .then(d => setToEmail(d.to || ''))
      .catch(() => {})
  }, [])

  const addLog = (msg: string) => setLog(prev => [new Date().toLocaleTimeString() + ' — ' + msg, ...prev])

  const runTest = async (id: string) => {
    setState(prev => ({ ...prev, [id]: { status: 'running' } }))
    addLog('Sending ' + id + '...')
    try {
      const r = await fetch('/api/email-test?type=' + id)
      const d = await r.json()
      setState(prev => ({ ...prev, [id]: { status: d.success ? 'success' : 'error', id: d.id, error: d.error } }))
      addLog((d.success ? '✅ OK ' : '❌ FAIL ') + id + (d.success ? ' → id: ' + d.id : ' → ' + d.error))
    } catch (e: any) {
      setState(prev => ({ ...prev, [id]: { status: 'error', error: e.message } }))
      addLog('❌ FAIL ' + id + ' → ' + e.message)
    }
  }

  const runAll = async () => {
    setRunning(true)
    setProgress(0)
    addLog('🚀 Starting all 15 tests...')
    for (let i = 0; i < TESTS.length; i++) {
      await runTest(TESTS[i].id)
      setProgress(Math.round(((i + 1) / TESTS.length) * 100))
      await new Promise(r => setTimeout(r, 350))
    }
    addLog('🏁 All tests complete! Check your inbox.')
    setRunning(false)
  }

  const clearAll = () => {
    setState(Object.fromEntries(TESTS.map(t => [t.id, { status: 'idle' }])))
    setLog([])
    setProgress(0)
  }

  const passed = TESTS.filter(t => state[t.id]?.status === 'success').length
  const failed = TESTS.filter(t => state[t.id]?.status === 'error').length
  const done = passed + failed

  const badgeStyle = (status: Status) => ({
    idle: 'bg-gray-100 text-gray-500',
    running: 'bg-yellow-100 text-yellow-700 animate-pulse',
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  }[status])

  const badgeText = (status: Status) => ({
    idle: 'Idle',
    running: '⏳ Sending...',
    success: '✅ Sent',
    error: '❌ Failed',
  }[status])

  const cardBorder = (status: Status) => ({
    idle: 'border-gray-100',
    running: 'border-yellow-300',
    success: 'border-green-400',
    error: 'border-red-400',
  }[status])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
        <h1 className="text-2xl font-bold mb-1">📧 Email Test Suite</h1>
        <p className="text-white/80 text-sm">Test all 15 email templates — Credit Repair AI / Resend</p>
        {toEmail && <p className="text-white/70 text-xs mt-2">📬 Sending to: {toEmail}</p>}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <button
          onClick={runAll} disabled={running}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
        >
          🚀 Run All Tests
        </button>
        <button
          onClick={clearAll} disabled={running}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-blue-300 text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-60"
        >
          🔄 Clear
        </button>
      </div>

      {/* Progress bar */}
      {running && (
        <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: progress + '%', background: 'linear-gradient(90deg, #667eea, #764ba2)' }}
          />
        </div>
      )}

      {/* Summary */}
      {done > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-gray-800">{TESTS.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Total</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600">{passed}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Passed ✅</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-red-500">{failed}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">Failed ❌</div>
          </div>
        </div>
      )}

      {/* Test cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {TESTS.map(t => {
          const s = state[t.id]
          return (
            <div key={t.id} className={`bg-white rounded-xl p-5 border-2 shadow-sm transition-all ${cardBorder(s.status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-800 text-sm">{t.icon} {t.name}</div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeStyle(s.status)}`}>
                  {badgeText(s.status)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{t.desc}</p>
              {s.status === 'success' && s.id && (
                <div className="text-xs bg-green-50 text-green-700 rounded-lg px-3 py-2 mb-3 font-mono break-all">
                  ✅ Resend ID: {s.id}
                </div>
              )}
              {s.status === 'error' && s.error && (
                <div className="text-xs bg-red-50 text-red-600 rounded-lg px-3 py-2 mb-3 font-mono break-all">
                  ❌ {s.error}
                </div>
              )}
              <button
                onClick={() => runTest(t.id)}
                disabled={s.status === 'running' || running}
                className="w-full py-2 text-sm font-semibold rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {s.status === 'success' ? 'Re-send' : 'Send Test Email'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs max-h-48 overflow-y-auto">
          {log.map((l, i) => (
            <div key={i} className={`py-0.5 ${l.includes('OK') || l.includes('complete') ? 'text-emerald-400' : l.includes('FAIL') ? 'text-red-400' : 'text-gray-300'}`}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
