'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Member {
  userId: string; name: string; email: string; rank: string
  status: string; earnings: number; monthlyEarnings: number; joinedAt: string; mlmCode: string
}

export default function TeamGenealogyPage() {
  const router = useRouter()
  const [tree, setTree] = useState<any>(null)
  const [downlines, setDownlines] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(data => {
      if(!data?.user) { router.push('/login'); return }
      fetch('/api/mlm/genealogy').then(r=>r.json()).then(d => {
        if(d.tree) setTree(d.tree)
        if(d.downlines) setDownlines(d.downlines)
        setLoading(false)
      }).catch(() => { setError('Failed to load team data'); setLoading(false) })
    }).catch(() => router.push('/login'))
  }, [])

  const rankColors: Record<string,string> = {
    associate:'bg-gray-100 text-gray-700',consultant:'bg-blue-100 text-blue-700',
    manager:'bg-green-100 text-green-700',director:'bg-purple-100 text-purple-700',
    executive:'bg-orange-100 text-orange-700',presidential:'bg-yellow-100 text-yellow-700'
  }

  if(loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading team...</div></div>
  if(error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Genealogy</h1>
        <p className="text-gray-500 mt-1">Your downline network and team structure</p>
      </div>
      {tree && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center"><div className="text-2xl font-bold">{tree.directDownlines}</div><div className="text-sm text-gray-500">Direct Members</div></div>
            <div className="text-center"><div className="text-2xl font-bold">{tree.totalDownlines}</div><div className="text-sm text-gray-500">Total Downlines</div></div>
            <div className="text-center"><div className="text-2xl font-bold">{tree.activeDownlines}</div><div className="text-sm text-gray-500">Active Members</div></div>
            <div className="text-center"><div className="text-2xl font-bold capitalize">{tree.rank}</div><div className="text-sm text-gray-500">Your Rank</div></div>
          </div>
        </div>
      )}
      {downlines.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-xl font-semibold mb-2">No team members yet</h2>
          <p className="text-gray-500 mb-6">Share your invite code <strong>{tree?.mlmCode}</strong> to start building your team</p>
          <button onClick={()=>navigator.clipboard.writeText(window.location.origin+'/signup?ref='+tree?.mlmCode)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Copy Invite Link</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b"><h2 className="font-semibold">Team Members ({downlines.length})</h2></div>
          <div className="divide-y">
            {downlines.map(m => (
              <div key={m.userId} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">{m.name?.charAt(0)?.toUpperCase()||'?'}</div>
                  <div><div className="font-medium">{m.name}</div><div className="text-sm text-gray-500">{m.email}</div></div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${rankColors[m.rank]||rankColors.associate}`}>{m.rank}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}