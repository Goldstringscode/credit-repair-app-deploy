'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'

interface TestResult {
  name: string
  description: string
  method: string
  url: string
  status: 'pass' | 'fail' | 'pending' | 'skipped' | 'unknown'
  httpStatus?: number
  responseTime?: number
  error?: string
  response?: any
  expanded: boolean
}

const INITIAL_TESTS: Omit<TestResult, 'status' | 'expanded'>[] = [
  { name: 'Get Channels', description: 'Fetch channels for the user', method: 'GET', url: '/api/mlm/communications/channels' },
  { name: 'Create Channel', description: 'Create a new public channel', method: 'POST', url: '/api/mlm/communications/channels' },
  { name: 'Verify Channel Created', description: 'Re-fetch channels to confirm creation persisted', method: 'GET', url: '/api/mlm/communications/channels' },
  { name: 'Post Message', description: 'Send a message to the created channel', method: 'POST', url: '/api/mlm/communications/messages' },
  { name: 'Get Messages', description: 'Fetch messages from the channel', method: 'GET', url: '/api/mlm/communications/messages' },
  { name: 'Get Single Message', description: 'Fetch the posted message by ID', method: 'GET', url: '/api/mlm/communications/messages/[messageId]' },
  { name: 'Update Message', description: 'Edit the posted message', method: 'PUT', url: '/api/mlm/communications/messages/[messageId]' },
  { name: 'Add Reaction', description: 'Add a 👍 reaction to the message', method: 'POST', url: '/api/mlm/communications/reactions' },
  { name: 'Remove Reaction', description: 'Remove the 👍 reaction', method: 'DELETE', url: '/api/mlm/communications/reactions' },
  { name: 'Get DM Conversations', description: 'Fetch direct message conversations', method: 'GET', url: '/api/mlm/communications/direct-messages' },
  { name: 'Send DM', description: 'Send a direct message to a test recipient', method: 'POST', url: '/api/mlm/communications/direct-messages' },
  { name: 'Create Scheduled Message', description: 'Schedule a message for 2 hours from now', method: 'POST', url: '/api/mlm/communication/scheduled-messages' },
  { name: 'Get Scheduled Messages', description: 'Fetch scheduled messages for the user', method: 'GET', url: '/api/mlm/communication/scheduled-messages' },
  { name: 'Cancel Scheduled Message', description: 'Delete the scheduled message', method: 'DELETE', url: '/api/mlm/communication/scheduled-messages' },
  { name: 'Upload File', description: 'Upload a test file — URL must be Supabase CDN, not /uploads/', method: 'POST', url: '/api/mlm/communication/upload' },
  { name: 'Persistence Check', description: 'Re-fetch messages — confirms data is in Supabase, not in-memory', method: 'GET', url: '/api/mlm/communications/messages' },
]

