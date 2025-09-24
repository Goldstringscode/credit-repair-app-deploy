export interface WorkflowStep {
  id: string
  name: string
  type: "task" | "email" | "document_request" | "status_update" | "delay" | "condition" | "notification"
  description: string
  config: WorkflowStepConfig
  dependencies: string[] // IDs of steps that must complete first
  autoComplete: boolean
  estimatedDuration: number // in hours
  assignedTo?: string
  dueDate?: Date
  status: "pending" | "in_progress" | "completed" | "skipped" | "failed"
  completedAt?: Date
  completedBy?: string
  notes?: string
}

export interface WorkflowStepConfig {
  // Task config
  taskTitle?: string
  taskDescription?: string
  taskPriority?: "low" | "medium" | "high" | "urgent"

  // Email config
  emailTemplate?: string
  emailSubject?: string
  emailRecipients?: string[]

  // Document request config
  documentTypes?: string[]
  documentInstructions?: string
  documentRequired?: boolean

  // Status update config
  newStatus?: string
  statusMessage?: string

  // Delay config
  delayDuration?: number // in hours
  delayReason?: string

  // Condition config
  conditionType?: "client_response" | "document_received" | "payment_received" | "time_elapsed"
  conditionValue?: any

  // Notification config
  notificationType?: "sms" | "email" | "push" | "in_app"
  notificationMessage?: string
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: "onboarding" | "case_management" | "dispute_process" | "follow_up" | "closing"
  steps: WorkflowStep[]
  triggers: WorkflowTrigger[]
  estimatedDuration: number // total estimated hours
  successRate: number
  timesUsed: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
  isActive: boolean
}

export interface WorkflowTrigger {
  id: string
  name: string
  type: "case_created" | "document_uploaded" | "payment_received" | "status_changed" | "time_based" | "manual"
  conditions: TriggerCondition[]
  workflowTemplateId: string
  isActive: boolean
}

export interface TriggerCondition {
  field: string
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "exists"
  value: any
}

export interface WorkflowInstance {
  id: string
  templateId: string
  caseId: string
  clientId: string
  attorneyId: string
  name: string
  status: "active" | "completed" | "paused" | "cancelled"
  currentStep: string | null
  progress: number // 0-100
  startedAt: Date
  completedAt?: Date
  estimatedCompletionDate: Date
  actualDuration?: number
  steps: WorkflowStepInstance[]
  variables: { [key: string]: any }
  notes: string[]
}

export interface WorkflowStepInstance {
  id: string
  stepId: string
  workflowInstanceId: string
  name: string
  type: WorkflowStep["type"]
  status: WorkflowStep["status"]
  assignedTo?: string
  dueDate?: Date
  startedAt?: Date
  completedAt?: Date
  completedBy?: string
  notes?: string
  config: WorkflowStepConfig
  dependencies: string[]
  autoComplete: boolean
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  actions: AutomationAction[]
  isActive: boolean
  createdAt: Date
  lastTriggered?: Date
  timesTriggered: number
}

export interface AutomationAction {
  type: "create_task" | "send_email" | "update_status" | "assign_attorney" | "schedule_followup" | "create_document"
  config: any
}

