"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessagingService, type Conversation } from "@/lib/messaging"
import { AttorneyMessagingService, type ClientInfo } from "@/lib/attorney-messaging"
import { Search, MessageSquare, AlertCircle, DollarSign } from "lucide-react"

interface AttorneyConversationListProps {
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
}

export function AttorneyConversationList({
  selectedConversationId,
  onSelectConversation,
}: AttorneyConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [clientInfoMap, setClientInfoMap] = useState<{ [clientId: string]: ClientInfo }>({})

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, priorityFilter, statusFilter, conversations])

  const loadConversations = () => {
    setIsLoading(true)
    try {
      const convs = MessagingService.getConversations()
      setConversations(convs)

      // Load client info for each conversation
      const clientMap: { [clientId: string]: ClientInfo } = {}
      convs.forEach((conv) => {
        const clientInfo = AttorneyMessagingService.getClientInfo(conv.clientId)
        if (clientInfo) {
          clientMap[conv.clientId] = clientInfo
        }
      })
      setClientInfoMap(clientMap)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = conversations

    // Search filter
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (conv) =>
          conv.clientName.toLowerCase().includes(lowercaseQuery) ||
          conv.subject.toLowerCase().includes(lowercaseQuery) ||
          conv.caseType?.toLowerCase().includes(lowercaseQuery),
      )
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((conv) => {
        const clientInfo = clientInfoMap[conv.clientId]
        return clientInfo?.priority === priorityFilter
      })
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((conv) => conv.status === statusFilter)
    }

    // Sort by priority and last message time
    filtered.sort((a, b) => {
      const clientA = clientInfoMap[a.clientId]
      const clientB = clientInfoMap[b.clientId]

      // Priority order: urgent > high > medium > low
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const priorityA = priorityOrder[clientA?.priority as keyof typeof priorityOrder] || 0
      const priorityB = priorityOrder[clientB?.priority as keyof typeof priorityOrder] || 0

      if (priorityA !== priorityB) {
        return priorityB - priorityA
      }

      // Then by last message time
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })

    setFilteredConversations(filtered)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  const getTotalUnread = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0)
  }

  const getUrgentCount = () => {
    return conversations.filter((conv) => {
      const clientInfo = clientInfoMap[conv.clientId]
      return clientInfo?.priority === "urgent"
    }).length
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Client Messages</span>
          </div>
          <div className="flex items-center space-x-2">
            {getTotalUnread() > 0 && <Badge variant="destructive">{getTotalUnread()}</Badge>}
            {getUrgentCount() > 0 && <Badge className="bg-red-100 text-red-800">{getUrgentCount()} urgent</Badge>}
          </div>
        </CardTitle>

        {/* Search and Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex space-x-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery || priorityFilter !== "all" || statusFilter !== "all"
                ? "No conversations match your filters"
                : "No conversations yet"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => {
                const clientInfo = clientInfoMap[conversation.clientId]
                return (
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
                          src={conversation.clientAvatar || "/placeholder.svg"}
                          alt={conversation.clientName}
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
                          <h4 className="font-medium text-gray-900 truncate">{conversation.clientName}</h4>
                          <div className="flex items-center space-x-1">
                            {clientInfo && getPriorityIcon(clientInfo.priority)}
                            <span className="text-xs text-gray-500">{formatTime(conversation.updatedAt)}</span>
                          </div>
                        </div>

                        <p className="text-sm font-medium text-gray-700 truncate mb-1">{conversation.subject}</p>

                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.senderType === "attorney" ? "You: " : ""}
                            {conversation.lastMessage.content}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1">
                            <Badge className={getStatusColor(conversation.status)} variant="outline">
                              {conversation.status}
                            </Badge>
                            {clientInfo && (
                              <Badge className={getPriorityColor(clientInfo.priority)} variant="outline">
                                {clientInfo.priority}
                              </Badge>
                            )}
                          </div>

                          {conversation.caseType && (
                            <Badge variant="outline" className="text-xs">
                              {conversation.caseType}
                            </Badge>
                          )}
                        </div>

                        {clientInfo && clientInfo.creditScore && (
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Credit Score: {clientInfo.creditScore}
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
