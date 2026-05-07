'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, TrendingUp, DollarSign, Users } from 'lucide-react'

interface Notification {
  id: string
  type: 'commission' | 'rank' | 'team' | 'system' | 'payout' | 'info'
  title: string
  message: string
  read: boolean
  created_at: string
  action_url?: string
}

const TYPE_ICON: Record<string, any> = {
  commission: DollarSign,
  rank: TrendingUp,
  team: Users,
  payout: DollarSign,
  system: Info,
  info: Info,
  alert: AlertTriangle,
}

const TYPE_COLOR: Record<string, string> = {
  commission: 'bg-green-100 text-green-700',
  rank: 'bg-yellow-100 text-yellow-800',
  team: 'bg-blue-100 text-blue-700',
  payout: 'bg-purple-100 text-purple-700',
  system: 'bg-gray-100 text-gray-600',
  info: 'bg-gray-100 text-gray-600',
  alert: 'bg-red-100 text-red-700',
}

export default function MLMNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    fetch('/api/mlm/notifications', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setNotifications(d.notifications || [])
        else if (d.status === 404) {
          // No MLM account — use general notifications as fallback
          setNotifications([])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await fetch('/api/mlm/notifications', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_all_read' }),
    }).catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = async (id: string) => {
    await fetch('/api/mlm/notifications', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read', id }),
    }).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const deleteNotif = async (id: string) => {
    await fetch('/api/mlm/notifications?id=' + id, {
      method: 'DELETE', credentials: 'include',
    }).catch(() => {})
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const displayed = filter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600"/>
            Notifications
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Your MLM activity and updates</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['all','unread'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${filter===f?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
                {f}{f==='unread'&&unreadCount>0?' ('+unreadCount+')':''}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <CheckCheck className="h-4 w-4"/>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {displayed.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-500 font-medium">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === 'unread' ? "You're all caught up!" : 'Activity from your team and earnings will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(n => {
            const Icon = TYPE_ICON[n.type] || Info
            const colorClass = TYPE_COLOR[n.type] || TYPE_COLOR.info
            return (
              <div key={n.id}
                className={`bg-white rounded-xl border transition-all ${n.read ? 'border-gray-100' : 'border-blue-200 shadow-sm'}`}>
                <div className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-5 w-5"/>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {n.title}
                          {!n.read && <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"/>}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.created_at).toLocaleString([], {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!n.read && (
                          <button onClick={() => markRead(n.id)} title="Mark as read"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Check className="h-4 w-4"/>
                          </button>
                        )}
                        <button onClick={() => deleteNotif(n.id)} title="Delete"
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4"/>
                        </button>
                      </div>
                    </div>
                    {n.action_url && (
                      <a href={n.action_url}
                        className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">
                        View details →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}