// Workflow Templates
export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "onboarding-standard",
    name: "Standard Client Onboarding",
    description: "Complete onboarding process for new credit repair clients",
    category: "onboarding",
    estimatedDuration: 48,
    successRate: 95,
    timesUsed: 156,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "sarah-johnson",
    isActive: true,
    triggers: [
      {
        id: "trigger-new-client",
        name: "New Client Signup",
        type: "case_created",
        conditions: [{ field: "caseType", operator: "equals", value: "Credit Repair" }],
        workflowTemplateId: "onboarding-standard",
        isActive: true,
      },
    ],
    steps: [
      {
        id: "step-welcome-email",
        name: "Send Welcome Email",
        type: "email",
        description: "Send personalized welcome email to new client",
        config: {
          emailTemplate: "welcome-new-client",
          emailSubject: "Welcome to Our Credit Repair Program!",
          emailRecipients: ["client"],
        },
        dependencies: [],
        autoComplete: true,
        estimatedDuration: 0.5,
        status: "pending",
      },
      {
        id: "step-document-request",
        name: "Request Initial Documents",
        type: "document_request",
        description: "Request credit reports and identification documents",
        config: {
          documentTypes: ["Credit Reports", "Government ID", "Social Security Card", "Proof of Address"],
          documentInstructions: "Please upload clear, legible copies of all requested documents to our secure portal.",
          documentRequired: true,
        },
        dependencies: ["step-welcome-email"],
        autoComplete: false,
        estimatedDuration: 24,
        status: "pending",
      },
      {
        id: "step-schedule-consultation",
        name: "Schedule Initial Consultation",
        type: "task",
        description: "Schedule and conduct initial consultation call",
        config: {
          taskTitle: "Schedule Initial Consultation",
          taskDescription: "Contact client to schedule 30-minute consultation call",
          taskPriority: "high",
        },
        dependencies: ["step-welcome-email"],
        autoComplete: false,
        estimatedDuration: 2,
        status: "pending",
      },
      {
        id: "step-create-case-file",
        name: "Create Case File",
        type: "task",
        description: "Create comprehensive case file with client information",
        config: {
          taskTitle: "Create Case File",
          taskDescription: "Set up case file with client details, goals, and initial assessment",
          taskPriority: "medium",
        },
        dependencies: ["step-document-request", "step-schedule-consultation"],
        autoComplete: false,
        estimatedDuration: 1,
        status: "pending",
      },
      {
        id: "step-credit-analysis",
        name: "Conduct Credit Analysis",
        type: "task",
        description: "Analyze credit reports and identify dispute opportunities",
        config: {
          taskTitle: "Credit Report Analysis",
          taskDescription: "Review all three credit reports and identify inaccurate, incomplete, or unverifiable items",
          taskPriority: "high",
        },
        dependencies: ["step-create-case-file"],
        autoComplete: false,
        estimatedDuration: 3,
        status: "pending",
      },
      {
        id: "step-strategy-email",
        name: "Send Strategy Summary",
        type: "email",
        description: "Send detailed strategy and timeline to client",
        config: {
          emailTemplate: "strategy-summary",
          emailSubject: "Your Credit Repair Strategy & Timeline",
          emailRecipients: ["client"],
        },
        dependencies: ["step-credit-analysis"],
        autoComplete: true,
        estimatedDuration: 0.5,
        status: "pending",
      },
      {
        id: "step-update-status",
        name: "Update Case Status",
        type: "status_update",
        description: "Update case status to active",
        config: {
          newStatus: "active",
          statusMessage: "Onboarding completed - case now active",
        },
        dependencies: ["step-strategy-email"],
        autoComplete: true,
        estimatedDuration: 0.1,
        status: "pending",
      },
    ],
  },
  {
    id: "dispute-process-standard",
    name: "Standard Dispute Process",
    description: "Automated dispute filing and follow-up process",
    category: "dispute_process",
    estimatedDuration: 168, // 7 days
    successRate: 87,
    timesUsed: 89,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-10"),
    createdBy: "sarah-johnson",
    isActive: true,
    triggers: [
      {
        id: "trigger-analysis-complete",
        name: "Credit Analysis Complete",
        type: "status_changed",
        conditions: [{ field: "status", operator: "equals", value: "analysis_complete" }],
        workflowTemplateId: "dispute-process-standard",
        isActive: true,
      },
    ],
    steps: [
      {
        id: "step-prepare-disputes",
        name: "Prepare Dispute Letters",
        type: "task",
        description: "Prepare customized dispute letters for each bureau",
        config: {
          taskTitle: "Prepare Dispute Letters",
          taskDescription: "Create personalized dispute letters for Experian, Equifax, and TransUnion",
          taskPriority: "high",
        },
        dependencies: [],
        autoComplete: false,
        estimatedDuration: 2,
        status: "pending",
      },
      {
        id: "step-client-review",
        name: "Client Review & Approval",
        type: "email",
        description: "Send dispute letters to client for review and approval",
        config: {
          emailTemplate: "dispute-review",
          emailSubject: "Please Review Your Dispute Letters",
          emailRecipients: ["client"],
        },
        dependencies: ["step-prepare-disputes"],
        autoComplete: false,
        estimatedDuration: 24,
        status: "pending",
      },
      {
        id: "step-file-disputes",
        name: "File Disputes",
        type: "task",
        description: "Submit dispute letters to all three credit bureaus",
        config: {
          taskTitle: "File Disputes with Bureaus",
          taskDescription: "Submit approved dispute letters via certified mail to all three bureaus",
          taskPriority: "urgent",
        },
        dependencies: ["step-client-review"],
        autoComplete: false,
        estimatedDuration: 1,
        status: "pending",
      },
      {
        id: "step-confirmation-email",
        name: "Send Confirmation",
        type: "email",
        description: "Confirm dispute filing with client",
        config: {
          emailTemplate: "dispute-filed",
          emailSubject: "Your Disputes Have Been Filed",
          emailRecipients: ["client"],
        },
        dependencies: ["step-file-disputes"],
        autoComplete: true,
        estimatedDuration: 0.5,
        status: "pending",
      },
      {
        id: "step-30-day-followup",
        name: "30-Day Follow-up",
        type: "delay",
        description: "Wait 30 days for bureau responses",
        config: {
          delayDuration: 720, // 30 days in hours
          delayReason: "Waiting for bureau response period",
        },
        dependencies: ["step-confirmation-email"],
        autoComplete: true,
        estimatedDuration: 720,
        status: "pending",
      },
      {
        id: "step-check-responses",
        name: "Check Bureau Responses",
        type: "task",
        description: "Review responses from credit bureaus",
        config: {
          taskTitle: "Review Bureau Responses",
          taskDescription: "Check for responses from all three credit bureaus and analyze results",
          taskPriority: "high",
        },
        dependencies: ["step-30-day-followup"],
        autoComplete: false,
        estimatedDuration: 2,
        status: "pending",
      },
      {
        id: "step-results-email",
        name: "Send Results Update",
        type: "email",
        description: "Update client on dispute results",
        config: {
          emailTemplate: "dispute-results",
          emailSubject: "Your Dispute Results Are In!",
          emailRecipients: ["client"],
        },
        dependencies: ["step-check-responses"],
        autoComplete: true,
        estimatedDuration: 0.5,
        status: "pending",
      },
    ],
  },
]

