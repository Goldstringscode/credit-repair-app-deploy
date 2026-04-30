'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Channel { id:string; name:string; description:string|null; team_id:string; can_moderate:boolean }
interface Message { id:string; channel_id:string; sender_id:string; sender_name:string; content:string; created_at:string; can_delete:boolean }
interface TeamCtx { teamId:string|null; teamCode:string|null; isAdmin:boolean; canModerate:boolean }

export default function CommunicationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string|null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [teamCtx, setTeamCtx] = useState<TeamCtx|null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [status, setStatus] = useState<'connecting'|'connected'|'polling'>('connecting')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const realtimeRef = useRef<any>(null)
  const pollRef = useRef<any>(null)
  const mountedChannelRef = useRef<string|null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(d => {
      if(!d?.user){ router.push('/login'); return }
      setUser(d.user)
    }).catch(() => router.push('/login'))
  }, [])

  useEffect(() => {
    if(!user) return
    fetch('/api/mlm/communications/channels').then(r=>r.json()).then(d => {
      if(d.success) {
        setChannels(d.data)
        setTeamCtx(d.teamContext)
        if(d.data.length > 0) setActiveChannelId(d.data[0].id)
      }
    })
  }, [user])

  useEffect(() => {
    if(!activeChannelId) return
    const channelId = activeChannelId
    mountedChannelRef.current = channelId

    // Tear down previous
    if(realtimeRef.current) { supabase.removeChannel(realtimeRef.current); realtimeRef.current = null }
    if(pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }

    setMessages([])
    setStatus('connecting')

    const fetchMsgs = () => {
      if(mountedChannelRef.current !== channelId) return
      fetch('/api/mlm/communications/messages?channel_id='+channelId)
        .then(r=>r.json()).then(d => {
          if(mountedChannelRef.current !== channelId) return
          if(d.success) {
            setMessages(d.data)
            setTimeout(() => messagesEndRef.current?.scrollIntoView({behavior:'smooth'}), 80)
          }
        })
    }

    fetchMsgs()

    const rt = supabase
      .channel('ch-'+channelId+'-'+Date.now())
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'mlm_messages',filter:'channel_id=eq.'+channelId},
        p => {
          if(mountedChannelRef.current !== channelId) return
          const m = p.new as any
          setMessages(prev => prev.some(x=>x.id===m.id)?prev:[...prev,m])
          setTimeout(() => messagesEndRef.current?.scrollIntoView({behavior:'smooth'}), 80)
        })
      .on('postgres_changes',{event:'DELETE',schema:'public',table:'mlm_messages',filter:'channel_id=eq.'+channelId},
        p => {
          if(mountedChannelRef.current !== channelId) return
          setMessages(prev=>prev.filter(x=>x.id!==(p.old as any).id))
        })
      .subscribe(s => {
        if(mountedChannelRef.current !== channelId) return
        if(s==='SUBSCRIBED') {
          setStatus('connected')
          if(pollRef.current) { clearInterval(pollRef.current); pollRef.current=null }
        } else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT') {
          setStatus('polling')
          if(!pollRef.current) pollRef.current = setInterval(fetchMsgs, 4000)
        }
      })
    realtimeRef.current = rt

    return () => {
      mountedChannelRef.current = null
      if(realtimeRef.current) { supabase.removeChannel(realtimeRef.current); realtimeRef.current=null }
      if(pollRef.current) { clearInterval(pollRef.current); pollRef.current=null }
    }
  }, [activeChannelId])

  const sendMessage = async () => {
    if(!input.trim()||!activeChannelId||sending) return
    const text=input.trim(); setInput(''); setSending(true)
    try {
      await fetch('/api/mlm/communications/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({channel_id:activeChannelId,content:text})
      })
    } finally { setSending(false) }
  }

  const createChannel = async () => {
    if(!newName.trim()) return
    const r = await fetch('/api/mlm/communications/channels',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:newName.trim(),description:newDesc.trim()||null})
    }).then(r=>r.json())
    if(r.success) {
      setNewName('');setNewDesc('');setShowCreate(false)
      fetch('/api/mlm/communications/channels').then(r=>r.json()).then(d=>{if(d.success)setChannels(d.data)})
    } else alert(r.error||'Failed')
  }

  const deleteChannel = async (ch:Channel, e:React.MouseEvent) => {
    e.stopPropagation()
    if(!confirm('Delete #'+ch.name+'? This hides it for everyone.')) return
    await fetch('/api/mlm/communications/channels?id='+ch.id,{method:'DELETE'})
    if(activeChannelId===ch.id) setActiveChannelId(null)
    fetch('/api/mlm/communications/channels').then(r=>r.json()).then(d=>{
      if(d.success){
        setChannels(d.data)
        if(activeChannelId===ch.id&&d.data[0]) setActiveChannelId(d.data[0].id)
      }
    })
  }

  const deleteMessage = async (m:Message) => {
    if(!confirm('Delete this message?')) return
    await fetch('/api/mlm/communications/messages?id='+m.id,{method:'DELETE'})
    setMessages(prev=>prev.filter(x=>x.id!==m.id))
  }

  const activeChannel = channels.find(c=>c.id===activeChannelId)||null

  if(!user) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <aside className="w-56 bg-[#1a1d2e] text-gray-300 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <p className="font-semibold text-white text-sm">MLM Communication</p>
          <p className="text-xs text-gray-400 mt-0.5">{teamCtx?.isAdmin?'👑 Admin':'Team: '+(teamCtx?.teamCode||'...')}</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Channels</span>
            {teamCtx?.canModerate&&<button onClick={()=>setShowCreate(true)} className="text-blue-400 hover:text-blue-300 text-lg leading-none">+</button>}
          </div>
          {channels.map(ch=>(
            <div key={ch.id} onClick={()=>setActiveChannelId(ch.id)}
              className={`group flex items-center justify-between px-3 py-1.5 mx-1 rounded cursor-pointer ${activeChannelId===ch.id?'bg-white/15 text-white':'hover:bg-white/5'}`}>
              <span className="text-sm truncate"># {ch.name}</span>
              {ch.can_moderate&&<button onClick={e=>deleteChannel(ch,e)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-sm ml-1">×</button>}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-white min-w-0">
        {activeChannel ? (
          <>
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900"># {activeChannel.name}</span>
                {activeChannel.description&&<span className="text-sm text-gray-400">{activeChannel.description}</span>}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${status==='connected'?'bg-green-100 text-green-700':status==='polling'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-500'}`}>{status}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-0.5">
              {messages.length===0
                ?<div className="text-center text-gray-400 mt-20 text-sm">No messages yet — say hello! 👋</div>
                :messages.map(m=>(
                  <div key={m.id} className="group flex items-start gap-3 hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                      {m.sender_name?.charAt(0)?.toUpperCase()||'?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-gray-900">{m.sender_name}</span>
                        <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm text-gray-700 break-words leading-relaxed">{m.content}</p>
                    </div>
                    {m.can_delete&&<button onClick={()=>deleteMessage(m)} className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 flex-shrink-0 mt-1">Delete</button>}
                  </div>
                ))
              }
              <div ref={messagesEndRef}/>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-2">
                <input value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}}}
                  placeholder={'Message #'+activeChannel.name}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 text-sm bg-gray-50"/>
                <button onClick={sendMessage} disabled={sending||!input.trim()}
                  className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 font-medium">Send</button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            {channels.length===0?'No channels yet':'Select a channel'}
          </div>
        )}
      </div>

      {showCreate&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold mb-4">Create Channel</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Name</label>
                <input value={newName} onChange={e=>setNewName(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&createChannel()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. team-wins"/>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Description (optional)</label>
                <input value={newDesc} onChange={e=>setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Purpose of this channel"/>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={createChannel} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Create</button>
              <button onClick={()=>{setShowCreate(false);setNewName('');setNewDesc('')}} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}