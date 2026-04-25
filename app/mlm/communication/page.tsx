'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  subscribeToChannel, subscribeToPresence,
  fetchUserChannels, fetchChannelMessages,
  sendMessage, sendFile, markChannelRead,
  type MLMMessage, type MLMChannel, type ConnectionStatus,
} from '@/lib/mlm-realtime-service'

export default function MLMCommunicationPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const unsubRef = useRef<(()=>void)|null>(null)
  const presenceRef = useRef<(()=>void)|null>(null)

  const [currentUser, setCurrentUser] = useState<{id:string;name:string}|null>(null)
  const [channels, setChannels] = useState<MLMChannel[]>([])
  const [activeChannel, setActiveChannel] = useState<MLMChannel|null>(null)
  const [messages, setMessages] = useState<MLMMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Array<{id:string;name:string}>>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [messageInput, setMessageInput] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number|null>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [error, setError] = useState<string|null>(null)

  useEffect(()=>{
    const init = async () => {
      // Verify session - cookies sent automatically, no token needed
      const res = await fetch('/api/auth/me').catch(()=>null)
      if(!res?.ok){ router.push('/login'); return }
      const data = await res.json()
      const user = data.user || data
      if(!user?.id){ router.push('/login'); return }
      setCurrentUser({id:user.id, name:user.name||user.email||'Member'})
      try {
        const userChannels = await fetchUserChannels()
        setChannels(userChannels)
        if(userChannels.length>0) selectChannel(userChannels[0], user.id, user.name||user.email||'Member')
      } catch(e) { setError('Failed to load channels. Please refresh.') }
    }
    init()
    return ()=>{ unsubRef.current?.(); presenceRef.current?.() }
  },[])

  const selectChannel = useCallback(async(channel:MLMChannel, userId:string, userName:string)=>{
    unsubRef.current?.(); presenceRef.current?.()
    setActiveChannel(channel); setMessages([]); setIsLoadingMessages(true); setError(null)
    try { setMessages(await fetchChannelMessages(channel.id)) }
    catch { setError('Failed to load messages.') }
    finally { setIsLoadingMessages(false) }
    unsubRef.current = subscribeToChannel(channel.id,
      (msg)=>setMessages(prev=>prev.some(m=>m.id===msg.id)?prev:[...prev,msg]),
      setConnectionStatus)
    presenceRef.current = subscribeToPresence(channel.id,{id:userId,name:userName},setOnlineUsers)
    markChannelRead(channel.id).catch(()=>{})
    setChannels(prev=>prev.map(c=>c.id===channel.id?{...c,unread_count:0}:c))
  },[])

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:'smooth'}) },[messages])

  const handleSend = async()=>{
    if(!messageInput.trim()||!activeChannel) return
    const content=messageInput.trim(); setMessageInput('')
    try { await sendMessage(activeChannel.id,content) }
    catch(err:any){ setError(err.message??'Failed to send'); setMessageInput(content) }
  }

  const handleFileSelect = async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]
    if(!file||!activeChannel) return
    if(file.size>25*1024*1024){ setError('File must be under 25 MB'); return }
    setUploadProgress(0); setError(null)
    try { await sendFile(activeChannel.id,file,setUploadProgress) }
    catch(err:any){ setError(err.message??'Upload failed') }
    finally{ setUploadProgress(null); if(fileInputRef.current) fileInputRef.current.value='' }
  }

  const statusColor:Record<ConnectionStatus,string>={connected:'#22c55e',connecting:'#f59e0b',disconnected:'#6b7280',error:'#ef4444'}

  return (
    <div style={{display:'flex',height:'calc(100vh - 64px)',fontFamily:'var(--font-sans)'}}>
      <aside style={{width:260,borderRight:'1px solid var(--color-border-tertiary)',display:'flex',flexDirection:'column',overflowY:'auto'}}>
        <div style={{padding:'16px 16px 8px',fontWeight:500,fontSize:13,color:'var(--color-text-secondary)'}}>Channels</div>
        {channels.length===0 && <div style={{padding:'12px 16px',fontSize:13,color:'var(--color-text-tertiary)'}}>Loading channels...</div>}
        {channels.map(ch=>(
          <button key={ch.id} onClick={()=>currentUser&&selectChannel(ch,currentUser.id,currentUser.name)}
            style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',background:activeChannel?.id===ch.id?'var(--color-background-secondary)':'transparent',border:'none',cursor:'pointer',textAlign:'left',width:'calc(100% - 16px)',borderRadius:6,margin:'1px 8px'}}>
            <span style={{fontSize:14,color:'var(--color-text-primary)',fontWeight:activeChannel?.id===ch.id?500:400}}># {ch.name}</span>
            {ch.unread_count>0&&<span style={{background:'var(--color-background-info)',color:'var(--color-text-info)',borderRadius:10,fontSize:11,fontWeight:500,padding:'1px 7px'}}>{ch.unread_count}</span>}
          </button>
        ))}
      </aside>
      <main style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'12px 20px',borderBottom:'1px solid var(--color-border-tertiary)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <span style={{fontWeight:500,fontSize:15}}>{activeChannel?'# '+activeChannel.name:'Select a channel'}</span>
            {activeChannel?.description&&<span style={{fontSize:13,color:'var(--color-text-secondary)',marginLeft:12}}>{activeChannel.description}</span>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:12,color:'var(--color-text-secondary)'}}>{onlineUsers.length} online</span>
            <span style={{width:8,height:8,borderRadius:'50%',background:statusColor[connectionStatus],display:'inline-block'}} title={connectionStatus}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
          {isLoadingMessages&&<div style={{textAlign:'center',color:'var(--color-text-tertiary)',padding:40}}>Loading messages...</div>}
          {!isLoadingMessages&&messages.length===0&&activeChannel&&<div style={{textAlign:'center',color:'var(--color-text-tertiary)',padding:40}}>No messages yet. Say something!</div>}
          {messages.map(msg=>(
            <div key={msg.id} style={{marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                <span style={{fontWeight:500,fontSize:14,color:'var(--color-text-primary)'}}>{msg.sender_name}</span>
                <span style={{fontSize:12,color:'var(--color-text-tertiary)'}}>{new Date(msg.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
              </div>
              {msg.message_type==='file'
                ?<a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:6,border:'1px solid var(--color-border-secondary)',fontSize:13,color:'var(--color-text-primary)',textDecoration:'none'}}>📎 {msg.attachment_name??msg.content}</a>
                :<p style={{margin:0,fontSize:14,color:'var(--color-text-primary)',lineHeight:1.5}}>{msg.content}</p>}
            </div>
          ))}
          <div ref={messagesEndRef}/>
        </div>
        {error&&<div style={{margin:'0 20px 8px',padding:'8px 14px',background:'var(--color-background-danger)',color:'var(--color-text-danger)',borderRadius:6,fontSize:13,display:'flex',justifyContent:'space-between'}}>{error}<button onClick={()=>setError(null)} style={{background:'none',border:'none',cursor:'pointer',color:'inherit'}}>✕</button></div>}
        {uploadProgress!==null&&<div style={{margin:'0 20px 8px',fontSize:13,color:'var(--color-text-secondary)'}}>Uploading... {uploadProgress}%</div>}
        <div style={{padding:'12px 20px',borderTop:'1px solid var(--color-border-tertiary)',display:'flex',gap:8}}>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{display:'none'}} accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"/>
          <button onClick={()=>fileInputRef.current?.click()} disabled={!activeChannel} style={{padding:'8px 12px',borderRadius:6,border:'1px solid var(--color-border-secondary)',background:'transparent',cursor:activeChannel?'pointer':'not-allowed',fontSize:16,color:'var(--color-text-secondary)'}} title="Attach file">📎</button>
          <input value={messageInput} onChange={e=>setMessageInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),handleSend())} placeholder={activeChannel?'Message #'+activeChannel.name:'Select a channel'} disabled={!activeChannel}
            style={{flex:1,padding:'8px 14px',borderRadius:6,border:'1px solid var(--color-border-secondary)',background:'var(--color-background-primary)',color:'var(--color-text-primary)',fontSize:14,outline:'none'}}/>
          <button onClick={handleSend} disabled={!messageInput.trim()||!activeChannel}
            style={{padding:'8px 16px',borderRadius:6,border:'none',background:messageInput.trim()&&activeChannel?'var(--color-text-primary)':'var(--color-border-secondary)',color:messageInput.trim()&&activeChannel?'var(--color-background-primary)':'var(--color-text-tertiary)',cursor:messageInput.trim()&&activeChannel?'pointer':'not-allowed',fontSize:14,fontWeight:500}}>Send</button>
        </div>
      </main>
    </div>
  )
}