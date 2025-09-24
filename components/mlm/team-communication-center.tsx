"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  Users,
  Search,
  Paperclip,
  Smile,
  MoreVertical,
  Pin,
  Reply,
  Forward,
  Download,
  Megaphone,
  Target,
  Award,
  FileText,
  ImageIcon,
} from "lucide-react"

interface TeamMember {
  id: string
  name: string
  avatar: string
  rank: string
  status: "online" | "away" | "offline"
  lastSeen: string
  performance: number
  directReports: number
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: Date
  type: "text" | "announcement" | "achievement" | "training" | "system"
  reactions: { emoji: string; count: number; users: string[] }[]
  replies: Message[]
  attachments?: { name: string; url: string; type: string }[]
  isPinned?: boolean
  isRead: boolean
}

interface Channel {
  id: string
  name: string
  description: string
  type: "general" | "announcements" | "training" | "achievements" | "private"
  memberCount: number
  unreadCount: number
  lastMessage?: Message
  isPrivate: boolean
}

export function TeamCommunicationCenter() {
  const [selectedChannel, setSelectedChannel] = useState("general")
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMemberList, setShowMemberList] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filePreview, setFilePreview] = useState<{name: string, size: number, type: string}[]>([])
  const [messages, setMessages] = useState<{ [channelId: string]: Message[] }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const teamMembers: TeamMember[] = [
    {
      id: "member-1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      rank: "Director",
      status: "online",
      lastSeen: "now",
      performance: 95,
      directReports: 12,
    },
    {
      id: "member-2",
      name: "Mike Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40&text=MR",
      rank: "Manager",
      status: "online",
      lastSeen: "5 min ago",
      performance: 88,
      directReports: 8,
    },
    {
      id: "member-3",
      name: "Lisa Chen",
      avatar: "/placeholder.svg?height=40&width=40&text=LC",
      rank: "Consultant",
      status: "away",
      lastSeen: "1 hour ago",
      performance: 76,
      directReports: 4,
    },
    {
      id: "member-4",
      name: "David Wilson",
      avatar: "/placeholder.svg?height=40&width=40&text=DW",
      rank: "Associate",
      status: "offline",
      lastSeen: "3 hours ago",
      performance: 62,
      directReports: 2,
    },
    {
      id: "member-5",
      name: "Emily Davis",
      avatar: "/placeholder.svg?height=40&width=40&text=ED",
      rank: "Manager",
      status: "online",
      lastSeen: "now",
      performance: 91,
      directReports: 6,
    },
  ]

  const channels: Channel[] = [
    {
      id: "general",
      name: "General Discussion",
      description: "Main team communication channel",
      type: "general",
      memberCount: 47,
      unreadCount: 3,
      isPrivate: false,
    },
    {
      id: "announcements",
      name: "Announcements",
      description: "Important team announcements and updates",
      type: "announcements",
      memberCount: 47,
      unreadCount: 1,
      isPrivate: false,
    },
    {
      id: "training",
      name: "Training & Development",
      description: "Training resources and discussions",
      type: "training",
      memberCount: 35,
      unreadCount: 0,
      isPrivate: false,
    },
    {
      id: "achievements",
      name: "Achievements & Recognition",
      description: "Celebrate team wins and milestones",
      type: "achievements",
      memberCount: 47,
      unreadCount: 5,
      isPrivate: false,
    },
    {
      id: "leadership",
      name: "Leadership Team",
      description: "Private channel for team leaders",
      type: "private",
      memberCount: 8,
      unreadCount: 2,
      isPrivate: true,
    },
  ]

  // Initialize messages state with static data
  useEffect(() => {
    const initialMessages: { [channelId: string]: Message[] } = {
    general: [
      {
        id: "msg-1",
        senderId: "member-1",
        senderName: "Sarah Johnson",
        senderAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
        content:
          "Great job everyone on this month's performance! We're ahead of our targets by 15%. Keep up the excellent work! 🎉",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: "text",
        reactions: [
          { emoji: "🎉", count: 8, users: ["member-2", "member-3", "member-4", "member-5"] },
          { emoji: "👏", count: 5, users: ["member-2", "member-4"] },
        ],
        replies: [],
        isRead: true,
      },
      {
        id: "msg-2",
        senderId: "member-2",
        senderName: "Mike Rodriguez",
        senderContent:
          "Thanks Sarah! The new prospecting techniques from last week's training are really paying off. My conversion rate is up 25%!",
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        type: "text",
        reactions: [{ emoji: "🚀", count: 3, users: ["member-1", "member-3"] }],
        replies: [],
        isRead: true,
      },
      {
        id: "msg-3",
        senderId: "system",
        senderName: "System",
        senderAvatar: "/placeholder.svg?height=40&width=40&text=S",
        content: "🏆 Mike Rodriguez just achieved Manager rank! Congratulations on this amazing milestone!",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: "achievement",
        reactions: [{ emoji: "🏆", count: 12, users: ["member-1", "member-3", "member-4", "member-5"] }],
        replies: [],
        isRead: true,
      },
      {
        id: "msg-4",
        senderId: "member-3",
        senderName: "Lisa Chen",
        senderAvatar: "/placeholder.svg?height=40&width=40&text=LC",
        content:
          "Question about the new commission structure - when does it take effect? I want to make sure I'm calculating everything correctly for my team.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: "text",
        reactions: [],
        replies: [
          {
            id: "reply-1",
            senderId: "member-1",
            senderName: "Sarah Johnson",
            senderAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
            content: "It takes effect at the beginning of next month. I'll send you the detailed breakdown in a DM.",
            timestamp: new Date(Date.now() - 25 * 60 * 1000),
            type: "text",
            reactions: [],
            replies: [],
            isRead: true,
          },
        ],
        isRead: false,
      },
      {
        id: "msg-5",
        senderId: "member-4",
        senderName: "David Wilson",
        senderAvatar: "/placeholder.svg?height=40&width=40&text=DW",
        content:
          "Just finished the Advanced Sales Training module. The objection handling techniques are game-changers! 💪",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: "training",
        reactions: [{ emoji: "💪", count: 4, users: ["member-1", "member-2", "member-5"] }],
        replies: [],
        isRead: false,
      },
    ],
    announcements: [
      {
        id: "ann-1",
        senderId: "member-1",
        senderName: "Sarah Johnson",
        senderAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
        content:
          "📢 IMPORTANT: New MLM compliance training is now mandatory for all team members. Please complete by end of week. Link in training channel.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        type: "announcement",
        reactions: [{ emoji: "👍", count: 15, users: ["member-2", "member-3", "member-4", "member-5"] }],
        replies: [],
        isPinned: true,
        isRead: false,
      },
      {
        id: "ann-2",
        senderId: "system",
        senderName: "System",
        senderAvatar: "/placeholder.svg?height=40&width=40&text=S",
        content:
          "🎯 Monthly team meeting scheduled for Friday 3PM EST. Agenda: Q1 results, new product launch, and rank advancement opportunities.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        type: "announcement",
        reactions: [],
        replies: [],
        isPinned: true,
        isRead: true,
      },
    ],
    achievements: [
      {
        id: "ach-1",
        senderId: "system",
        senderName: "System",
        senderAvatar: "/placeholder.svg?height=40&width=40&text=S",
        content: "🌟 Emily Davis just hit $10K in monthly commissions! Outstanding performance!",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: "achievement",
        reactions: [{ emoji: "🌟", count: 18, users: ["member-1", "member-2", "member-3", "member-4"] }],
        replies: [],
        isRead: false,
      },
      {
        id: "ach-2",
        senderId: "system",
        senderName: "System",
        senderAvatar: "/placeholder.svg?height=40&width=40&text=S",
        content: "🏆 Team milestone achieved: 500+ active customers! Bonus pool activated for all members!",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        type: "achievement",
        reactions: [{ emoji: "🎉", count: 25, users: ["member-1", "member-2", "member-3", "member-4", "member-5"] }],
        replies: [],
        isRead: false,
      },
    ],
    }
    
    setMessages(initialMessages)
  }, [])

  const currentChannel = channels.find((c) => c.id === selectedChannel)
  const currentMessages = messages[selectedChannel] || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(files)
      const preview = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type.startsWith('image/') ? 'image' : file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'other'
      }))
      setFilePreview(preview)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreview = filePreview.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setFilePreview(newPreview)
  }

  const uploadFile = async (file: File): Promise<{url: string, id: string}> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload/message-attachment', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload file')
    }
    
    return response.json()
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return

    try {
      let attachments: { name: string; url: string; type: string }[] = []
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const uploadResult = await uploadFile(file)
          return {
            name: file.name,
            url: uploadResult.url,
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'other'
          }
        })
        
        attachments = await Promise.all(uploadPromises)
      }

      const message: Message = {
        id: `msg-${Date.now()}`,
        senderId: "current-user",
        senderName: "You",
        senderAvatar: "/placeholder.svg?height=40&width=40&text=Y",
        content: newMessage,
        timestamp: new Date(),
        type: "text",
        reactions: [],
        replies: [],
        attachments: attachments.length > 0 ? attachments : undefined,
        isRead: true,
      }

      // Add message to the current channel
      setMessages(prev => ({
        ...prev,
        [selectedChannel]: [...(prev[selectedChannel] || []), message]
      }))
      
      setNewMessage("")
      setSelectedFiles([])
      setFilePreview([])
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "announcements":
        return <Megaphone className="h-4 w-4" />
      case "training":
        return <Target className="h-4 w-4" />
      case "achievements":
        return <Award className="h-4 w-4" />
      case "private":
        return <Users className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} min ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Team Communication</h2>
            <Button size="sm" variant="outline" onClick={() => setShowMemberList(!showMemberList)}>
              <Users className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">CHANNELS</h3>
            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedChannel === channel.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getChannelIcon(channel.type)}
                    <div>
                      <div className="font-medium">{channel.name}</div>
                      <div className="text-xs text-gray-500">{channel.memberCount} members</div>
                    </div>
                  </div>
                  {channel.unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">{channel.unreadCount}</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Team Members */}
          {showMemberList && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">TEAM MEMBERS</h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member.id)}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-left"
                  >
                    <div className="relative">
                      <img
                        src={member.avatar || "/placeholder.svg"}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.rank}</div>
                    </div>
                    <div className="text-xs text-gray-400">{member.performance}%</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getChannelIcon(currentChannel?.type || "general")}
              <div>
                <h3 className="font-semibold">{currentChannel?.name}</h3>
                <p className="text-sm text-gray-600">{currentChannel?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {currentMessages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex items-start space-x-3">
                  <img
                    src={message.senderAvatar || "/placeholder.svg"}
                    alt={message.senderName}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{message.senderName}</span>
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      {message.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
                      {!message.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>

                    <div
                      className={`p-3 rounded-lg ${
                        message.type === "announcement"
                          ? "bg-yellow-50 border border-yellow-200"
                          : message.type === "achievement"
                            ? "bg-green-50 border border-green-200"
                            : message.type === "training"
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-gray-50"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>

                      {message.attachments && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded border">
                              {attachment.type === "document" ? (
                                <FileText className="h-4 w-4 text-blue-600" />
                              ) : attachment.type === "image" ? (
                                <ImageIcon className="h-4 w-4 text-green-600" />
                              ) : (
                                <Paperclip className="h-4 w-4 text-gray-400" />
                              )}
                              <div 
                                className="flex-1 min-w-0 cursor-pointer hover:opacity-80"
                                onClick={() => {
                                  // Open file in new tab
                                  window.open(attachment.url, '_blank')
                                }}
                              >
                                <span className="text-sm font-medium">{attachment.name}</span>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  // Open file in new tab
                                  window.open(attachment.url, '_blank')
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reactions */}
                    {message.reactions.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
                        {message.reactions.map((reaction, index) => (
                          <button
                            key={index}
                            className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200"
                          >
                            <span>{reaction.emoji}</span>
                            <span>{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Replies */}
                    {message.replies.length > 0 && (
                      <div className="mt-3 ml-4 space-y-2">
                        {message.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-2">
                            <img
                              src={reply.senderAvatar || "/placeholder.svg"}
                              alt={reply.senderName}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-xs">{reply.senderName}</span>
                                <span className="text-xs text-gray-500">{formatTime(reply.timestamp)}</span>
                              </div>
                              <p className="text-sm bg-white p-2 rounded">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Smile className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Reply className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Forward className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* File Preview */}
        {filePreview.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Selected Files:</p>
              {filePreview.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded-lg border">
                  {file.type === "document" ? (
                    <FileText className="h-4 w-4 text-blue-600" />
                  ) : file.type === "image" ? (
                    <ImageIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <FileText className="h-4 w-4 text-gray-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-red-100"
                    onClick={() => removeFile(index)}
                  >
                    <span className="text-red-600">×</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end space-x-2">
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                id="mlm-file-upload"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${currentChannel?.name}...`}
                className="resize-none"
                rows={1}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={(!newMessage.trim() && selectedFiles.length === 0)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Member Details Sidebar */}
      {selectedMember && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Member Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>
              ×
            </Button>
          </div>

          {(() => {
            const member = teamMembers.find((m) => m.id === selectedMember)
            if (!member) return null

            return (
              <div className="space-y-4">
                <div className="text-center">
                  <img
                    src={member.avatar || "/placeholder.svg"}
                    alt={member.name}
                    className="w-16 h-16 rounded-full mx-auto mb-2"
                  />
                  <h4 className="font-semibold">{member.name}</h4>
                  <Badge variant="outline">{member.rank}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`}></div>
                      <span className="text-sm capitalize">{member.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Performance:</span>
                    <span className="text-sm font-medium">{member.performance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Direct Reports:</span>
                    <span className="text-sm font-medium">{member.directReports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Seen:</span>
                    <span className="text-sm">{member.lastSeen}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Video Call
                  </Button>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
