import { createClient, RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface MLMMessage {
  id: string; channel_id: string; sender_id: string; sender_name: string
  sender_avatar?: string; content: string
  message_type: 'text'|'file'|'system'|'achievement'
  attachment_url?: string; attachment_name?: string; created_at: string
}
export interface MLMChannel {
  id: string; name: string; description?: string
  channel_type: 'global'|'team'|'rank'|'genealogy'|'direct'
  unread_count: number; last_message?: string; member_count: number
}
export interface MLMDirectMessage {
  id: string; from_user_id: string; to_user_id: string
  content: string; is_read: boolean; created_at: string
}
export type ConnectionStatus = 'connecting'|'connected'|'disconnected'|'error'

// Supabase Realtime subscription - no auth token needed, uses anon key
export function subscribeToChannel(channelId: string, onMessage: (msg: MLMMessage) => void, onStatusChange?: (s: ConnectionStatus) => void): () => void {
  const ch: RealtimeChannel = supabase
    .channel('mlm-channel-'+channelId)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'mlm_messages',filter:'channel_id=eq.'+channelId},
      (payload) => onMessage(payload.new as MLMMessage))
    .subscribe((status) => {
      if(!onStatusChange) return
      if(status==='SUBSCRIBED') onStatusChange('connected')
      else if(status==='CLOSED') onStatusChange('disconnected')
      else if(status==='CHANNEL_ERROR') onStatusChange('error')
      else onStatusChange('connecting')
    })
  return () => { supabase.removeChannel(ch) }
}

export function subscribeToPresence(channelId: string, currentUser: {id:string;name:string;avatar?:string}, onPresenceChange: (users: Array<{id:string;name:string;avatar?:string}>) => void): () => void {
  const ch: RealtimeChannel = supabase.channel('mlm-presence-'+channelId, { config:{ presence:{ key:currentUser.id } } })
  ch.on('presence',{event:'sync'},() => {
    const state = ch.presenceState<{name:string;avatar?:string}>()
    onPresenceChange(Object.entries(state).map(([id,p]) => ({id,name:p[0]?.name??'Unknown',avatar:p[0]?.avatar})))
  }).subscribe(async (status) => {
    if(status==='SUBSCRIBED') await ch.track({name:currentUser.name,avatar:currentUser.avatar,online_at:new Date().toISOString()})
  })
  return () => { ch.untrack(); supabase.removeChannel(ch) }
}

// API helpers - no auth tokens needed, cookies sent automatically by browser
export async function fetchUserChannels(): Promise<MLMChannel[]> {
  const res = await fetch('/api/mlm/communication/channels')
  if(!res.ok) throw new Error('Failed to fetch channels: '+res.status)
  return (await res.json()).channels ?? []
}

export async function fetchChannelMessages(channelId: string, before?: string, limit = 50): Promise<MLMMessage[]> {
  const params = new URLSearchParams({channel_id:channelId,limit:String(limit)})
  if(before) params.set('before',before)
  const res = await fetch('/api/mlm/communication/messages?'+params)
  if(!res.ok) throw new Error('Failed to fetch messages: '+res.status)
  return (await res.json()).messages ?? []
}

export async function sendMessage(channelId: string, content: string): Promise<MLMMessage> {
  const res = await fetch('/api/mlm/communication/messages',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({channel_id:channelId,content,message_type:'text'})
  })
  if(!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e.error??'Failed: '+res.status) }
  return (await res.json()).message
}

export async function sendFile(channelId: string, file: File, onProgress?: (pct:number) => void): Promise<MLMMessage> {
  const path = 'mlm-attachments/'+channelId+'/'+Date.now()+'-'+file.name
  const {error} = await supabase.storage.from('mlm-files').upload(path,file,{upsert:false})
  if(error) throw new Error('File upload failed: '+error.message)
  onProgress?.(80)
  const {data} = supabase.storage.from('mlm-files').getPublicUrl(path)
  const res = await fetch('/api/mlm/communication/messages',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({channel_id:channelId,content:file.name,message_type:'file',attachment_url:data.publicUrl,attachment_name:file.name})
  })
  onProgress?.(100)
  if(!res.ok) throw new Error('Failed to send file: '+res.status)
  return (await res.json()).message
}

export async function markChannelRead(channelId: string): Promise<void> {
  await fetch('/api/mlm/communication/messages/read',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({channel_id:channelId})
  })
}

export async function sendDirectMessage(toUserId: string, content: string): Promise<MLMDirectMessage> {
  const res = await fetch('/api/mlm/communication/direct',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({to_user_id:toUserId,content})
  })
  if(!res.ok) throw new Error('Failed to send DM: '+res.status)
  return (await res.json()).message
}