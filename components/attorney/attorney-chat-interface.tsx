"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MessagingService, type Message, type Conversation } from "@/lib/messaging"
import {
  AttorneyMessagingService,
  type ClientInfo,
  type CaseInfo,
  type MessageTemplate,
} from "@/lib/attorney-messaging"
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  User,
  FileText,
  Calendar,
  MessageSquare,
  LayoutTemplateIcon as Template,
  Save,
} from "lucide-react"

interface AttorneyChatInterfaceProps {
  conversationId: string
}

export function AttorneyChatInterface({ conversationId }: AttorneyChatInterfaceProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
  const [clientCases, setClientCases] = useState<CaseInfo[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadConversationData()
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversationData = async () => {
    setIsLoading(true)
    try {
      const conv = MessagingService.getConversation(conversationId)
      const msgs = MessagingService.getMessages(conversationId)

      if (!conv) {
        toast({
          title: "Error",
          description: "Conversation not found",
          variant: "destructive",
        })
        return
      }

      const client = AttorneyMessagingService.getClientInfo(conv.clientId)
      const cases = client ? AttorneyMessagingService.getClientCases(client.id) : []
      const messageTemplates = AttorneyMessagingService.getMessageTemplates()

      setConversation(conv)
      setMessages(msgs)
      setClientInfo(client || null)
      setClientCases(cases)
      setTemplates(messageTemplates)

      // Mark as read
      MessagingService.markAsRead(conversationId)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const message = MessagingService.sendMessage(conversationId, newMessage.trim())
      setMessages((prev) => [...prev, message])
      setNewMessage("")

      toast({
        title: "Message sent",
        description: "Your message has been delivered to the client",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template && clientInfo) {
      const variables = {
        "{clientName}": clientInfo.name,
        "{caseType}": clientCases[0]?.type || "your case",
        "{milestone}": "initial review",
        "{nextUpdate}": "next week",
        "{documentList}": "credit reports and identification",
        "{results}": "positive outcomes",
      }

      const content = AttorneyMessagingService.applyTemplate(template, variables)
      setNewMessage(content)
    }
  }

  const handleCaseStatusUpdate = (caseId: string, status: CaseInfo["status"]) => {
    AttorneyMessagingService.updateCaseStatus(caseId, status)
    toast({
      title: "Case Updated",
      description: `Case status changed to ${status}`,
    })
    // Reload case data
    loadConversationData()
  }

  const handleClientPriorityUpdate = (priority: ClientInfo["priority"]) => {
    if (clientInfo) {
      AttorneyMessagingService.updateClientPriority(clientInfo.id, priority)
      setClientInfo({ ...clientInfo, priority })
      toast({
        title: "Priority Updated",
        description: `Client priority set to ${priority}`,
      })
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
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
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "waiting_client":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!conversation || !clientInfo) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversation not found</h3>
          <p className="text-gray-600">The conversation you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-full">
      {/* Main Chat Area */}
      <div className="lg:col-span-2 flex flex-col">
        {/* Chat Header */}
        <Card className="rounded-b-none border-b-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={clientInfo.avatar || "/placeholder.svg"}
                  alt={clientInfo.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <CardTitle className="text-lg">{clientInfo.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-sm text-gray-600">{conversation.subject}</p>
                    <Badge className={getPriorityColor(clientInfo.priority)}>{clientInfo.priority}</Badge>
                  </div>
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
          </CardHeader>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 rounded-none border-t-0 border-b-0">
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === "attorney" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md ${message.senderType === "attorney" ? "order-2" : "order-1"}`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          message.senderType === "attorney" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div
                        className={`flex items-center mt-1 space-x-1 ${
                          message.senderType === "attorney" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                    <div className={`${message.senderType === "attorney" ? "order-1 mr-2" : "order-2 ml-2"}`}>
                      <img
                        src={message.senderAvatar || "/placeholder.svg"}
                        alt={message.senderName}
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Composer */}
        <Card className="rounded-t-none border-t-0">
          <CardContent className="p-4 space-y-4">
            {/* Template Selector */}
            <div className="flex items-center space-x-2">
              <Template className="h-4 w-4 text-gray-500" />
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message to the client..."
                className="min-h-[100px] resize-none"
                disabled={isSending}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client & Case Information Sidebar */}
      <div className="lg:col-span-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="client">Client</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Client Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={clientInfo.avatar || "/placeholder.svg"}
                    alt={clientInfo.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{clientInfo.name}</h3>
                    <p className="text-sm text-gray-600">{clientInfo.email}</p>
                    {clientInfo.phone && <p className="text-sm text-gray-600">{clientInfo.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Credit Score</p>
                    <p className="text-lg font-semibold">{clientInfo.creditScore || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Cases</p>
                    <p className="text-lg font-semibold">{clientInfo.totalCases}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Priority Level</p>
                  <Select
                    value={clientInfo.priority}
                    onValueChange={(value: ClientInfo["priority"]) => handleClientPriorityUpdate(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {clientInfo.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {clientInfo.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{clientInfo.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Active Cases</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {clientCases.map((case_) => (
                      <div key={case_.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{case_.title}</h4>
                          <Badge className={getStatusColor(case_.status)}>{case_.status.replace("_", " ")}</Badge>
                        </div>

                        <p className="text-xs text-gray-600 mb-3">{case_.type}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">Billed</p>
                            <p className="font-semibold">{formatCurrency(case_.totalBilled)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Hours</p>
                            <p className="font-semibold">{case_.actualHours}h</p>
                          </div>
                        </div>

                        {case_.deadline && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {case_.deadline.toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="mt-3 flex space-x-1">
                          <Select
                            value={case_.status}
                            onValueChange={(value: CaseInfo["status"]) => handleCaseStatusUpdate(case_.id, value)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="waiting_client">Waiting Client</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Case Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea placeholder="Add a note about this client or case..." className="min-h-[100px]" />
                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">Recent Notes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-700">Client provided all requested documentation promptly.</p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-700">Filed disputes with all three bureaus.</p>
                        <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