// Workflow Engine Service
export class WorkflowEngine {
  private static instances: Map<string, WorkflowInstance> = new Map()
  private static automationRules: AutomationRule[] = []

  static createWorkflowInstance(
    templateId: string,
    caseId: string,
    clientId: string,
    attorneyId: string,
  ): WorkflowInstance {
    const template = workflowTemplates.find((t) => t.id === templateId)
    if (!template) {
      throw new Error(`Workflow template ${templateId} not found`)
    }

    const instance: WorkflowInstance = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      caseId,
      clientId,
      attorneyId,
      name: template.name,
      status: "active",
      currentStep: null,
      progress: 0,
      startedAt: new Date(),
      estimatedCompletionDate: new Date(Date.now() + template.estimatedDuration * 60 * 60 * 1000),
      steps: template.steps.map((step) => ({
        id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        stepId: step.id,
        workflowInstanceId: instance.id,
        name: step.name,
        type: step.type,
        status: step.dependencies.length === 0 ? "pending" : "pending",
        assignedTo: step.assignedTo || attorneyId,
        dueDate: step.estimatedDuration ? new Date(Date.now() + step.estimatedDuration * 60 * 60 * 1000) : undefined,
        config: step.config,
        dependencies: step.dependencies,
        autoComplete: step.autoComplete,
      })),
      variables: {},
      notes: [],
    }

