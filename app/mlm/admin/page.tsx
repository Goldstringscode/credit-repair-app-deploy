'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Member { id:string; userId:string; email:string; name:string; rank:string; status:string; totalEarnings:number; monthlyEarnings:number; joinDate:string; subscriptionTier?:string; subscriptionStatus?:string; canCreateTeam?:boolean }
interface Team { id:string; name:string; teamCode:string; status:string; plan:string; createdAt:string; memberCount:number; activeMembers:number; channelCount:number; messageCount:number; totalPaid:number; totalPending:number; members:Member[]; channels:{id:string;name:string}[] }
interface Global { totalTeams:number; totalMembers:number; activeMembers:number; totalEarningsPaid:number; rankBreakdown:Record<string,number>; subscriptionBreakdown?:Record<string,number>; canCreateTeamCount?:number }

const RANK_COLORS:Record<string,string> = { associate:'bg-gray-100 text-gray-700', consultant:'bg-blue-100 text-blue-700', manager:'bg-green-100 text-green-700', director:'bg-purple-100 text-purple-700', executive:'bg-orange-100 text-orange-700', presidential:'bg-yellow-100 text-yellow-800' }

export default function AdminMLMPage() {
  const router = useRouter()
  const [data, setData] = useState<{global:Global; teams:Team[]}|null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team|null>(null)
  const [activeTab, setActiveTab] = useState<'members'|'channels'|'messages'>('members')
  const [teamMessages, setTeamMessages] = useState<any[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string|null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(d => {
      if(!d?.user||d.user.role!=='admin'){ router.push('/mlm/dashboard'); return }
      loadData()
    }).catch(()=>router.push('/login'))
  }, [])

  const loadData = () => {
    fetch('/api/mlm/admin/overview').then(r=>r.json()).then(d => {
      if(d.success){ setData(d); if(d.teams[0]) setSelectedTeam(d.teams[0]) }
      setLoading(false)
    })
  }

  const loadMessages = (channelId:string) => {
    setSelectedChannel(channelId)
    fetch('/api/mlm/communications/messages?channel_id='+channelId).then(r=>r.json()).then(d=>{
      if(d.success) setTeamMessages(d.data)
    })
  }

  const deleteMessage = async (msgId:string) => {
    if(!confirm('Delete this message?')) return
    await fetch('/api/mlm/communications/messages?id='+msgId,{method:'DELETE'})
    setTeamMessages(prev=>prev.filter(m=>m.id!==msgId))
  }

  const filteredMembers = selectedTeam?.members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.rank.toLowerCase().includes(search.toLowerCase())
  ) || []

  if(loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"/></div>
  if(!data) return <div className="p-8 text-center text-red-500">Failed to load admin data</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-3xl">👑</span> MLM Admin Panel
        </h1>
        <p className="text-gray-500 mt-1">Full visibility into all teams, members, channels and activity</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {label:'Total Teams', value:data.global.totalTeams, icon:'🏢', color:'bg-blue-50 border-blue-200'},
          {label:'Total Members', value:data.global.totalMembers, icon:'👥', color:'bg-green-50 border-green-200'},
          {label:'Active Members', value:data.global.activeMembers, icon:'✅', color:'bg-purple-50 border-purple-200'},
          {label:'Total Paid Out', value:'$'+data.global.totalEarningsPaid.toLocaleString(), icon:'💰', color:'bg-yellow-50 border-yellow-200'},
        ].map(s=>(
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rank Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <h2 className="font-semibold text-gray-900 mb-3">Members by Rank</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.global.rankBreakdown).sort((a,b)=>b[1]-a[1]).map(([rank,count])=>(
            <div key={rank} className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${RANK_COLORS[rank]||'bg-gray-100 text-gray-700'}`}>
              <span className="capitalize">{rank}</span>
              <span className="font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Subscription Breakdown</h2>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            {data.global.canCreateTeamCount||0} can create teams
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.global.subscriptionBreakdown||{}).sort((a:any,b:any)=>b[1]-a[1]).map(([tier,count])=>(
            <div key={tier} className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
              tier==='premium'?'bg-yellow-100 text-yellow-800':
              tier==='enterprise'?'bg-green-100 text-green-700':
              tier==='professional'?'bg-purple-100 text-purple-700':
              tier==='basic'?'bg-blue-100 text-blue-700':
              'bg-gray-100 text-gray-500'
            }`}>
              <span className="capitalize">{tier}</span>
              <span className="font-bold">{count as number}</span>
              {(tier==='premium'||tier==='enterprise')&&<span title="Can create teams">🏢</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">🏢 = Can create their own team (Premium/Enterprise only)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900 text-sm">Teams ({data.teams.length})</div>
            <div className="divide-y divide-gray-50">
              {data.teams.map(team=>(
                <div key={team.id} onClick={()=>{setSelectedTeam(team);setActiveTab('members');setSearch('');setSelectedChannel(null)}}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTeam?.id===team.id?'bg-blue-50 border-l-2 border-blue-500':''}`}>
                  <div className="font-medium text-gray-900 text-sm">{team.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{team.teamCode} · {team.memberCount} members</div>
                  <div className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded ${team.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{team.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Detail */}
        <div className="lg:col-span-3">
          {selectedTeam ? (
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Team Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedTeam.name}</h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>Code: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{selectedTeam.teamCode}</code></span>
                      <span>Plan: {selectedTeam.plan}</span>
                      <span>Created: {new Date(selectedTeam.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 text-center">
                    {[
                      {label:'Members',val:selectedTeam.memberCount},
                      {label:'Active',val:selectedTeam.activeMembers},
                      {label:'Channels',val:selectedTeam.channelCount},
                      {label:'Paid Out',val:'$'+selectedTeam.totalPaid.toLocaleString()},
                    ].map(s=>(
                      <div key={s.label} className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="text-lg font-bold text-gray-900">{s.val}</div>
                        <div className="text-xs text-gray-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {(['members','channels','messages'] as const).map(tab=>(
                  <button key={tab} onClick={()=>setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${activeTab===tab?'border-b-2 border-blue-600 text-blue-600':'text-gray-500 hover:text-gray-700'}`}>
                    {tab}
                    {tab==='members'&&<span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{selectedTeam.memberCount}</span>}
                    {tab==='channels'&&<span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">{selectedTeam.channelCount}</span>}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab==='members'&&(
                  <div>
                    <input value={search} onChange={e=>setSearch(e.target.value)}
                      placeholder="Search by name, email or rank..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:border-blue-500"/>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredMembers.length===0
                        ?<div className="text-center text-gray-400 py-6 text-sm">No members found</div>
                        :filteredMembers.map(m=>(
                          <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                {m.name?.charAt(0)?.toUpperCase()||'?'}
                              </div>
                              <div>
                                <div className="font-medium text-sm text-gray-900">{m.name}</div>
                                <div className="text-xs text-gray-500">{m.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium text-gray-900">${m.totalEarnings.toLocaleString()}</div>
                                <div className="text-xs text-gray-400">lifetime</div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${RANK_COLORS[m.rank]||'bg-gray-100 text-gray-700'}`}>{m.rank}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                m.subscriptionTier==='premium'?'bg-yellow-100 text-yellow-800':
                                m.subscriptionTier==='enterprise'?'bg-green-100 text-green-700':
                                m.subscriptionTier==='professional'?'bg-purple-100 text-purple-700':
                                m.subscriptionTier==='basic'?'bg-blue-100 text-blue-700':
                                'bg-gray-100 text-gray-400'
                              }`}>{m.subscriptionTier||'free'}{m.canCreateTeam?' 🏢':''}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${m.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{m.status}</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {activeTab==='channels'&&(
                  <div>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTeam.channels.length===0
                        ?<div className="col-span-2 text-center text-gray-400 py-6 text-sm">No channels</div>
                        :selectedTeam.channels.map(ch=>(
                          <button key={ch.id} onClick={()=>{setActiveTab('messages');loadMessages(ch.id)}}
                            className="p-3 bg-gray-50 rounded-lg text-left hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-colors">
                            <div className="font-medium text-sm text-gray-900"># {ch.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">Click to view messages →</div>
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}

                {activeTab==='messages'&&(
                  <div>
                    {!selectedChannel ? (
                      <div>
                        <p className="text-sm text-gray-500 mb-3">Select a channel to view messages:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedTeam.channels.map(ch=>(
                            <button key={ch.id} onClick={()=>loadMessages(ch.id)}
                              className={`p-3 rounded-lg text-left border transition-colors ${selectedChannel===ch.id?'bg-blue-50 border-blue-300':'bg-gray-50 border-transparent hover:bg-blue-50'}`}>
                              <div className="font-medium text-sm"># {ch.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <button onClick={()=>{setSelectedChannel(null);setTeamMessages([])}} className="text-sm text-blue-600 hover:underline">← Back to channels</button>
                          <span className="text-sm text-gray-500"># {selectedTeam.channels.find(c=>c.id===selectedChannel)?.name}</span>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {teamMessages.length===0
                            ?<div className="text-center text-gray-400 py-6 text-sm">No messages in this channel</div>
                            :teamMessages.map(m=>(
                              <div key={m.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg group">
                                <div className="flex items-start gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                    {m.sender_name?.charAt(0)?.toUpperCase()||'?'}
                                  </div>
                                  <div>
                                    <div className="flex items-baseline gap-2">
                                      <span className="font-medium text-xs text-gray-900">{m.sender_name}</span>
                                      <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-0.5">{m.content}</p>
                                  </div>
                                </div>
                                <button onClick={()=>deleteMessage(m.id)} className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 flex-shrink-0 ml-2">Delete</button>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center h-64 text-gray-400">
              Select a team to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}