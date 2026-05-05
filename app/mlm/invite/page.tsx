'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function InvitePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mlmUser, setMlmUser] = useState<any>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [error, setError] = useState('')

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    if (!user) return
    fetch('/api/mlm/users/' + user.id)
      .then(r => r.json())
      .then(d => { if (d.success) setMlmUser(d.user) })
  }, [user])

  const myCode = mlmUser?.mlmCode || mlmUser?.teamCode || ''
  const myLink = myCode ? appUrl + '/signup?ref=' + myCode : ''

  const copyCode = async () => {
    await navigator.clipboard.writeText(myCode)
    setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000)
  }
  const copyLink = async () => {
    await navigator.clipboard.writeText(myLink)
    setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000)
  }

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return
    setSending(true); setError('')
    try {
      const r = await fetch('/api/mlm/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), name: inviteName.trim() })
      }).then(r => r.json())
      if (r.success) { setSent(true); setInviteEmail(''); setInviteName('') }
      else setError(r.error || 'Failed to send invite')
    } catch { setError('Network error') }
    finally { setSending(false) }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invite Members</h1>
        <p className="text-gray-500 mt-1">Anyone who signs up with your code or link is placed directly under you in your team</p>
      </div>

      {/* Personal Code Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 mb-6 text-white">
        <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-4">Your Personal Referral Code</p>

        <div className="space-y-3">
          {/* Code */}
          <div className="bg-white/20 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-100 mb-1">Referral Code</p>
              <p className="text-3xl font-bold tracking-widest font-mono">{myCode || '...'}</p>
            </div>
            <button onClick={copyCode} disabled={!myCode}
              className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {codeCopied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Link */}
          <div className="bg-white/20 rounded-lg p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-blue-100 mb-1">Invite Link</p>
              <p className="text-sm font-mono text-blue-100 truncate">{myLink || 'Loading...'}</p>
            </div>
            <button onClick={copyLink} disabled={!myLink}
              className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 disabled:opacity-50">
              {linkCopied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div className="mt-4 bg-white/10 rounded-lg p-3">
          <p className="text-sm text-blue-100">
            <span className="font-semibold">How it works:</span> Share your code or link. When someone registers using it, they join your team directly under you — you earn commissions on their sales and their downline's sales.
          </p>
        </div>
      </div>

      {/* Send Invite by Email */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Send Invite by Email</h2>
        <p className="text-sm text-gray-500 mb-4">We'll send them your referral link with instructions</p>

        {sent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
            ✓ Invite sent! Your referral link was included in the email.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Name (optional)</label>
            <input value={inviteName} onChange={e=>setInviteName(e.target.value)}
              placeholder="Their name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Email address</label>
            <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&sendInvite()}
              placeholder="friend@example.com" type="email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"/>
          </div>
          <button onClick={sendInvite} disabled={sending||!inviteEmail.trim()}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {sending ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
      </div>

      {/* Team info */}
      {mlmUser && (
        <div className="mt-4 bg-gray-50 rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Your rank</span>
            <span className="font-medium capitalize">{mlmUser.rank?.name || 'Associate'}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-500">Direct downlines</span>
            <span className="font-medium">{mlmUser.downlineCount || 0}</span>
          </div>
        </div>
      )}
    </div>
  )
}