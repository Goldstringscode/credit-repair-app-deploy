export interface AttorneyUser {
  id: string
  name: string
  email: string
  avatar?: string
  specialties: string[]
  barNumber: string
  state: string
  responseTime: number // average response time in hours
  rating: number
  totalCases: number
  activeCases: number
  status: "available" | "busy" | "away" | "offline"
  autoReply: boolean
  autoReplyMessage?: string
}

export interface ClientInfo {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  joinDate: Date
  totalCases: number
  currentCases: number
  creditScore?: number
  priority: "low" | "medium" | "high" | "urgent"
  tags: string[]
  notes?: string
}

export interface CaseInfo {
  id: string
  clientId: string
  attorneyId: string
  title: string
  type: string
  status: "new" | "in_progress" | "waiting_client" | "completed" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: Date
  updatedAt: Date
  deadline?: Date
  billingRate: number
  totalBilled: number
  estimatedHours: number
  actualHours: number
  documents: CaseDocument[]
  milestones: CaseMilestone[]
}

export interface CaseDocument {
  id: string
  name: string
  type: "contract" | "evidence" | "correspondence" | "report" | "other"
  url: string
  uploadedAt: Date
  uploadedBy: string
}

export interface CaseMilestone {
  id: string
  title: string
  description: string
  dueDate: Date
  completed: boolean
  completedAt?: Date
}

export interface MessageTemplate {
  id: string
  title: string
  content: string
  category: "greeting" | "follow_up" | "status_update" | "closing" | "custom"
  variables: string[] // e.g., ["{clientName}", "{caseType}"]
}

export interface AttorneyStats {
  totalMessages: number
  averageResponseTime: number
  clientSatisfaction: number
  casesCompleted: number
  revenue: number
  messagesThisWeek: number
  newClientsThisMonth: number
}

// Mock current attorney user
export const currentAttorney: AttorneyUser = {
  id: "sarah-johnson",
  name: "Sarah Johnson",
  email: "sarah@creditlawfirm.com",
  avatar: "/placeholder.svg?height=40&width=40&text=SJ",
  specialties: ["Credit Repair", "Consumer Protection", "FCRA Violations"],
  barNumber: "CA123456",
  state: "California",
  responseTime: 2.5,
  rating: 4.9,
  totalCases: 156,
  activeCases: 23,
  status: "available",
  autoReply: true,
  autoReplyMessage: "Thank you for your message. I'll respond within 24 hours during business days.",
}

// Mock client data — placeholder data for the attorney-side view.
// The real implementation would query actual clients from Supabase.
export const mockClients: { [clientId: string]: ClientInfo } = {
  "client-123": {
    id: "client-123",
    name: "Sample Client",
    email: "client@example.com",
    phone: "(555) 123-4567",
    avatar: "/placeholder.svg?height=40&width=40&text=JD",
    joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    totalCases: 2,
    currentCases: 1,
    creditScore: 580,
    priority: "high",
    tags: ["Identity Theft", "Experian Dispute"],
    notes: "Client experienced identity theft. Very responsive and provides documentation quickly.",
  },
  "client-456": {
    id: "client-456",
    name: "Jane Smith",
    email: "jane.smith@email.com",
    phone: "(555) 987-6543",
    avatar: "/placeholder.svg?height=40&width=40&text=JS",
    joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    totalCases: 1,
    currentCases: 1,
    creditScore: 620,
    priority: "medium",
    tags: ["Credit Building", "TransUnion"],
    notes: "Looking to improve credit score for home purchase. Timeline is flexible.",
  },
}