    this.instances.set(instance.id, instance)
    this.processNextSteps(instance.id)
    return instance
  }

  static getWorkflowInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId)
  }

  static getWorkflowInstancesByCase(caseId: string): WorkflowInstance[] {
    return Array.from(this.instances.values()).filter((instance) => instance.caseId === caseId)
  }

  static getWorkflowInstancesByClient(clientId: string): WorkflowInstance[] {
    return Array.from(this.instances.values()).filter((instance) => instance.clientId === clientId)
  }

  static completeStep(instanceId: string, stepId: string, completedBy: string, notes?: string): void {
    const instance = this.instances.get(instanceId)
    if (!instance) return

    const step = instance.steps.find((s) => s.id === stepId)
    if (!step) return

    step.status = "completed"
    step.completedAt = new Date()
    step.completedBy = completedBy
    if (notes) step.notes = notes

    // Update progress
    const completedSteps = instance.steps.filter((s) => s.status === "completed").length
    instance.progress = Math.round((completedSteps / instance.steps.length) * 100)

    // Check if workflow is complete
    if (instance.progress === 100) {
      instance.status = "completed"
      instance.completedAt = new Date()
      instance.actualDuration = (new Date().getTime() - instance.startedAt.getTime()) / (1000 * 60 * 60)
    }

    this.processNextSteps(instanceId)
  }

  static processNextSteps(instanceId: string): void {
    const instance = this.instances.get(instanceId)
    if (!instance || instance.status !== "active") return

    // Find steps that can be started (dependencies met)
    const readySteps = instance.steps.filter((step) => {
      if (step.status !== "pending") return false

      // Check if all dependencies are completed
      return step.dependencies.every((depId) => {
        const depStep = instance.steps.find((s) => s.stepId === depId)
        return depStep?.status === "completed"
      })
    })

    // Process auto-complete steps
    readySteps.forEach((step) => {
      if (step.autoComplete) {
        this.executeStep(instanceId, step.id)
      } else {
        step.status = "in_progress"
        if (!step.startedAt) step.startedAt = new Date()
      }
    })

    // Update current step
    const inProgressSteps = instance.steps.filter((s) => s.status === "in_progress")
    instance.currentStep = inProgressSteps.length > 0 ? inProgressSteps[0].id : null
  }

  static executeStep(instanceId: string, stepId: string): void {
    const instance = this.instances.get(instanceId)
    if (!instance) return

    const step = instance.steps.find((s) => s.id === stepId)
    if (!step) return

    step.status = "in_progress"
    step.startedAt = new Date()

    // Execute based on step type
    switch (step.type) {
      case "email":
        this.executeEmailStep(instance, step)
        break
      case "notification":
        this.executeNotificationStep(instance, step)
        break
      case "status_update":
        this.executeStatusUpdateStep(instance, step)
        break
      case "delay":
        this.executeDelayStep(instance, step)
        break
      default:
        // For tasks and other manual steps, mark as in progress
        break
    }
  }

  private static executeEmailStep(instance: WorkflowInstance, step: WorkflowStepInstance): void {
    // In a real implementation, this would send an actual email
    console.log(`Sending email: ${step.config.emailSubject} to client ${instance.clientId}`)

    // Simulate email sending delay
    setTimeout(() => {
      this.completeStep(instance.id, step.id, "system", "Email sent successfully")
    }, 1000)
  }

  private static executeNotificationStep(instance: WorkflowInstance, step: WorkflowStepInstance): void {
    console.log(`Sending notification: ${step.config.notificationMessage}`)
    this.completeStep(instance.id, step.id, "system", "Notification sent")
  }

  private static executeStatusUpdateStep(instance: WorkflowInstance, step: WorkflowStepInstance): void {
    console.log(`Updating case status to: ${step.config.newStatus}`)
    this.completeStep(instance.id, step.id, "system", `Status updated to ${step.config.newStatus}`)
  }

  private static executeDelayStep(instance: WorkflowInstance, step: WorkflowStepInstance): void {
    const delayMs = (step.config.delayDuration || 1) * 60 * 60 * 1000
    console.log(`Delaying for ${step.config.delayDuration} hours`)

    setTimeout(() => {
      this.completeStep(instance.id, step.id, "system", `Delay completed after ${step.config.delayDuration} hours`)
    }, delayMs)
  }

  static triggerWorkflow(trigger: WorkflowTrigger, context: any): void {
    // Check if trigger conditions are met
    const conditionsMet = trigger.conditions.every((condition) => {
      const value = context[condition.field]
      switch (condition.operator) {
        case "equals":
          return value === condition.value
        case "not_equals":
          return value !== condition.value
        case "contains":
          return String(value).includes(condition.value)
        case "exists":
          return value !== undefined && value !== null
        default:
          return false
      }
    })

    if (conditionsMet) {
      this.createWorkflowInstance(trigger.workflowTemplateId, context.caseId, context.clientId, context.attorneyId)
    }
  }

  static pauseWorkflow(instanceId: string): void {
    const instance = this.instances.get(instanceId)
    if (instance) {
      instance.status = "paused"
    }
  }

  static resumeWorkflow(instanceId: string): void {
    const instance = this.instances.get(instanceId)
    if (instance) {
      instance.status = "active"
      this.processNextSteps(instanceId)
    }
  }

  static cancelWorkflow(instanceId: string, reason?: string): void {
    const instance = this.instances.get(instanceId)
    if (instance) {
      instance.status = "cancelled"
      if (reason) {
        instance.notes.push(`Cancelled: ${reason}`)
      }
    }
  }

  static getActiveWorkflows(): WorkflowInstance[] {
    return Array.from(this.instances.values()).filter((instance) => instance.status === "active")
  }

  static getWorkflowStats(): {
    total: number
    active: number
    completed: number
    paused: number
    cancelled: number
    averageCompletionTime: number
  } {
    const instances = Array.from(this.instances.values())
    const completed = instances.filter((i) => i.status === "completed")
    const averageCompletionTime =
      completed.length > 0 ? completed.reduce((sum, i) => sum + (i.actualDuration || 0), 0) / completed.length : 0

    return {
      total: instances.length,
      active: instances.filter((i) => i.status === "active").length,
      completed: completed.length,
      paused: instances.filter((i) => i.status === "paused").length,
      cancelled: instances.filter((i) => i.status === "cancelled").length,
      averageCompletionTime,
    }
  }
}

// Initialize some sample workflow instances
export const initializeSampleWorkflows = () => {
  // Create sample onboarding workflow
  WorkflowEngine.createWorkflowInstance("onboarding-standard", "case-001", "client-123", "sarah-johnson")
}
