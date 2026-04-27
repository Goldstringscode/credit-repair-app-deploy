'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Channel { id:string; name:string; description?:string; channel_type:string; unread_count:number; member_count:number }
interface Message { id:string; channel_id:string; sender_id:string; sender_name:string; content:string; message_type:string; attachment_url?:string; attachment_name?:string; created_at:string }
type ConnStatus = 'connecting'|'connected'|'disconnected'|'error'

export default function CommunicationsPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const unsubRef = useRef<(()=>void)|null>(null)
  const pollRef = useRef<NodeJS.Timeout|null>(null)

  const [user, setUser] = useState<{id:string;name:string}|null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [active, setActive] = useState<Channel|null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [connStatus, setConnStatus] = useState<ConnStatus>('disconnected')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [uploadPct, setUploadPct] = useState<number|null>(null)
  const activeIdRef = useRef<string|null>(null)

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(data=>{
      if(!data?.user){ router.push('/login'); return }
      const u=data.user
      setUser({id:u.id,name:u.name||u.email||'Member'})
      loadChannels()
    }).catch(()=>router.push('/login'))
    return ()=>{ unsubRef.current?.(); if(pollRef.current) clearInterval(pollRef.current) }
  },[])

  const loadChannels = async()=>{
    try {
      const res=await fetch('/api/mlm/communications/channels')
      const data=await res.json()
      if(data.success&&Array.isArray(data.data)){
        setChannels(data.data)
        if(data.data.length>0) selectChannel(data.data[0])
      }
    } catch(e){ setError('Failed to load channels') }
  }

  const loadMessages = useCallback(async(channelId:string)=>{
    const res=await fetch('/api/mlm/communications/messages?channelId='+channelId+'&limit=50')
    const data=await res.json()
    if(data.success) setMessages(data.data||[])
  },[])

  const selectChannel = useCallback(async(ch:Channel)=>{
    unsubRef.current?.()
    if(pollRef.current) clearInterval(pollRef.current)
    setActive(ch); activeIdRef.current=ch.id
    setMessages([]); setLoading(true); setError(null)

    try { await loadMessages(ch.id) }
    catch { setError('Failed to load messages') }
    finally { setLoading(false) }

    // Mark as read
    fetch('/api/mlm/communication/messages/read',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({channel_id:ch.id})}).catch(()=>{})
    setChannels(prev=>prev.map(c=>c.id===ch.id?{...c,unread_count:0}:c))

    // Try Supabase Realtime subscription
    setConnStatus('connecting')
    const channel = supabaseAnon.channel('mlm-ch-'+ch.id)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'mlm_messages',filter:'channel_id=eq.'+ch.id},
        payload=>{
          setMessages(prev=>{
            if(prev.some(m=>m.id===payload.new.id)) return prev
            return [...prev, payload.new as Message]
          })
        })
      .subscribe(status=>{
        if(status==='SUBSCRIBED'){
          setConnStatus('connected')
          // Clear polling fallback when realtime works
          if(pollRef.current){ clearInterval(pollRef.current); pollRef.current=null }
        } else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){
          setConnStatus('error')
          // Fallback: poll every 3 seconds
          if(!pollRef.current){
            pollRef.current=setInterval(()=>{
              if(activeIdRef.current) loadMessages(activeIdRef.current)
            },3000)
          }
        } else {
          setConnStatus('connecting')
        }
      })

    unsubRef.current=()=>{ supabaseAnon.removeChannel(channel) }

    // Safety fallback poll after 5s if not connected
    setTimeout(()=>{
      if(connStatus!=='connected'&&!pollRef.current&&activeIdRef.current){
        pollRef.current=setInterval(()=>{
          if(activeIdRef.current) loadMessages(activeIdRef.current)
        },3000)
      }
    },5000)
  },[loadMessages])

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:'smooth'}) },[messages])

  const handleSend=async()=>{
    if(!input.trim()||!active) return
    const content=input.trim(); setInput('')
    try {
      const res=await fetch('/api/mlm/communications/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({channelId:active.id,content,messageType:'text'})
      })
      const data=await res.json()
      if(!data.success) throw new Error(data.error||'Failed')
      // Optimistically add message if realtime not working
      if(connStatus!=='connected'&&data.data){
        setMessages(prev=>prev.some(m=>m.id===data.data.id)?prev:[...prev,data.data])
      }
    } catch(err:any){ setError(err.message??'Failed to send'); setInput(content) }
  }

  const handleFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file||!active) return
    if(file.size>25*1024*1024){ setError('File must be under 25 MB'); return }
    setUploadPct(0); setError(null)
    try {
      const path='mlm-attachments/'+active.id+'/'+Date.now()+'-'+file.name
      const {error:upErr}=await supabaseAnon.storage.from('mlm-files').upload(path,file,{upsert:false})
      if(upErr) throw new Error(upErr.message)
      setUploadPct(80)
      const {data:urlData}=supabaseAnon.storage.from('mlm-files').getPublicUrl(path)
      const res=await fetch('/api/mlm/communications/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({channelId:active.id,content:file.name,messageType:'file',attachment_url:urlData.publicUrl,attachment_name:file.name})
      })
      const data=await res.json()
      if(data.success&&data.data&&connStatus!=='connected') setMessages(prev=>[...prev,data.data])
      setUploadPct(100)
    } catch(err:any){ setError(err.message??'Upload failed') }
    finally{ setUploadPct(null); if(fileInputRef.current) fileInputRef.current.value='' }
  }

  const sc:Record<ConnStatus,string>={connected:'#22c55e',connecting:'#f59e0b',disconnected:'#6b7280',error:'#f97316'}
  const scLabel:Record<ConnStatus,string>={connected:'live',connecting:'connecting',disconnected:'offline',error:'polling'}

  if(!user) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--color-text-secondary)'}}>Loading...</div>

  return (
    <div style={{display:'flex',height:'calc(100vh - 64px)',fontFamily:'var(--font-sans)'}}>
      <aside style={{width:260,borderRight:'1px solid var(--color-border-tertiary)',display:'flex',flexDirection:'column',overflowY:'auto',background:'var(--color-background-primary)'}}>
        <div style={{padding:'16px',borderBottom:'1px solid var(--color-border-tertiary)'}}>
          <div style={{fontWeight:600,fontSize:14,color:'var(--color-text-primary)'}}>MLM Communication</div>
          <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:2}}>Welcome, {user.name}</div>
        </div>
        <div style={{padding:'8px 12px 4px',fontSize:11,fontWeight:500,color:'var(--color-text-tertiary)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Channels</div>
        {channels.length===0&&<div style={{padding:'12px 16px',fontSize:13,color:'var(--color-text-tertiary)'}}>Loading channels...</div>}
        {channels.map(ch=>(
          <button key={ch.id} onClick={()=>selectChannel(ch)}
            style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px',background:active?.id===ch.id?'var(--color-background-secondary)':'transparent',border:'none',cursor:'pointer',textAlign:'left',width:'100%'}}>
            <span style={{fontSize:14,color:active?.id===ch.id?'var(--color-text-primary)':'var(--color-text-secondary)',fontWeight:active?.id===ch.id?500:400}}># {ch.name}</span>
            {(ch.unread_count||0)>0&&<span style={{background:'#3b82f6',color:'white',borderRadius:10,fontSize:11,fontWeight:600,padding:'1px 6px'}}>{ch.unread_count}</span>}
          </button>
        ))}
      </aside>
      <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'12px 20px',borderBottom:'1px solid var(--color-border-tertiary)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--color-background-primary)'}}>
          <div>
            <span style={{fontWeight:600,fontSize:15,color:'var(--color-text-primary)'}}>{active?'# '+active.name:'Select a channel'}</span>
            {active?.description&&<span style={{fontSize:13,color:'var(--color-text-secondary)',marginLeft:12}}>{active.description}</span>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:11,color:'var(--color-text-tertiary)'}}>{scLabel[connStatus]}</span>
            <span style={{width:8,height:8,borderRadius:'50%',background:sc[connStatus],display:'inline-block'}}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:2}}>
          {loading&&<div style={{textAlign:'center',color:'var(--color-text-tertiary)',padding:40}}>Loading messages...</div>}
          {!loading&&!active&&<div style={{textAlign:'center',color:'var(--color-text-tertiary)',padding:40,fontSize:15}}>👈 Select a channel to start chatting</div>}
          {!loading&&active&&messages.length===0&&<div style={{textAlign:'center',color:'var(--color-text-tertiary)',padding:40}}>No messages yet — say something!</div>}
          {messages.map(msg=>(
            <div key={msg.id} style={{marginBottom:12}}>
              <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:2}}>
                <span style={{fontWeight:600,fontSize:14,color:'var(--color-text-primary)'}}>{msg.sender_name}</span>
                <span style={{fontSize:11,color:'var(--color-text-tertiary)'}}>{new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
              </div>
              {msg.message_type==='file'
                ?<a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:6,border:'1px solid var(--color-border-secondary)',fontSize:13,color:'var(--color-text-primary)',textDecoration:'none',background:'var(--color-background-secondary)'}}>📎 {msg.attachment_name||msg.content}</a>
                :<p style={{margin:0,fontSize:14,color:'var(--color-text-primary)',lineHeight:1.6,wordBreak:'break-word'}}>{msg.content}</p>}
            </div>
          ))}
          <div ref={messagesEndRef}/>
        </div>
        {error&&<div style={{margin:'0 20px 8px',padding:'8px 14px',background:'#fef2f2',color:'#dc2626',borderRadius:6,fontSize:13,display:'flex',justifyContent:'space-between',alignItems:'center'}}>{error}<button onClick={()=>setError(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:16}}>✕</button></div>}
        {uploadPct!==null&&<div style={{margin:'0 20px 8px',fontSize:13,color:'var(--color-text-secondary)'}}>Uploading... {uploadPct}%</div>}
        <div style={{padding:'12px 20px',borderTop:'1px solid var(--color-border-tertiary)',display:'flex',gap:8,background:'var(--color-background-primary)'}}>
          <input type="file" ref={fileInputRef} onChange={handleFile} style={{display:'none'}} accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"/>
          <button onClick={()=>fileInputRef.current?.click()} disabled={!active} style={{padding:'8px 12px',borderRadius:6,border:'1px solid var(--color-border-secondary)',background:'transparent',cursor:active?'pointer':'not-allowed',fontSize:16,color:'var(--color-text-secondary)',flexShrink:0}} title="Attach file">📎</button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),handleSend())} placeholder={active?'Message #'+active.name:'Select a channel first'} disabled={!active}
            style={{flex:1,padding:'8px 14px',borderRadius:6,border:'1px solid var(--color-border-secondary)',background:'var(--color-background-primary)',color:'var(--color-text-primary)',fontSize:14,outline:'none'}}/>
          <button onClick={handleSend} disabled={!input.trim()||!active}
            style={{padding:'8px 18px',borderRadius:6,border:'none',background:input.trim()&&active?'#3b82f6':'var(--color-border-secondary)',color:input.trim()&&active?'white':'var(--color-text-tertiary)',cursor:input.trim()&&active?'pointer':'not-allowed',fontSize:14,fontWeight:500,flexShrink:0}}>Send</button>
        </div>
      </main>
    </div>
  )
}