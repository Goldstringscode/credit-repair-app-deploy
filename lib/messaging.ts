export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderType: "client" | "attorney"
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: Date
  read: boolean
  messageType: "text" | "file" | "system"
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: "document" | "image" | "other"
  size: number
}

export interface Conversation {
  id: string
  clientId: string
  attorneyId: string
  attorneyName: string
  attorneyAvatar?: string
  clientName: string
  clientAvatar?: string
  subject: string
  status: "active" | "archived" | "closed"
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
  caseType?: string
  priority: "low" | "medium" | "high" | "urgent"
}

// Mock current user (in real app, this would come from auth)
export const currentUser = {
  id: "client-123",
  name: "John Doe",
  type: "client" as const,
  avatar: "/placeholder.svg?height=40&width=40&text=JD",
}

// Mock conversations data
export const mockConversations: Conversation[] = [
  {
    id: "conv-001",
    clientId: "client-123",
    attorneyId: "sarah-johnson",
    attorneyName: "Sarah Johnson",
    attorneyAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
    clientName: "John Doe",
    clientAvatar: "/placeholder.svg?height=40&width=40&text=JD",
    subject: "Credit Report Dispute - Experian",
    status: "active",
    unreadCount: 2,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    caseType: "Credit Report Dispute",
    priority: "high",
    lastMessage: {
      id: "msg-005",
      conversationId: "conv-001",
      senderId: "sarah-johnson",
      senderType: "attorney",
      senderName: "Sarah Johnson",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
      content:
        "I've reviewed your case and we have strong grounds for dispute. I'll file the formal complaint tomorrow.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      messageType: "text",
    },
  },
  {
    id: "conv-002",
    clientId: "client-123",
    attorneyId: "michael-chen",
    attorneyName: "Michael Chen",
    attorneyAvatar: "/placeholder.svg?height=40&width=40&text=MC",
    clientName: "John Doe",
    clientAvatar: "/placeholder.svg?height=40&width=40&text=JD",
    subject: "Identity Theft Recovery",
    status: "active",
    unreadCount: 0,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    caseType: "Identity Theft",
    priority: "urgent",
    lastMessage: {
      id: "msg-010",
      conversationId: "conv-002",
      senderId: "client-123",
      senderType: "client",
      senderName: "John Doe",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=JD",
      content: "Thank you for your help with the identity theft case. The fraudulent accounts have been removed.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      messageType: "text",
    },
  },
]

// Mock messages data
export const mockMessages: { [conversationId: string]: Message[] } = {
  "conv-001": [
    {
      id: "msg-001",
      conversationId: "conv-001",
      senderId: "client-123",
      senderType: "client",
      senderName: "John Doe",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=JD",
      content:
        "Hi Sarah, I need help with disputing some incorrect items on my Experian credit report. There are 3 accounts that don't belong to me.",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      read: true,
      messageType: "text",
    },
    {
      id: "msg-002",
      conversationId: "conv-001",
      senderId: "sarah-johnson",
      senderType: "attorney",
      senderName: "Sarah Johnson",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
      content:
        "Hello John! I'd be happy to help you with your credit report dispute. Can you please send me copies of your credit report and any documentation you have about these accounts?",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      read: true,
      messageType: "text",
    },
    {
      id: "msg-003",
      conversationId: "conv-001",
      senderId: "client-123",
      senderType: "client",
      senderName: "John Doe",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=JD",
      content: "I've attached my credit report and the police report I filed for identity theft.",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      read: true,
      messageType: "file",
      attachments: [
        {
          id: "att-001",
          name: "experian-credit-report.pdf",
          url: "/documents/experian-credit-report.pdf",
          type: "document",
          size: 245760,
        },
        {
          id: "att-002",
          name: "police-report-identity-theft.pdf",
          url: "/documents/police-report.pdf",
          type: "document",
          size: 156432,
        },
      ],
    },
    {
      id: "msg-004",
      conversationId: "conv-001",
      senderId: "sarah-johnson",
      senderType: "attorney",
      senderName: "Sarah Johnson",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
      content:
        "Perfect! I've reviewed the documents. The police report will be very helpful. I can see the fraudulent accounts clearly. Let me prepare the dispute letters.",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true,
      messageType: "text",
    },
    {
      id: "msg-005",
      conversationId: "conv-001",
      senderId: "sarah-johnson",
      senderType: "attorney",
      senderName: "Sarah Johnson",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
      content:
        "I've reviewed your case and we have strong grounds for dispute. I'll file the formal complaint tomorrow.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      messageType: "text",
    },
  ],
  "conv-002": [
    {
      id: "msg-006",
      conversationId: "conv-002",
      senderId: "client-123",
      senderType: "client",
      senderName: "John Doe",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=JD",
      content:
        "Michael, I discovered several fraudulent accounts on my credit report. I need urgent help to get these removed.",
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      read: true,
      messageType: "text",
    },
    {
      id: "msg-007",
      conversationId: "conv-002",
      senderId: "michael-chen",
      senderType: "attorney",
      senderName: "Michael Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=MC",
      content:
        "I understand the urgency. Identity theft cases require immediate action. I'll start working on this right away. Please send me all relevant documentation.",
      timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      read: true,
      messageType: "text",
    },
    {
      id: "msg-008",
      conversationId: "conv-002",
      senderId: "michael-chen",
      senderType: "attorney",
      senderName: "Michael Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=MC",
      content:
        "I've filed disputes with all three bureaus and contacted the fraudulent creditors directly. We should see results within 30 days.",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      read: true,
      messageType: "text",
    },
    {
      id: "msg-009",
      conversationId: "conv-002",
      senderId: "michael-chen",
      senderType: "attorney",
      senderName: "Michael Chen",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=MC",
      content:
        "Great news! All three fraudulent accounts have been successfully removed from your credit reports. Your score should improve significantly.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
      messageType: "text",
    },
    {
      id: "msg-010",
      conversationId: "conv-002",
      senderId: "client-123",
      senderType: "client",
      senderName: "John Doe",
      senderAvatar: "/placeholder.svg?height=40&width=40&text=JD",
      content: "Thank you for your help with the identity theft case. The fraudulent accounts have been removed.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      messageType: "text",
    },
  ],
}

