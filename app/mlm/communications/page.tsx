"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Hash,
  Plus,
  Send,
  Users,
  Lock,
  Loader2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

const DEMO_USER_ID = "demo-user-1"

interface Channel {
  id: string
  name: string
  type: string
  description?: string
  unread_count?: number
  is_private?: boolean
}

interface Message {
  id: string
  sender_id: string
  sender_name?: string
  content: string
  created_at: string
}

interface Conversation {
  id: string
  participant_id?: string
  participant_name?: string
  last_message?: string
  unread_count?: number
  updated_at?: string
}

export default function MLMCommunicationsPage() {
  // Channels state
  const [channels, setChannels] = useState<Channel[]>([])
  const [channelsLoading, setChannelsLoading] = useState(true)
  const [channelsError, setChannelsError] = useState("")

  // Selected channel + messages
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [selectedChannelName, setSelectedChannelName] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  // Direct messages state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [convsLoading, setConvsLoading] = useState(true)
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [dmMessages, setDmMessages] = useState<Message[]>([])
  const [dmLoading, setDmLoading] = useState(false)

  // Message input
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  // Create channel modal
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelType, setNewChannelType] = useState("general")
  const [newChannelDesc, setNewChannelDesc] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  // Sidebar section toggles
  const [channelsSectionOpen, setChannelsSectionOpen] = useState(true)
  const [dmSectionOpen, setDmSectionOpen] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Which view is active: 'channel' or 'dm'
  const [activeView, setActiveView] = useState<"channel" | "dm">("channel")

  // Fetch channels on mount
  useEffect(() => {
    fetchChannels()
    fetchConversations()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, dmMessages])

  async function fetchChannels() {
    setChannelsLoading(true)
    setChannelsError("")
    try {
      const res = await fetch(`/api/mlm/communications/channels?userId=${DEMO_USER_ID}`)
      const data = await res.json()
      if (data.success) {
        setChannels(data.data || [])
      } else {
        setChannelsError(data.error || "Failed to load channels")
      }
    } catch {
      setChannelsError("Failed to load channels")
    } finally {
      setChannelsLoading(false)
    }
  }

  async function fetchMessages(channelId: string) {
    setMessagesLoading(true)
    try {
      const res = await fetch(
        `/api/mlm/communications/messages?channelId=${channelId}&userId=${DEMO_USER_ID}`
      )
      const data = await res.json()
      if (data.success) {
        setMessages(data.data || [])
      } else {
        setMessages([])
      }
    } catch {
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  async function fetchConversations() {
    setConvsLoading(true)
    try {
      const res = await fetch(`/api/mlm/communications/direct-messages?userId=${DEMO_USER_ID}`)
      const data = await res.json()
      if (data.success) {
        setConversations(data.data || [])
      } else {
        setConversations([])
      }
    } catch {
      setConversations([])
    } finally {
      setConvsLoading(false)
    }
  }

  async function fetchDmMessages(conversationId: string) {
    setDmLoading(true)
    try {
      const res = await fetch(
        `/api/mlm/communications/direct-messages?userId=${DEMO_USER_ID}&conversationId=${conversationId}`
      )
      const data = await res.json()
      if (data.success) {
        setDmMessages(data.data || [])
      } else {
        setDmMessages([])
      }
    } catch {
      setDmMessages([])
    } finally {
      setDmLoading(false)
    }
  }

  function selectChannel(channel: Channel) {
    setSelectedChannelId(channel.id)
    setSelectedChannelName(channel.name)
    setActiveView("channel")
    setSelectedConvId(null)
    fetchMessages(channel.id)
  }

  function selectConversation(conv: Conversation) {
    setSelectedConvId(conv.id)
    setActiveView("dm")
    setSelectedChannelId(null)
    fetchDmMessages(conv.id)
  }

  async function sendMessage() {
    if (!newMessage.trim()) return
    if (activeView === "channel" && !selectedChannelId) return
    if (activeView === "dm" && !selectedConvId) return

    setSending(true)
    try {
      if (activeView === "channel") {
        const res = await fetch("/api/mlm/communications/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelId: selectedChannelId,
            senderId: DEMO_USER_ID,
            content: newMessage.trim(),
          }),
        })
        const data = await res.json()
        if (data.success && data.data) {
          setMessages((prev) => [...prev, data.data])
        }
      } else {
        const conv = conversations.find((c) => c.id === selectedConvId)
        const recipientId = conv?.participant_id
        if (!recipientId) {
          setSending(false)
          return
        }
        const res = await fetch("/api/mlm/communications/direct-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: DEMO_USER_ID,
            recipientId,
            content: newMessage.trim(),
          }),
        })
        const data = await res.json()
        if (data.success && data.data?.message) {
          setDmMessages((prev) => [...prev, data.data.message])
        }
      }
      setNewMessage("")
    } catch {
      // silent – the user can retry
    } finally {
      setSending(false)
    }
  }

  async function createChannel() {
    if (!newChannelName.trim()) return
    setCreating(true)
    setCreateError("")
    try {
      const res = await fetch("/api/mlm/communications/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newChannelName.trim(),
          type: newChannelType,
          description: newChannelDesc.trim(),
          createdBy: DEMO_USER_ID,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreateChannel(false)
        setNewChannelName("")
        setNewChannelType("general")
        setNewChannelDesc("")
        await fetchChannels()
      } else {
        setCreateError(data.error || "Failed to create channel")
      }
    } catch {
      setCreateError("Failed to create channel")
    } finally {
      setCreating(false)
    }
  }

  function formatTime(ts: string) {
    if (!ts) return ""
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  const activeMessages = activeView === "channel" ? messages : dmMessages
  const activeLoading = activeView === "channel" ? messagesLoading : dmLoading

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-white" />
              <h2 className="text-sm font-bold text-white">Communications</h2>
            </div>
            <Link href="/mlm/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-1 h-auto">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* Channels section */}
          <div className="mb-2">
            <button
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
              onClick={() => setChannelsSectionOpen((v) => !v)}
            >
              <span>Channels</span>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-5 w-5 text-gray-400 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCreateChannel(true)
                  }}
                  title="Create Channel"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                {channelsSectionOpen ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </div>
            </button>

            {channelsSectionOpen && (
              <div>
                {channelsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                ) : channelsError ? (
                  <p className="px-3 py-2 text-xs text-red-500">{channelsError}</p>
                ) : channels.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400">No channels yet</p>
                ) : (
                  channels.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => selectChannel(ch)}
                      className={`w-full flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md mx-1 transition-colors ${
                        selectedChannelId === ch.id
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {ch.is_private ? (
                        <Lock className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      ) : (
                        <Hash className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      )}
                      <span className="truncate flex-1 text-left">{ch.name}</span>
                      {(ch.unread_count ?? 0) > 0 ? (
                        <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 h-4 min-w-4">
                          {ch.unread_count}
                        </Badge>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Direct Messages section */}
          <div>
            <button
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
              onClick={() => setDmSectionOpen((v) => !v)}
            >
              <span>Direct Messages</span>
              {dmSectionOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>

            {dmSectionOpen && (
              <div>
                {convsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400">No direct messages</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`w-full flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md mx-1 transition-colors ${
                        selectedConvId === conv.id
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Users className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                      <span className="truncate flex-1 text-left">
                        {conv.participant_name || conv.participant_id || "Unknown"}
                      </span>
                      {(conv.unread_count ?? 0) > 0 ? (
                        <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 h-4 min-w-4">
                          {conv.unread_count}
                        </Badge>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChannelId || selectedConvId ? (
          <>
            {/* Channel / DM header */}
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
              {activeView === "channel" ? (
                <Hash className="h-4 w-4 text-gray-400 mr-2" />
              ) : (
                <Users className="h-4 w-4 text-gray-400 mr-2" />
              )}
              <h3 className="font-semibold text-gray-800 text-sm">
                {activeView === "channel"
                  ? selectedChannelName
                  : conversations.find((c) => c.id === selectedConvId)?.participant_name ||
                    "Direct Message"}
              </h3>
            </div>

            {/* Messages feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : activeMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <MessageSquare className="h-10 w-10 mb-3" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs mt-1">Be the first to say something!</p>
                </div>
              ) : (
                activeMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {(msg.sender_name?.trim() || msg.sender_id?.trim() || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {msg.sender_name || msg.sender_id}
                        </span>
                        <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-0.5 break-words">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="px-4 py-3 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder={
                    activeView === "channel"
                      ? `Message #${selectedChannelName}`
                      : "Send a message…"
                  }
                  className="flex-1 text-sm"
                  disabled={sending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state — nothing selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
            <MessageSquare className="h-16 w-16 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Welcome to Communications</h3>
            <p className="text-sm max-w-xs">
              Select a channel or direct message from the sidebar to start chatting with your team.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setShowCreateChannel(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create a Channel
            </Button>
          </div>
        )}
      </div>

      {/* Create Channel modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Hash className="h-4 w-4 text-blue-600" />
                <span>Create Channel</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Channel Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. general, announcements"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Type</label>
                <select
                  value={newChannelType}
                  onChange={(e) => setNewChannelType(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="team">Team</option>
                  <option value="direct">Direct</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <Input
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Optional description"
                  className="text-sm"
                />
              </div>
              {createError && (
                <p className="text-xs text-red-500">{createError}</p>
              )}
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreateChannel(false)
                    setCreateError("")
                    setNewChannelName("")
                    setNewChannelDesc("")
                    setNewChannelType("general")
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={createChannel}
                  disabled={!newChannelName.trim() || creating}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
