"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessagingService, type Conversation } from "@/lib/messaging"
import { Search, MessageSquare, AlertCircle } from "lucide-react"

interface ConversationListProps {
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
}

export function ConversationList({ selectedConversationId, onSelectConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = MessagingService.searchConversations(searchQuery)
      setFilteredConversations(filtered)
    } else {
      setFilteredConversations(conversations)
    }
  }, [searchQuery, conversations])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedConversations = MessagingService.getConversations()
      setConversations(updatedConversations)
    }, 10000) // Check for updates every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const loadConversations = () => {
    setIsLoading(true)
    try {
      const convs = MessagingService.getConversations()
      setConversations(convs)
      setFilteredConversations(convs)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      case "closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Messages</span>
          {conversations.some((c) => c.unreadCount > 0) && (
            <Badge variant="destructive" className="ml-auto">
              {conversations.reduce((total, c) => total + c.unreadCount, 0)}
            </Badge>
          )}
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant="ghost"
                  className={`w-full justify-start p-4 h-auto ${
                    selectedConversationId === conversation.id ? "bg-blue-50 border-r-2 border-blue-600" : ""
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="relative">
                      <img
                        src={conversation.attorneyAvatar || "/placeholder.svg"}
                        alt={conversation.attorneyName}
                        className="w-10 h-10 rounded-full"
                      />
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{conversation.attorneyName}</h4>
                        <div className="flex items-center space-x-1">
                          {getPriorityIcon(conversation.priority)}
                          <span className="text-xs text-gray-500">{formatTime(conversation.updatedAt)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate mb-1">{conversation.subject}</p>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage.senderType === "client" ? "You: " : ""}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={getStatusColor(conversation.status)} variant="outline">
                          {conversation.status}
                        </Badge>
                        {conversation.caseType && (
                          <Badge variant="outline" className="text-xs">
                            {conversation.caseType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
