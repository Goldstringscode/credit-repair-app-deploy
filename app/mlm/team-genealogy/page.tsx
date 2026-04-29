'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TreeNode {
  userId: string; mlmId: string; name: string; email: string; rank: string
  status: string; totalEarnings: number; monthlyEarnings: number
  joinedAt: string; mlmCode: string; children: TreeNode[]; depth: number; teamSize?: number
}

interface Stats { total: number; active: number; direct: number }

const RANK_COLORS: Record<string,string> = {
  associate:'border-gray-300 bg-gray-50', consultant:'border-blue-300 bg-blue-50',
  manager:'border-green-300 bg-green-50', director:'border-purple-300 bg-purple-50',
  executive:'border-orange-300 bg-orange-50', presidential:'border-yellow-400 bg-yellow-50'
}
const RANK_BADGES: Record<string,string> = {
  associate:'bg-gray-100 text-gray-700', consultant:'bg-blue-100 text-blue-700',
  manager:'bg-green-100 text-green-700', director:'bg-purple-100 text-purple-700',
  executive:'bg-orange-100 text-orange-700', presidential:'bg-yellow-100 text-yellow-800'
}

function TreeNodeCard({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0
  const rankColor = RANK_COLORS[node.rank] || RANK_COLORS.associate
  const rankBadge = RANK_BADGES[node.rank] || RANK_BADGES.associate

  return (
    <div className="relative">
      <div className={`border-2 rounded-xl p-4 mb-2 ${rankColor} transition-all hover:shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-current flex items-center justify-center font-bold text-lg shadow-sm">
              {node.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{node.name}</div>
              <div className="text-xs text-gray-500">{node.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">${Number(node.monthlyEarnings||0).toLocaleString()}/mo</div>
              <div className="text-xs text-gray-500">Joined {new Date(node.joinedAt).toLocaleDateString()}</div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${rankBadge}`}>{node.rank}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${node.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{node.status}</span>
            {hasChildren && (
              <button onClick={()=>setExpanded(!expanded)} className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 font-mono text-sm shadow-sm">
                {expanded ? '−' : '+'}
              </button>
            )}
          </div>
        </div>
        {hasChildren && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>👥 {node.children.length} direct</span>
            {node.teamSize !== undefined && <span>· {node.teamSize} total in team</span>}
            <span>· Code: <code className="bg-white px-1 rounded">{node.mlmCode}</code></span>
          </div>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="ml-8 pl-4 border-l-2 border-gray-200">
          {node.children.map(child => (
            <TreeNodeCard key={child.userId} node={child} depth={depth+1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TeamGenealogyPage() {
  const router = useRouter()
  const [treeData, setTreeData] = useState<TreeNode|null>(null)
  const [stats, setStats] = useState<Stats|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [view, setView] = useState<'tree'|'list'>('tree')
  const [downlines, setDownlines] = useState<any[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(data => {
      if(!data?.user) { router.push('/login'); return }
      fetch('/api/mlm/genealogy').then(r=>r.json()).then(d => {
        if(d.tree) setTreeData(d.tree)
        if(d.stats) setStats(d.stats)
        if(d.downlines) setDownlines(d.downlines)
        setLoading(false)
      }).catch(() => { setError('Failed to load team data'); setLoading(false) })
    }).catch(() => router.push('/login'))
  }, [])

  const copyInviteLink = async () => {
    const link = window.location.origin + '/signup?ref=' + treeData?.mlmCode
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if(loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"/><p className="text-gray-600">Loading your team tree...</p></div>
    </div>
  )

  if(error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Genealogy</h1>
          <p className="text-gray-500 mt-1">Your downline network — members join directly under whoever shared their referral code</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={copyInviteLink} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${copied?'bg-green-600 text-white':'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {copied ? '✓ Copied!' : '🔗 Copy Invite Link'}
          </button>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={()=>setView('tree')} className={`px-3 py-2 text-sm ${view==='tree'?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}>🌳 Tree</button>
            <button onClick={()=>setView('list')} className={`px-3 py-2 text-sm ${view==='list'?'bg-blue-600 text-white':'bg-white text-gray-600 hover:bg-gray-50'}`}>📋 List</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {label:'Direct Members', value:stats?.direct||0, icon:'👤'},
          {label:'Total Downlines', value:stats?.total||0, icon:'👥'},
          {label:'Active Members', value:stats?.active||0, icon:'✅'},
          {label:'Your MLM Code', value:treeData?.mlmCode||'—', icon:'🔑'},
        ].map(s=>(
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">How Referrals Work</h2>
        <p className="text-sm text-gray-600 mb-4">When someone uses your unique referral link to sign up, they are placed <strong>directly under you</strong> in the tree. If they then invite others, those new members go directly under them — building your team depth automatically.</p>
        <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-blue-200">
          <code className="text-sm text-blue-700 flex-1 break-all">{typeof window!=='undefined'?window.location.origin:''}/signup?ref={treeData?.mlmCode||'YOURCODE'}</code>
          <button onClick={copyInviteLink} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 whitespace-nowrap">
            {copied?'Copied!':'Copy'}
          </button>
        </div>
      </div>

      {/* Tree or List View */}
      {stats?.total === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your team is empty</h2>
          <p className="text-gray-500 mb-6">Share your invite link above to start building your downline network</p>
        </div>
      ) : view === 'tree' ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Team Tree (click + to expand)</h2>
          {treeData?.children?.map(node => (
            <TreeNodeCard key={node.userId} node={node} depth={0} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Direct Members ({downlines.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {downlines.map(m => (
              <div key={m.userId} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700 text-sm">
                    {m.name?.charAt(0)?.toUpperCase()||'?'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{m.name}</div>
                    <div className="text-sm text-gray-500">{m.email}</div>
                    {m.teamSize > 0 && <div className="text-xs text-blue-600">+{m.teamSize} in their team</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-medium">${Number(m.monthlyEarnings||0).toLocaleString()}/mo</div>
                    <div className="text-xs text-gray-400">Joined {new Date(m.joinedAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${RANK_BADGES[m.rank]||RANK_BADGES.associate}`}>{m.rank}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${m.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}