'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Channel {
  id: string; name: string; description: string|null; team_id: string
  created_by: string|null; unread_count: number; can_moderate: boolean; is_active: boolean
}
interface Message {
  id: string; channel_id: string; sender_id: string; sender_name: string
  content: string; attachment_url?: string|null; created_at: string; can_delete: boolean
}
interface TeamCtx { teamId: string|null; teamCode: string|null; isAdmin: boolean; canModerate: boolean }

export default function CommunicationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel|null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [teamCtx, setTeamCtx] = useState<TeamCtx|null>(null)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDesc, setNewChannelDesc] = useState('')
  const [status, setStatus] = useState<'connecting'|'connected'|'polling'>('connecting')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const realtimeChannelRef = useRef<any>(null)

  // Initial load: user + channels
  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(d => {
      if(!d?.user){ router.push('/login'); return }
      setUser(d.user)
      loadChannels()
    }).catch(() => router.push('/login'))
  }, [])

  const loadChannels = async () => {
    const r = await fetch('/api/mlm/communications/channels').then(r=>r.json())
    if (r.success) {
      setChannels(r.data)
      setTeamCtx(r.teamContext)
      if(r.data.length > 0 && !activeChannel) setActiveChannel(r.data[0])
    }
  }

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannel) return
    loadMessages(activeChannel.id)
    setupRealtime(activeChannel.id)
    return () => { if(realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current) }
  }, [activeChannel?.id])

  const loadMessages = async (channelId: string) => {
    const r = await fetch('/api/mlm/communications/messages?channel_id=' + channelId).then(r=>r.json())
    if (r.success) {
      setMessages(r.data)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({behavior:'smooth'}), 100)
    }
  }

  const setupRealtime = (channelId: string) => {
    if(realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current)
    setStatus('connecting')
    const ch = supabase
      .channel('msgs-' + channelId)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'mlm_messages', filter:'channel_id=eq.'+channelId },
        (payload) => {
          const newMsg = payload.new as any
          setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, {...newMsg, can_delete: teamCtx?.isAdmin || teamCtx?.canModerate || newMsg.sender_id === user?.id}])
          setTimeout(() => messagesEndRef.current?.scrollIntoView({behavior:'smooth'}), 100)
        })
      .on('postgres_changes', { event:'DELETE', schema:'public', table:'mlm_messages', filter:'channel_id=eq.'+channelId },
        (payload) => { setMessages(prev => prev.filter(m => m.id !== (payload.old as any).id)) })
      .subscribe(s => setStatus(s === 'SUBSCRIBED' ? 'connected' : 'polling'))
    realtimeChannelRef.current = ch

    // Polling fallback every 3s
    const pollId = setInterval(() => { if(status !== 'connected') loadMessages(channelId) }, 3000)
    return () => clearInterval(pollId)
  }

  const sendMessage = async () => {
    if(!input.trim() || !activeChannel) return
    const text = input
    setInput('')
    await fetch('/api/mlm/communications/messages', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ channel_id: activeChannel.id, content: text })
    })
  }

  const createChannel = async () => {
    if(!newChannelName.trim()) return
    const r = await fetch('/api/mlm/communications/channels', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: newChannelName, description: newChannelDesc })
    }).then(r=>r.json())
    if(r.success) {
      setNewChannelName(''); setNewChannelDesc(''); setShowCreateChannel(false)
      loadChannels()
    } else {
      alert(r.error || 'Failed to create channel')
    }
  }

  const deleteChannel = async (ch: Channel) => {
    if(!confirm('Delete channel #' + ch.name + '? This will hide it for everyone.')) return
    await fetch('/api/mlm/communications/channels?id=' + ch.id, { method: 'DELETE' })
    if(activeChannel?.id === ch.id) setActiveChannel(null)
    loadChannels()
  }

  const deleteMessage = async (m: Message) => {
    if(!confirm('Delete this message?')) return
    await fetch('/api/mlm/communications/messages?id=' + m.id, { method: 'DELETE' })
    setMessages(prev => prev.filter(x => x.id !== m.id))
  }

  // Group channels by team_id (for admin view across teams)
  const channelsByTeam = channels.reduce((acc, c) => {
    if(!acc[c.team_id]) acc[c.team_id] = []
    acc[c.team_id].push(c)
    return acc
  }, {} as Record<string, Channel[]>)

  if(!user) return <div className="p-8 text-center text-gray-500">Loading...</div>

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">MLM Communication</h2>
          <p className="text-xs text-gray-500 mt-0.5">{teamCtx?.isAdmin ? 'Admin (all teams)' : 'Team: ' + (teamCtx?.teamCode || '...')}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Channels</span>
            {teamCtx?.canModerate && (
              <button onClick={()=>setShowCreateChannel(true)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ New</button>
            )}
          </div>

          {teamCtx?.isAdmin
            ? Object.entries(channelsByTeam).map(([tid, chs]) => (
                <div key={tid} className="mb-3">
                  <div className="px-2 text-xs font-medium text-gray-400 mb-1">Team {(chs[0] as any).team_code || tid.substring(0,8)}</div>
                  {chs.map(c => <ChannelButton key={c.id} ch={c} active={activeChannel?.id===c.id} onClick={()=>setActiveChannel(c)} onDelete={teamCtx.canModerate ? ()=>deleteChannel(c):null}/>)}
                </div>
              ))
            : channels.map(c => <ChannelButton key={c.id} ch={c} active={activeChannel?.id===c.id} onClick={()=>setActiveChannel(c)} onDelete={teamCtx?.canModerate ? ()=>deleteChannel(c):null}/>)
          }
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col">
        {activeChannel ? (
          <>
            <header className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-gray-900"># {activeChannel.name}</h1>
                  {activeChannel.description && <span className="text-sm text-gray-500">{activeChannel.description}</span>}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${status==='connected'?'bg-green-100 text-green-700':status==='polling'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-500'}`}>
                {status}
              </span>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {messages.length === 0
                ? <div className="text-center text-gray-400 py-8">No messages yet. Be the first to say hi 👋</div>
                : messages.map(m => (
                    <div key={m.id} className="group flex items-start gap-3 hover:bg-white rounded-lg p-2 -m-2 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {m.sender_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm text-gray-900">{m.sender_name}</span>
                          <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="text-sm text-gray-700 mt-0.5 break-words">{m.content}</div>
                      </div>
                      {m.can_delete && (
                        <button onClick={()=>deleteMessage(m)} className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 transition-opacity">Delete</button>
                      )}
                    </div>
                  ))
              }
              <div ref={messagesEndRef}/>
            </div>

            <div className="px-4 py-3 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMessage())}
                  placeholder={'Message #' + activeChannel.name}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                />
                <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Send</button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            {channels.length === 0 ? 'No channels yet' : 'Select a channel'}
          </div>
        )}
      </main>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Create Channel</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Channel name</label>
                <input value={newChannelName} onChange={e=>setNewChannelName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="e.g. team-wins"/>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description (optional)</label>
                <input value={newChannelDesc} onChange={e=>setNewChannelDesc(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="What's this channel for?"/>
              </div>
              <div className="flex gap-2 pt-3">
                <button onClick={createChannel} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
                <button onClick={()=>setShowCreateChannel(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ChannelButton({ch, active, onClick, onDelete}: {ch:Channel; active:boolean; onClick:()=>void; onDelete:(()=>void)|null}) {
  return (
    <div className={`group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors ${active?'bg-blue-50 text-blue-700':'hover:bg-gray-50 text-gray-700'}`} onClick={onClick}>
      <span className="text-sm truncate"># {ch.name}</span>
      {onDelete && (
        <button onClick={(e)=>{e.stopPropagation(); onDelete()}} className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700">×</button>
      )}
    </div>
  )
}