export default function TestCommunicationPage() {
  const [userId, setUserId] = useState('test-user-123')
  const [tests, setTests] = useState<TestResult[]>(
    INITIAL_TESTS.map(t => ({ ...t, status: 'unknown', expanded: false }))
  )
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  const toggleExpand = (index: number) => {
    setTests(prev => {
      const next = [...prev]
      next[index] = { ...next[index], expanded: !next[index].expanded }
      return next
    })
  }

  const runAllTests = async () => {
    if (!userId.trim()) return
    setIsRunning(true)
    setTests(INITIAL_TESTS.map(t => ({ ...t, status: 'unknown', expanded: false })))

    let channelId: string | null = null
    let messageId: string | null = null
    let scheduledMessageId: string | null = null
    const timestamp = Date.now()

    const run = async (index: number, fn: () => Promise<{ ok: boolean; httpStatus: number; response: any; error?: string }>) => {
      updateTest(index, { status: 'pending' })
      const start = Date.now()
      try {
        const result = await fn()
        const responseTime = Date.now() - start
        updateTest(index, {
          status: result.ok ? 'pass' : 'fail',
          httpStatus: result.httpStatus,
          responseTime,
          response: result.response,
          error: result.error,
        })
        return result
      } catch (e: any) {
        updateTest(index, { status: 'fail', responseTime: Date.now() - start, error: e.message })
        return { ok: false, httpStatus: 0, response: null, error: e.message }
      }
    }

    const apiFetch = async (url: string, options: RequestInit = {}) => {
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options })
      let response: any = null
      try { response = await res.json() } catch {}
      const ok = res.ok && response?.success !== false
      return { ok, httpStatus: res.status, response, error: ok ? undefined : (response?.error || `HTTP ${res.status}`) }
    }

    // 0: Get Channels
    await run(0, () => apiFetch(`/api/mlm/communications/channels?userId=${userId}`))

    // 1: Create Channel
    const createResult = await run(1, () => apiFetch('/api/mlm/communications/channels', {
      method: 'POST',
      body: JSON.stringify({ name: `test-channel-${timestamp}`, type: 'public', createdBy: userId, scope: 'general' }),
    }))
    channelId = createResult.response?.data?.id ?? null

    if (!channelId) {
      const dependents = [2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15]
      dependents.forEach(i => updateTest(i, { status: 'skipped', error: 'Skipped: Create Channel failed' }))
      await run(9, () => apiFetch(`/api/mlm/communications/direct-messages?userId=${userId}`))
      await run(10, () => apiFetch('/api/mlm/communications/direct-messages', {
        method: 'POST',
        body: JSON.stringify({ senderId: userId, recipientId: 'test-recipient-456', content: 'Test DM from dashboard' }),
      }))
      setIsRunning(false)
      return
    }

    // 2: Verify Channel Created
    await run(2, async () => {
      const r = await apiFetch(`/api/mlm/communications/channels?userId=${userId}`)
      const found = Array.isArray(r.response?.data) && r.response.data.some((c: any) => c.id === channelId)
      return { ...r, ok: r.ok && found, error: found ? undefined : 'Created channel not found in list' }
    })

    // 3: Post Message
    const msgResult = await run(3, () => apiFetch('/api/mlm/communications/messages', {
      method: 'POST',
      body: JSON.stringify({ channelId, senderId: userId, content: 'Hello from test dashboard!' }),
    }))
    messageId = msgResult.response?.data?.id ?? null

    // 4: Get Messages
    await run(4, () => apiFetch(`/api/mlm/communications/messages?channelId=${channelId}&userId=${userId}`))

    // 5: Get Single Message
    if (messageId) {
      await run(5, () => apiFetch(`/api/mlm/communications/messages/${messageId}`))
    } else {
      updateTest(5, { status: 'skipped', error: 'Skipped: Post Message failed' })
    }

    // 6: Update Message
    if (messageId) {
      await run(6, () => apiFetch(`/api/mlm/communications/messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: 'Updated content', isEdited: true }),
      }))
    } else {
      updateTest(6, { status: 'skipped', error: 'Skipped: Post Message failed' })
    }

    // 7: Add Reaction
    if (messageId) {
      await run(7, () => apiFetch('/api/mlm/communications/reactions', {
        method: 'POST',
        body: JSON.stringify({ messageId, userId, emoji: '👍' }),
      }))
    } else {
      updateTest(7, { status: 'skipped', error: 'Skipped: Post Message failed' })
    }

    // 8: Remove Reaction
    if (messageId) {
      await run(8, () => apiFetch(`/api/mlm/communications/reactions?messageId=${messageId}&userId=${userId}&emoji=👍`, { method: 'DELETE' }))
    } else {
      updateTest(8, { status: 'skipped', error: 'Skipped: Post Message failed' })
    }

    // 9: Get DM Conversations
    await run(9, () => apiFetch(`/api/mlm/communications/direct-messages?userId=${userId}`))

    // 10: Send DM
    await run(10, () => apiFetch('/api/mlm/communications/direct-messages', {
      method: 'POST',
      body: JSON.stringify({ senderId: userId, recipientId: 'test-recipient-456', content: 'Test DM from dashboard' }),
    }))

    // 11: Create Scheduled Message
    const scheduledFor = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    const schedResult = await run(11, () => apiFetch('/api/mlm/communication/scheduled-messages', {
      method: 'POST',
      body: JSON.stringify({ channelId, userId, content: 'Scheduled test message', scheduledFor }),
    }))
    scheduledMessageId = schedResult.response?.data?.id ?? schedResult.response?.id ?? null

    // 12: Get Scheduled Messages
    await run(12, () => apiFetch(`/api/mlm/communication/scheduled-messages?userId=${userId}`))

    // 13: Cancel Scheduled Message
    if (scheduledMessageId) {
      await run(13, () => apiFetch(`/api/mlm/communication/scheduled-messages?messageId=${scheduledMessageId}`, { method: 'DELETE' }))
    } else {
      updateTest(13, { status: 'skipped', error: 'Skipped: Create Scheduled Message failed' })
    }

    // 14: Upload File
    await run(14, async () => {
      const file = new File(['test file content for upload'], 'test.txt', { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('channelId', channelId!)
      const res = await fetch('/api/mlm/communication/upload', { method: 'POST', body: formData })
      let response: any = null
      try { response = await res.json() } catch {}
      const url: string = response?.url ?? ''
      const isSupabaseCDN = url.includes('supabase.co/storage')
      const isLocalPath = url.includes('/uploads/mlm-communication')
      const ok = res.ok && isSupabaseCDN
      const error = !res.ok
        ? `HTTP ${res.status}`
        : isLocalPath
        ? 'File saved to local disk, not Supabase Storage — configure your storage bucket'
        : !isSupabaseCDN
        ? 'URL is not a Supabase CDN URL'
        : undefined
      return { ok, httpStatus: res.status, response, error }
    })

    // 15: Persistence Check
    await run(15, async () => {
      const r = await apiFetch(`/api/mlm/communications/messages?channelId=${channelId}&userId=${userId}`)
      const found = Array.isArray(r.response?.data) && r.response.data.some((m: any) => m.content === 'Hello from test dashboard!')
      return { ...r, ok: r.ok && found, error: found ? undefined : 'Original message not found — data may not be persisting to Supabase' }
    })

    setIsRunning(false)
  }

  const getIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
      case 'fail': return <XCircle className="h-5 w-5 text-red-500 shrink-0" />
      case 'pending': return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin shrink-0" />
      case 'skipped': return <AlertTriangle className="h-5 w-5 text-gray-400 shrink-0" />
      default: return <AlertTriangle className="h-5 w-5 text-gray-400 shrink-0" />
    }
  }

  const getBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <Badge className="bg-green-500 text-white">Pass</Badge>
      case 'fail': return <Badge variant="destructive">Fail</Badge>
      case 'pending': return <Badge variant="secondary">Running...</Badge>
      case 'skipped': return <Badge variant="outline" className="text-gray-400">Skipped</Badge>
      default: return <Badge variant="outline">Not run</Badge>
    }
  }

  const passed = tests.filter(t => t.status === 'pass').length
  const failed = tests.filter(t => t.status === 'fail').length
  const skipped = tests.filter(t => t.status === 'skipped').length
  const avgTime = Math.round(
    tests.filter(t => t.responseTime).reduce((s, t) => s + (t.responseTime ?? 0), 0) /
    Math.max(tests.filter(t => t.responseTime).length, 1)
  )

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">🔌 Communication System Test Dashboard</h1>
        <p className="text-muted-foreground mt-1">Tests all MLM communication endpoints end-to-end against your live Supabase database.</p>
      </div>

      <div className="flex gap-3 items-center">
        <Input
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="Enter a real User ID from your Supabase users table"
          className="max-w-sm"
        />
        <Button onClick={runAllTests} disabled={isRunning || !userId.trim()} className="bg-blue-600 hover:bg-blue-700">
          {isRunning ? 'Running...' : 'Run All Tests'}
        </Button>
      </div>

      {tests.some(t => t.status !== 'unknown') && (
        <div className="grid grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Passed</p><p className="text-2xl font-bold text-green-500">{passed}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Failed</p><p className="text-2xl font-bold text-red-500">{failed}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Skipped</p><p className="text-2xl font-bold text-gray-400">{skipped}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Avg Time</p><p className="text-2xl font-bold text-blue-500">{avgTime}ms</p></CardContent></Card>
        </div>
      )}

      <div className="space-y-2">
        {tests.map((test, i) => (
          <Card key={i} className={`transition-shadow hover:shadow-md ${test.status === 'fail' ? 'border-red-500/50' : test.status === 'pass' ? 'border-green-500/30' : ''}`}> 
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getIcon(test.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">#{i + 1}</span>
                      <h3 className="font-semibold">{test.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{test.method} {test.url}</p>
                    {test.httpStatus && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        HTTP {test.httpStatus}{test.responseTime ? ` · ${test.responseTime}ms` : ''}
                      </p>
                    )}
                    {test.error && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{test.error}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {getBadge(test.status)}
                  {test.response && (
                    <Button size="sm" variant="ghost" onClick={() => toggleExpand(i)} className="h-7 px-2">
                      {test.expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
              </div>
              {test.expanded && test.response && (
                <pre className="mt-3 p-3 bg-muted rounded text-xs overflow-auto max-h-48 font-mono">
                  {JSON.stringify(test.response, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Tests run sequentially. Each test may depend on IDs from previous tests. Click ▶ on any card to see the raw response.
      </p>
    </div>
  )
}