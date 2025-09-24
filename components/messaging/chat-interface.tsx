"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { MessagingService, type Message, type Conversation } from "@/lib/messaging"
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Download,
  FileText,
  ImageIcon,
  Clock,
  CheckCheck,
  Check,
} from "lucide-react"

interface ChatInterfaceProps {
  conversationId: string
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filePreview, setFilePreview] = useState<{name: string, size: number, type: string}[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadConversation()
    // Mark conversation as read
    MessagingService.markAsRead(conversationId)
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving new messages (in real app, this would be WebSocket)
      const updatedMessages = MessagingService.getMessages(conversationId)
      if (updatedMessages.length !== messages.length) {
        setMessages(updatedMessages)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [conversationId, messages.length])

  const loadConversation = () => {
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

      setConversation(conv)
      setMessages(msgs)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

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

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || isSending) return

    setIsSending(true)
    try {
      let attachments: MessageAttachment[] = []
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file, index) => {
          const uploadResult = await uploadFile(file)
          return {
            id: uploadResult.id,
            name: file.name,
            url: uploadResult.url,
            type: file.type.startsWith('image/') ? 'image' as const : 
                  file.type.includes('pdf') || file.type.includes('document') ? 'document' as const : 'other' as const,
            size: file.size
          }
        })
        
        attachments = await Promise.all(uploadPromises)
      }

      const message = MessagingService.sendMessage(conversationId, newMessage.trim(), attachments)
      
      // Immediately update the UI with the new message
      setMessages((prev) => [...prev, message])
      
      // Also update the conversation state
      setConversation(prev => prev ? {
        ...prev,
        lastMessage: message,
        updatedAt: new Date()
      } : null)
      
      setNewMessage("")
      setSelectedFiles([])
      setFilePreview([])
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast({
        title: "Message sent",
        description: "Your message has been delivered",
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!conversation) {
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
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={conversation.attorneyAvatar || "/placeholder.svg"}
                alt={conversation.attorneyName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <CardTitle className="text-lg">{conversation.attorneyName}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-600">{conversation.subject}</p>
                  <Badge className={getPriorityColor(conversation.priority)}>{conversation.priority}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {conversation.caseType}
                  </Badge>
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
                  className={`flex ${message.senderType === "client" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.senderType === "client" ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.senderType === "client" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {message.messageType === "file" && message.attachments && (
                        <div className="mb-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className={`flex items-center space-x-2 p-2 rounded ${
                                message.senderType === "client" ? "bg-blue-500" : "bg-gray-200"
                              }`}
                            >
                              {attachment.type === "document" ? (
                                <FileText className="h-4 w-4" />
                              ) : (
                                <ImageIcon className="h-4 w-4" />
                              )}
                              <div 
                                className="flex-1 min-w-0 cursor-pointer hover:opacity-80"
                                onClick={() => {
                                  // Open file in new tab
                                  window.open(attachment.url, '_blank')
                                }}
                              >
                                <p className="text-sm font-medium truncate">{attachment.name}</p>
                                <p className="text-xs opacity-75">{formatFileSize(attachment.size)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 ${
                                  message.senderType === "client" ? "hover:bg-blue-400" : "hover:bg-gray-300"
                                }`}
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
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div
                      className={`flex items-center mt-1 space-x-1 ${
                        message.senderType === "client" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      {message.senderType === "client" && (
                        <div className="text-gray-500">
                          {message.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`${message.senderType === "client" ? "order-1 mr-2" : "order-2 ml-2"}`}>
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

      {/* File Preview */}
      {filePreview.length > 0 && (
        <Card className="rounded-b-none border-b-0">
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Selected Files:</p>
              {filePreview.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  {file.type === "document" ? (
                    <FileText className="h-4 w-4 text-blue-600" />
                  ) : file.type === "image" ? (
                    <ImageIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <FileText className="h-4 w-4 text-gray-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
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
          </CardContent>
        </Card>
      )}

      {/* Message Input */}
      <Card className="rounded-t-none border-t-0">
        <CardContent className="p-4">
          <div className="flex items-end space-x-2">
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                id="file-upload"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-2 bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="resize-none"
                disabled={isSending}
              />
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending} 
              className="mb-2"
            >
              {isSending ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
