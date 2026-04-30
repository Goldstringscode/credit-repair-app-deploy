'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_CONFIG = {
  admin:         { label: 'Admin',          color: 'bg-red-100 text-red-800',     dot: 'bg-red-500' },
  both:          { label: 'CR + MLM',       color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  mlm:           { label: 'MLM Only',       color: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500' },
  credit_repair: { label: 'Credit Repair',  color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

const SUB_CONFIG: Record<string,string> = {
  premium: 'bg-yellow-100 text-yellow-800',
  enterprise: 'bg-green-100 text-green-700',
  professional: 'bg-purple-100 text-purple-700',
  basic: 'bg-blue-100 text-blue-700',
  free: 'bg-gray-100 text-gray-500',
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(d => {
      if(!d?.user || d.user.role !== 'admin') { router.push('/'); return }
      loadUsers()
    })
  }, [])

  const loadUsers = () => {
    setLoading(true)
    fetch('/api/admin/users').then(r=>r.json()).then(d => {
      if(d.success) { setUsers(d.users); setStats(d.stats) }
      setLoading(false)
    })
  }

  const filtered = users.filter(u => {
    const matchType = filter === 'all' || u.userType === filter
    const matchSearch = !search || 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.mlm?.mlmCode?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  if(loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
        <p className="text-gray-500 text-sm mt-1">Single source of truth — every registered user</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'border-gray-200' },
            { label: 'Credit Repair', value: stats.creditRepairOnly, color: 'border-green-300' },
            { label: 'MLM Only', value: stats.mlmOnly, color: 'border-blue-300' },
            { label: 'CR + MLM', value: stats.both, color: 'border-purple-300' },
            { label: 'Active Subs', value: stats.activeSubscriptions, color: 'border-yellow-300' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl border-2 ${s.color} p-4 text-center`}>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search name, email or MLM code..."
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-1">
          {['all','credit_repair','mlm','both','admin'].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${filter===f?'bg-gray-900 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f==='all'?'All':f==='credit_repair'?'Credit Repair':f==='both'?'CR + MLM':f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User','Type','Subscription','MLM','Team','Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No users found</td></tr>
              ) : filtered.map(u => {
                const tc = TYPE_CONFIG[u.userType as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.credit_repair
                return (
                  <tr key={u.id} onClick={()=>setSelected(u===selected?null:u)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()||'?'}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`}/>
                        {tc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${SUB_CONFIG[u.subscriptionTier]||'bg-gray-100 text-gray-500'}`}>
                          {u.subscriptionTier}
                        </span>
                        <span className={`text-xs ${u.subscriptionStatus==='active'?'text-green-600':'text-gray-400'}`}>
                          {u.subscriptionStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.mlm ? (
                        <div>
                          <div className="text-xs font-mono text-gray-700">{u.mlm.mlmCode}</div>
                          <div className="text-xs text-gray-400 capitalize">{u.mlm.rank}</div>
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {u.mlm?.teamName
                        ? <div>
                            <div className="text-xs font-medium text-gray-700">{u.mlm.teamName}</div>
                            <div className="text-xs text-gray-400">{u.mlm.teamCode}</div>
                          </div>
                        : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {selected.name?.charAt(0)?.toUpperCase()||'?'}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">User Type</div>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_CONFIG[selected.userType as keyof typeof TYPE_CONFIG]?.color||''}`}>
                    {TYPE_CONFIG[selected.userType as keyof typeof TYPE_CONFIG]?.label||selected.userType}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Role</div>
                  <div className="text-sm font-medium capitalize">{selected.role}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-2">Credit Repair Subscription</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${SUB_CONFIG[selected.subscriptionTier]||'bg-gray-100 text-gray-500'}`}>{selected.subscriptionTier}</span>
                  <span className={`text-xs ${selected.subscriptionStatus==='active'?'text-green-600 font-medium':'text-gray-400'}`}>{selected.subscriptionStatus}</span>
                </div>
              </div>

              {selected.mlm && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-semibold mb-2">MLM Account</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500 text-xs">Code: </span><span className="font-mono font-medium">{selected.mlm.mlmCode}</span></div>
                    <div><span className="text-gray-500 text-xs">Rank: </span><span className="capitalize">{selected.mlm.rank}</span></div>
                    <div><span className="text-gray-500 text-xs">Team: </span><span>{selected.mlm.teamName||'—'}</span></div>
                    <div><span className="text-gray-500 text-xs">Status: </span><span className="capitalize">{selected.mlm.status}</span></div>
                    <div><span className="text-gray-500 text-xs">Monthly: </span><span className="font-medium">${selected.mlm.monthlyEarnings.toLocaleString()}</span></div>
                    <div><span className="text-gray-500 text-xs">Lifetime: </span><span className="font-medium">${selected.mlm.totalEarnings.toLocaleString()}</span></div>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-400 text-right">
                Joined {new Date(selected.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}