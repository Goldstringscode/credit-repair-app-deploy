'use client'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Mail, Send, Loader2, CheckCircle, X, Plus, Search, AlertCircle } from 'lucide-react'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (campaign: any) => void
}

const PLAN_FILTERS = [
  { value: 'all',          label: 'All Users',          desc: 'Everyone in the system' },
  { value: 'active',       label: 'Active Subscribers', desc: 'Users with active subscription' },
  { value: 'free',         label: 'Free Users',         desc: 'Users on free plan' },
  { value: 'paid',         label: 'Paid Users',         desc: 'Users on any paid plan' },
  { value: 'custom',       label: 'Custom Selection',   desc: 'Choose specific users' },
  { value: 'external',     label: 'External Only',      desc: 'Non-registered email addresses' },
]

export default function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [step, setStep] = useState<'details' | 'recipients' | 'preview'>('details')
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [scheduleType, setScheduleType] = useState<'now' | 'schedule'>('now')
  const [scheduledFor, setScheduledFor] = useState('')

  // Recipient management
  const [recipientMode, setRecipientMode] = useState<'filter' | 'custom'>('filter')
  const [filterType, setFilterType] = useState('all')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())

  // External (non-registered) emails
  const [externalEmails, setExternalEmails] = useState<string[]>([])
  const [externalInput, setExternalInput] = useState('')
  const [externalError, setExternalError] = useState('')

  // Load users when modal opens
  useEffect(() => {
    if (!isOpen) return
    setUsersLoading(true)
    fetch('/api/admin/users?limit=500')
      .then(r => r.json())
      .then(d => { if (d.success) setAllUsers(d.users || []) })
      .catch(e => console.error('Failed to load users:', e))
      .finally(() => setUsersLoading(false))
  }, [isOpen])

  const reset = () => {
    setStep('details'); setName(''); setSubject(''); setContent('')
    setScheduleType('now'); setScheduledFor(''); setRecipientMode('filter')
    setFilterType('all'); setUserSearch(''); setSelectedUserIds(new Set())
    setExternalEmails([]); setExternalInput(''); setError(null)
  }

  // Compute recipient list based on current filters
  const filteredUsers = allUsers.filter(u => {
    const q = userSearch.toLowerCase()
    const matchSearch = !userSearch || u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q)
    if (recipientMode === 'custom') return matchSearch
    // For filter mode, apply plan filter
    if (filterType === 'all') return matchSearch
    if (filterType === 'active') return matchSearch && u.status === 'active'
    if (filterType === 'free') return matchSearch && (!u.plan || u.plan === 'free')
    if (filterType === 'paid') return matchSearch && u.plan && u.plan !== 'free'
    return matchSearch
  })

  const recipientCount = recipientMode === 'filter'
    ? filteredUsers.length + externalEmails.length
    : selectedUserIds.size + externalEmails.length

  // Add external email
  const addExternalEmail = () => {
    const email = externalInput.trim().toLowerCase()
    if (!email) return
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) { setExternalError('Invalid email address'); return }
    if (externalEmails.includes(email)) { setExternalError('Already added'); return }
    setExternalEmails(prev => [...prev, email])
    setExternalInput('')
    setExternalError('')
  }

  // Add multiple external emails (paste/import)
  const addMultipleEmails = (text: string) => {
    const emails = text.split(/[,\n\s;]+/).map(e => e.trim().toLowerCase()).filter(e => /^[^@]+@[^@]+\.[^@]+$/.test(e))
    const newEmails = emails.filter(e => !externalEmails.includes(e))
    setExternalEmails(prev => [...prev, ...newEmails])
    setExternalInput('')
    if (newEmails.length > 0) setExternalError('')
  }

  const handleSubmit = async () => {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      setError('Name, subject and content are required')
      return
    }
    if (recipientCount === 0) {
      setError('Please select at least one recipient')
      return
    }

    setLoading(true); setError(null)
    try {
      const body: any = {
        name: name.trim(),
        subject: subject.trim(),
        content: content.trim(),
        status: scheduleType === 'schedule' ? 'scheduled' : 'draft',
        scheduledFor: scheduleType === 'schedule' ? scheduledFor : null,
        recipientMode,
        recipientFilter: recipientMode === 'filter' ? filterType : 'custom',
        selectedUserIds: recipientMode === 'custom' ? [...selectedUserIds] : [],
        externalEmails,
        estimatedRecipients: recipientCount,
      }

      const res = await fetch('/api/admin/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!data.success) throw new Error(data.error || 'Failed to create campaign')

      onSuccess?.(data.data?.campaign)
      reset()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={o => { if (!o) { reset(); onClose() } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-purple-600" />Create Email Campaign</DialogTitle>
          <DialogDescription>Send an email campaign to your users or any email address</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          {['details','recipients','preview'].map((s,i) => (
            <React.Fragment key={s}>
              <button onClick={() => step !== 'details' || s === 'details' ? setStep(s as any) : null}
                className={"px-3 py-1 rounded-full font-medium " + (step === s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500')}>
                {i+1}. {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
              {i < 2 && <span>→</span>}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
          </div>
        )}

        {/* Step 1: Campaign Details */}
        {step === 'details' && (
          <div className="space-y-4">
            <div>
              <Label>Campaign Name *</Label>
              <Input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Monthly Newsletter – June 2025" className="mt-1"/>
            </div>
            <div>
              <Label>Subject Line *</Label>
              <Input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Your credit report has new updates" className="mt-1"/>
            </div>
            <div>
              <Label>Email Content *</Label>
              <p className="text-xs text-gray-400 mb-1">Use {'{firstName}'} and {'{email}'} for personalization</p>
              <Textarea value={content} onChange={e=>setContent(e.target.value)}
                placeholder={"Hi {firstName},\n\nWe wanted to share some important updates about your credit repair journey...\n\nBest regards,\nThe Credit Repair AI Team"}
                rows={8} className="mt-1 font-mono text-sm"/>
            </div>
            <div>
              <Label>Send Time</Label>
              <div className="flex gap-3 mt-2">
                <label className={"flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer " + (scheduleType==='now'?'border-purple-500 bg-purple-50':'border-gray-200')}>
                  <input type="radio" name="scheduleType" value="now" checked={scheduleType==='now'} onChange={()=>setScheduleType('now')} className="sr-only"/>
                  <Send className="h-4 w-4"/><span className="text-sm font-medium">Send when ready</span>
                </label>
                <label className={"flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer " + (scheduleType==='schedule'?'border-purple-500 bg-purple-50':'border-gray-200')}>
                  <input type="radio" name="scheduleType" value="schedule" checked={scheduleType==='schedule'} onChange={()=>setScheduleType('schedule')} className="sr-only"/>
                  <span className="text-sm font-medium">Schedule</span>
                </label>
              </div>
              {scheduleType === 'schedule' && (
                <Input type="datetime-local" value={scheduledFor} onChange={e=>setScheduledFor(e.target.value)} className="mt-2"/>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={()=>{if(!name||!subject||!content){setError('Fill in all fields');return}setError(null);setStep('recipients')}}
                className="bg-purple-600 hover:bg-purple-700 text-white">
                Next: Choose Recipients →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Recipients */}
        {step === 'recipients' && (
          <div className="space-y-4">
            <Tabs value={recipientMode} onValueChange={v=>setRecipientMode(v as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="filter" className="flex-1"><Users className="h-4 w-4 mr-1.5"/>Filter Users ({allUsers.length} total)</TabsTrigger>
                <TabsTrigger value="custom" className="flex-1"><CheckCircle className="h-4 w-4 mr-1.5"/>Pick Users</TabsTrigger>
              </TabsList>

              {/* Filter tab - filter existing users by plan/status */}
              <TabsContent value="filter" className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  {PLAN_FILTERS.filter(f=>f.value!=='custom'&&f.value!=='external').map(f=>{
                    const count = f.value==='all' ? allUsers.length
                      : f.value==='active' ? allUsers.filter(u=>u.status==='active').length
                      : f.value==='free' ? allUsers.filter(u=>!u.plan||u.plan==='free').length
                      : f.value==='paid' ? allUsers.filter(u=>u.plan&&u.plan!=='free').length : 0
                    return (
                      <label key={f.value} className={"flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer " + (filterType===f.value?'border-purple-500 bg-purple-50':'border-gray-200 hover:border-gray-300')}>
                        <input type="radio" name="filterType" value={f.value} checked={filterType===f.value} onChange={()=>setFilterType(f.value)} className="sr-only"/>
                        <div className={"w-4 h-4 rounded-full border-2 flex-shrink-0 "+(filterType===f.value?'border-purple-500 bg-purple-500':'border-gray-300')}/>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900">{f.label}</p>
                          <p className="text-xs text-gray-400">{f.desc}</p>
                        </div>
                        <Badge className="ml-auto bg-gray-100 text-gray-600 flex-shrink-0">{count}</Badge>
                      </label>
                    )
                  })}
                </div>
                {usersLoading && <p className="text-xs text-gray-400 text-center py-2">Loading users...</p>}
              </TabsContent>

              {/* Custom pick tab - search and select individual users */}
              <TabsContent value="custom" className="space-y-3 pt-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"/>
                  <Input placeholder="Search users by name or email..." className="pl-9" value={userSearch} onChange={e=>setUserSearch(e.target.value)}/>
                </div>
                <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center py-4 text-sm text-gray-400">No users found</p>
                  ) : filteredUsers.map(u=>(
                    <label key={u.id} className={"flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 "+(selectedUserIds.has(u.id)?'bg-purple-50':'')}>
                      <input type="checkbox" checked={selectedUserIds.has(u.id)}
                        onChange={e=>{const s=new Set(selectedUserIds); e.target.checked?s.add(u.id):s.delete(u.id); setSelectedUserIds(s)}}
                        className="rounded border-gray-300 text-purple-600"/>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.name||u.email?.split('@')[0]}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <Badge className="text-xs bg-gray-100 text-gray-600 flex-shrink-0">{u.plan||'free'}</Badge>
                    </label>
                  ))}
                </div>
                {selectedUserIds.size > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-600 font-medium">{selectedUserIds.size} user{selectedUserIds.size!==1?'s':''} selected</span>
                    <button onClick={()=>setSelectedUserIds(new Set())} className="text-xs text-gray-400 hover:text-gray-600">Clear all</button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* External emails - always shown */}
            <div className="border-t pt-4">
              <Label className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-500"/>
                External Recipients (non-registered emails)
              </Label>
              <p className="text-xs text-gray-400 mb-2">Send to people who are not in your user database. Enter one email or paste a comma-separated list.</p>
              <div className="flex gap-2">
                <Input value={externalInput} onChange={e=>setExternalInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault();addExternalEmail()} }}
                  placeholder="email@example.com or paste multiple separated by commas..."
                  className={"flex-1 "+(externalError?'border-red-400':'')}/>
                <Button type="button" variant="outline" onClick={()=>addMultipleEmails(externalInput)} className="flex-shrink-0">
                  <Plus className="h-4 w-4 mr-1"/>Add
                </Button>
              </div>
              {externalError && <p className="text-xs text-red-500 mt-1">{externalError}</p>}
              {externalEmails.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto">
                  {externalEmails.map(e=>(
                    <span key={e} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5">
                      {e}<button onClick={()=>setExternalEmails(prev=>prev.filter(x=>x!==e))} className="hover:text-red-500"><X className="h-3 w-3"/></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recipient summary */}
            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total recipients:</span>
              <Badge className="bg-purple-100 text-purple-800 text-sm font-bold">{recipientCount}</Badge>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={()=>setStep('details')}>← Back</Button>
              <Button onClick={()=>{if(recipientCount===0){setError('Add at least one recipient');return}setError(null);setStep('preview')}}
                className="bg-purple-600 hover:bg-purple-700 text-white">
                Next: Preview →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Send */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Campaign:</span><span className="font-medium">{name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Subject:</span><span className="font-medium">{subject}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">Recipients:</span>
                <span className="font-medium text-purple-600">{recipientCount} {recipientCount===1?'person':'people'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Send time:</span>
                <span className="font-medium">{scheduleType==='now'?'When manually sent':'Scheduled: '+scheduledFor}</span>
              </div>
              {externalEmails.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">External:</span>
                  <span className="font-medium">{externalEmails.length} external email{externalEmails.length!==1?'s':''}</span>
                </div>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Preview</div>
              <div className="p-4">
                <p className="font-semibold text-gray-900 mb-2">{subject}</p>
                <div className="text-sm text-gray-700 whitespace-pre-wrap border-t pt-2">{content.replace(/\{firstName\}/g,'[FirstName]').replace(/\{email\}/g,'[Email]')}</div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={()=>setStep('recipients')}>← Back</Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Creating...</> : <><CheckCircle className="h-4 w-4 mr-2"/>Create Campaign</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}