// Mock case data
export const mockCases: { [caseId: string]: CaseInfo } = {
  "case-001": {
    id: "case-001",
    clientId: "client-123",
    attorneyId: "sarah-johnson",
    title: "Credit Report Dispute - Identity Theft",
    type: "Identity Theft Recovery",
    status: "in_progress",
    priority: "high",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    billingRate: 350,
    totalBilled: 1750,
    estimatedHours: 8,
    actualHours: 5,
    documents: [
      {
        id: "doc-001",
        name: "Police Report - Identity Theft",
        type: "evidence",
        url: "/documents/police-report.pdf",
        uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        uploadedBy: "client-123",
      },
      {
        id: "doc-002",
        name: "Experian Credit Report",
        type: "report",
        url: "/documents/experian-report.pdf",
        uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        uploadedBy: "client-123",
      },
    ],
    milestones: [
      {
        id: "milestone-001",
        title: "File Initial Disputes",
        description: "Submit disputes to all three credit bureaus",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        completed: false,
      },
      {
        id: "milestone-002",
        title: "Follow up with Creditors",
        description: "Contact fraudulent creditors directly",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        completed: false,
      },
    ],
  },
}

// Mock message templates
export const mockTemplates: MessageTemplate[] = [
  {
    id: "template-001",
    title: "Welcome New Client",
    content:
      "Hello {clientName}, welcome to our firm! I'm excited to help you with your {caseType} case. I've reviewed your initial information and will begin working on your case immediately. Please don't hesitate to reach out if you have any questions.",
    category: "greeting",
    variables: ["{clientName}", "{caseType}"],
  },
  {
    id: "template-002",
    title: "Case Status Update",
    content:
      "Hi {clientName}, I wanted to update you on the progress of your {caseType} case. We've completed {milestone} and are now moving on to the next phase. I expect to have more updates for you by {nextUpdate}.",
    category: "status_update",
    variables: ["{clientName}", "{caseType}", "{milestone}", "{nextUpdate}"],
  },
  {
    id: "template-003",
    title: "Document Request",
    content:
      "Hello {clientName}, to proceed with your case, I'll need you to provide the following documents: {documentList}. Please upload them to our secure portal or email them to me at your earliest convenience.",
    category: "follow_up",
    variables: ["{clientName}", "{documentList}"],
  },
  {
    id: "template-004",
    title: "Case Completion",
    content:
      "Congratulations {clientName}! I'm pleased to inform you that we've successfully completed your {caseType} case. {results} Please review the final documentation and let me know if you have any questions.",
    category: "closing",
    variables: ["{clientName}", "{caseType}", "{results}"],
  },
]

// Attorney messaging service
export class AttorneyMessagingService {
  static getClientInfo(clientId: string): ClientInfo | undefined {
    return mockClients[clientId]
  }

  static getCaseInfo(caseId: string): CaseInfo | undefined {
    return mockCases[caseId]
  }

  static getClientCases(clientId: string): CaseInfo[] {
    return Object.values(mockCases).filter((case_) => case_.clientId === clientId)
  }

  static getAttorneyStats(): AttorneyStats {
    return {
      totalMessages: 1247,
      averageResponseTime: 2.5,
      clientSatisfaction: 4.9,
      casesCompleted: 156,
      revenue: 89750,
      messagesThisWeek: 47,
      newClientsThisMonth: 8,
    }
  }

  static getMessageTemplates(): MessageTemplate[] {
    return mockTemplates
  }

  static applyTemplate(template: MessageTemplate, variables: { [key: string]: string }): string {
    let content = template.content
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(key, "g"), value)
    })
    return content
  }

  static updateCaseStatus(caseId: string, status: CaseInfo["status"]): void {
    const case_ = mockCases[caseId]
    if (case_) {
      case_.status = status
      case_.updatedAt = new Date()
    }
  }

  static addCaseNote(caseId: string, note: string): void {
    // In a real app, this would add to a notes array
    console.log(`Added note to case ${caseId}: ${note}`)
  }

  static updateClientPriority(clientId: string, priority: ClientInfo["priority"]): void {
    const client = mockClients[clientId]
    if (client) {
      client.priority = priority
    }
  }

  static getConversationsByPriority(): { [priority: string]: any[] } {
    // This would filter conversations by client priority
    return {
      urgent: [],
      high: [],
      medium: [],
      low: [],
    }
  }
}