// Messaging service functions
export class MessagingService {
  static getConversations(): Conversation[] {
    return mockConversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  static getConversation(id: string): Conversation | undefined {
    return mockConversations.find((conv) => conv.id === id)
  }

  static getMessages(conversationId: string): Message[] {
    return mockMessages[conversationId] || []
  }

  static sendMessage(conversationId: string, content: string, attachments?: MessageAttachment[]): Message {
    const conversation = this.getConversation(conversationId)
    if (!conversation) throw new Error("Conversation not found")

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: currentUser.id,
      senderType: currentUser.type,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      timestamp: new Date(),
      read: true,
      messageType: attachments && attachments.length > 0 ? "file" : "text",
      attachments,
    }

    // Add to messages
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = []
    }
    mockMessages[conversationId].push(newMessage)

    // Update conversation
    conversation.lastMessage = newMessage
    conversation.updatedAt = new Date()

    return newMessage
  }

  static markAsRead(conversationId: string): void {
    const conversation = this.getConversation(conversationId)
    if (conversation) {
      conversation.unreadCount = 0
    }

    const messages = this.getMessages(conversationId)
    messages.forEach((message) => {
      if (message.senderId !== currentUser.id) {
        message.read = true
      }
    })
  }

  static createConversation(attorneyId: string, subject: string, initialMessage: string): Conversation {
    // In a real app, this would fetch attorney details from the database
    const attorney = {
      id: attorneyId,
      name: "Attorney Name",
      avatar: "/placeholder.svg?height=40&width=40&text=A",
    }

    const newConversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientId: currentUser.id,
      attorneyId,
      attorneyName: attorney.name,
      attorneyAvatar: attorney.avatar,
      clientName: currentUser.name,
      clientAvatar: currentUser.avatar,
      subject,
      status: "active",
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: "medium",
    }

    mockConversations.push(newConversation)

    // Send initial message
    this.sendMessage(newConversation.id, initialMessage)

    return newConversation
  }

  static searchConversations(query: string): Conversation[] {
    const lowercaseQuery = query.toLowerCase()
    return mockConversations.filter(
      (conv) =>
        conv.attorneyName.toLowerCase().includes(lowercaseQuery) ||
        conv.subject.toLowerCase().includes(lowercaseQuery) ||
        conv.caseType?.toLowerCase().includes(lowercaseQuery),
    )
  }

  static getUnreadCount(): number {
    return mockConversations.reduce((total, conv) => total + conv.unreadCount, 0)
  }
}
