"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Mic,
} from "lucide-react"
import { useMLMCommunications } from "@/hooks/useMLMCommunications"
import VoiceMessageModal from "@/components/mlm/communication/VoiceMessageModal"
import AudioAttachment from "@/components/mlm/communication/AudioAttachment"
import MessageBubble from "@/components/mlm/communication/MessageBubble"

export default function MLMCommunicationPage() {
  const {
    channels,
    selectedChannel,
    messages,
    users,
    isConnected,
    isLoading,
    error,
    typingUsers,
    onlineUsers,
    messageStatuses,
    selectChannel,
    sendMessage,
    sendTypingIndicator,
    sendReaction,
    addReaction,
    updatePresence,
    joinChannel,
    leaveChannel,
    loadMessages,
    loadChannels,
  } = useMLMCommunications()

  const [newMessage, setNewMessage] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filePreview, setFilePreview] = useState<{name: string, size: number, type: string}[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showMemberList, setShowMemberList] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle file selection
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

  // Remove file from selection
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreview = filePreview.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setFilePreview(newPreview)
  }

  // Send text message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedChannel) return

    try {
      // Process files for upload
      const processedFiles = selectedFiles.map(file => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }))

      await sendMessage(selectedChannel.id, newMessage.trim(), "text", processedFiles)
      
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


  // Format time helper
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

  // Get channel icon
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communication center...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
                  onClick={() => selectChannel(channel)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedChannel?.id === channel.id ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
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
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedMember(user.id)}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-left"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          onlineUsers.includes(user.id) ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.rank}</div>
                    </div>
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
              {selectedChannel && getChannelIcon(selectedChannel.type)}
              <div>
                <h3 className="font-semibold">{selectedChannel?.name}</h3>
                <p className="text-sm text-gray-600">{selectedChannel?.description}</p>
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
            {messages.map((message) => {
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onReaction={addReaction}
                  onReply={() => {}}
                  onForward={() => {}}
                  onPin={() => {}}
                  onStar={() => {}}
                  onDelete={() => {}}
                  currentUserId="550e8400-e29b-41d4-a716-446655440000"
                  isOwnMessage={message.sender.id === "550e8400-e29b-41d4-a716-446655440000"}
                />
              );
            })}
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
            
            {/* Voice Message Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVoiceModal(true)}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${selectedChannel?.name}...`}
                className="resize-none"
                rows={1}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={(!newMessage.trim() && selectedFiles.length === 0)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Voice Message Modal */}
      <VoiceMessageModal 
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />
    </div>
  )
}
