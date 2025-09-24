export interface PriorityRule {
  id: string
  name: string
  description: string
  conditions: PriorityCondition[]
  priority: 'low' | 'medium' | 'high'
  weight: number // 0-100, higher weight = more important
  enabled: boolean
}

export interface PriorityCondition {
  field: 'category' | 'type' | 'title' | 'message' | 'user_action' | 'time' | 'frequency'
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
  weight: number // 0-100, how much this condition contributes to the overall priority
}

export interface UserContext {
  userId: string
  preferences: {
    [category: string]: {
      priority: 'low' | 'medium' | 'high'
      frequency: 'low' | 'medium' | 'high'
    }
  }
  engagement: {
    [category: string]: {
      readRate: number
      clickRate: number
      averageReadTime: number
    }
  }
  behavior: {
    activeHours: number[] // hours of day when user is most active
    preferredCategories: string[]
    notificationFrequency: 'low' | 'medium' | 'high'
  }
  recentActivity: {
    lastActiveAt: Date
    notificationsReceived: number
    notificationsRead: number
    notificationsClicked: number
  }
}

export interface PriorityScore {
  score: number // 0-100
  priority: 'low' | 'medium' | 'high'
  confidence: number // 0-100, how confident we are in this priority
  factors: {
    ruleBased: number
    userContext: number
    timeBased: number
    engagementBased: number
  }
  reasoning: string[]
}

class NotificationPrioritySystem {
  private rules: Map<string, PriorityRule> = new Map()
  private userContexts: Map<string, UserContext> = new Map()
  private isInitialized = false

  constructor() {
    this.initializeSystem()
  }

  private initializeSystem() {
    if (this.isInitialized) return

    this.initializeDefaultRules()
    this.isInitialized = true
    console.log('🎯 Notification priority system initialized')
  }

  private initializeDefaultRules() {
    const defaultRules: PriorityRule[] = [
      // High Priority Rules
      {
        id: 'credit-score-critical',
        name: 'Critical Credit Score Changes',
        description: 'Large credit score changes that require immediate attention',
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'credit',
            weight: 40
          },
          {
            field: 'title',
            operator: 'contains',
            value: ['drop', 'decrease', 'critical', 'urgent'],
            weight: 60
          }
        ],
        priority: 'high',
        weight: 90,
        enabled: true
      },
      {
        id: 'dispute-resolution',
        name: 'Dispute Resolution',
        description: 'Dispute resolutions and important dispute updates',
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'dispute',
            weight: 50
          },
          {
            field: 'title',
            operator: 'contains',
            value: ['resolved', 'successful', 'won', 'approved'],
            weight: 50
          }
        ],
        priority: 'high',
        weight: 85,
        enabled: true
      },
      {
        id: 'payment-failed',
        name: 'Payment Failures',
        description: 'Failed payments that need immediate attention',
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'payment',
            weight: 40
          },
          {
            field: 'type',
            operator: 'equals',
            value: 'error',
            weight: 60
          }
        ],
        priority: 'high',
        weight: 80,
        enabled: true
      },
      {
        id: 'system-critical',
        name: 'Critical System Alerts',
        description: 'Critical system issues that affect functionality',
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'system',
            weight: 30
          },
          {
            field: 'type',
            operator: 'equals',
            value: 'error',
            weight: 70
          }
        ],
        priority: 'high',
        weight: 75,
        enabled: true
      },

      // Medium Priority Rules
      {
        id: 'credit-score-normal',
        name: 'Normal Credit Score Updates',
        description: 'Regular credit score updates and changes',
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'credit',
            weight: 100
          }
        ],
        priority: 'medium',
        weight: 60,
        enabled: true
      },
      {
        id: 'training-milestone',
        name: 'Training Milestones',
        description: 'Important training milestones and achievements',
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'training',
            weight: 50
          },
          {
            field: 'title',
            operator: 'contains',
            value: ['milestone', 'achievement', 'complete', 'certificate'],
            weight: 50
          }
        ],
        priority: 'medium',
        weight: 55,
        enabled: true
      },
      {
        id: 'payment-success',
        name: 'Payment Confirmations',
        description: 'Successful payment confirmations',
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'payment',
            weight: 50
          },
          {
            field: 'type',
            operator: 'equals',
            value: 'success',
            weight: 50
          }
        ],
        priority: 'medium',
        weight: 50,
        enabled: true
      },
      {
        id: 'dispute-update',
        name: 'Dispute Status Updates',
        description: 'General dispute status updates',
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'dispute',
            weight: 100
          }
        ],
        priority: 'medium',
        weight: 45,
        enabled: true
      },

      // Low Priority Rules
      {
        id: 'training-progress',
        name: 'Training Progress',
        description: 'General training progress updates',
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'training',
            weight: 100
          }
        ],
        priority: 'low',
        weight: 30,
        enabled: true
      },
      {
        id: 'system-info',
        name: 'System Information',
        description: 'General system information and updates',
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            value: 'system',
            weight: 50
          },
          {
            field: 'type',
            operator: 'equals',
            value: 'info',
            weight: 50
          }
        ],
        priority: 'low',
        weight: 25,
        enabled: true
      },
      {
        id: 'general-info',
        name: 'General Information',
        description: 'General information notifications',
        conditions: [
          {
            field: 'type',
            operator: 'equals',
            value: 'info',
            weight: 100
          }
        ],
        priority: 'low',
        weight: 20,
        enabled: true
      }
    ]

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule)
    })

    console.log(`🎯 Initialized ${defaultRules.length} priority rules`)
  }

  /**
   * Calculate priority for a notification
   */
  calculatePriority(
    notification: {
      category: string
      type: string
      title: string
      message: string
      priority?: string
    },
    userId: string
  ): PriorityScore {
    const userContext = this.getUserContext(userId)
    const ruleBasedScore = this.calculateRuleBasedPriority(notification)
    const userContextScore = this.calculateUserContextPriority(notification, userContext)
    const timeBasedScore = this.calculateTimeBasedPriority(notification, userContext)
    const engagementScore = this.calculateEngagementBasedPriority(notification, userContext)

    // Weighted combination of all factors
    const totalScore = (
      ruleBasedScore * 0.4 +
      userContextScore * 0.3 +
      timeBasedScore * 0.2 +
      engagementScore * 0.1
    )

    const priority = this.scoreToPriority(totalScore)
    const confidence = this.calculateConfidence(ruleBasedScore, userContextScore, timeBasedScore, engagementScore)

    const reasoning = this.generateReasoning(notification, {
      ruleBased: ruleBasedScore,
      userContext: userContextScore,
      timeBased: timeBasedScore,
      engagementBased: engagementScore
    })

    return {
      score: Math.round(totalScore),
      priority,
      confidence: Math.round(confidence),
      factors: {
        ruleBased: Math.round(ruleBasedScore),
        userContext: Math.round(userContextScore),
        timeBased: Math.round(timeBasedScore),
        engagementBased: Math.round(engagementScore)
      },
      reasoning
    }
  }

  private calculateRuleBasedPriority(notification: any): number {
    let totalScore = 0
    let totalWeight = 0

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      let ruleScore = 0
      let ruleWeight = 0

      for (const condition of rule.conditions) {
        const conditionMet = this.evaluateCondition(condition, notification)
        if (conditionMet) {
          ruleScore += condition.weight
        }
        ruleWeight += condition.weight
      }

      if (ruleWeight > 0) {
        const ruleContribution = (ruleScore / ruleWeight) * rule.weight
        totalScore += ruleContribution
        totalWeight += rule.weight
      }
    }

    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 50
  }

  private calculateUserContextPriority(notification: any, userContext: UserContext): number {
    if (!userContext) return 50

    const categoryPref = userContext.preferences[notification.category]
    if (!categoryPref) return 50

    const priorityWeight = categoryPref.priority === 'high' ? 80 : categoryPref.priority === 'medium' ? 50 : 20
    const frequencyWeight = categoryPref.frequency === 'high' ? 70 : categoryPref.frequency === 'medium' ? 50 : 30

    return (priorityWeight + frequencyWeight) / 2
  }

  private calculateTimeBasedPriority(notification: any, userContext: UserContext): number {
    if (!userContext) return 50

    const currentHour = new Date().getHours()
    const isActiveHour = userContext.behavior.activeHours.includes(currentHour)

    return isActiveHour ? 70 : 30
  }

  private calculateEngagementBasedPriority(notification: any, userContext: UserContext): number {
    if (!userContext) return 50

    const categoryEngagement = userContext.engagement[notification.category]
    if (!categoryEngagement) return 50

    const readRate = categoryEngagement.readRate
    const clickRate = categoryEngagement.clickRate

    return (readRate + clickRate) / 2
  }

  private evaluateCondition(condition: PriorityCondition, notification: any): boolean {
    const fieldValue = notification[condition.field]

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'contains':
        if (Array.isArray(condition.value)) {
          return condition.value.some(v => 
            fieldValue && fieldValue.toLowerCase().includes(v.toLowerCase())
          )
        }
        return fieldValue && fieldValue.toLowerCase().includes(condition.value.toLowerCase())
      case 'starts_with':
        return fieldValue && fieldValue.toLowerCase().startsWith(condition.value.toLowerCase())
      case 'ends_with':
        return fieldValue && fieldValue.toLowerCase().endsWith(condition.value.toLowerCase())
      case 'greater_than':
        return fieldValue > condition.value
      case 'less_than':
        return fieldValue < condition.value
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
      default:
        return false
    }
  }

  private scoreToPriority(score: number): 'low' | 'medium' | 'high' {
    if (score >= 70) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  private calculateConfidence(ruleBased: number, userContext: number, timeBased: number, engagement: number): number {
    // Higher confidence when factors agree
    const scores = [ruleBased, userContext, timeBased, engagement]
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // Lower standard deviation = higher confidence
    return Math.max(0, 100 - standardDeviation)
  }

  private generateReasoning(notification: any, factors: any): string[] {
    const reasoning: string[] = []

    if (factors.ruleBased > 70) {
      reasoning.push('High priority based on notification rules')
    } else if (factors.ruleBased < 30) {
      reasoning.push('Low priority based on notification rules')
    }

    if (factors.userContext > 70) {
      reasoning.push('User has high preference for this category')
    } else if (factors.userContext < 30) {
      reasoning.push('User has low preference for this category')
    }

    if (factors.timeBased > 60) {
      reasoning.push('User is typically active at this time')
    } else if (factors.timeBased < 40) {
      reasoning.push('User is typically inactive at this time')
    }

    if (factors.engagementBased > 70) {
      reasoning.push('User has high engagement with this category')
    } else if (factors.engagementBased < 30) {
      reasoning.push('User has low engagement with this category')
    }

    return reasoning
  }

  private getUserContext(userId: string): UserContext {
    let context = this.userContexts.get(userId)
    
    if (!context) {
      // Create default context
      context = {
        userId,
        preferences: {
          credit: { priority: 'high', frequency: 'medium' },
          dispute: { priority: 'high', frequency: 'medium' },
          training: { priority: 'medium', frequency: 'low' },
          payment: { priority: 'high', frequency: 'high' },
          system: { priority: 'low', frequency: 'low' },
          alert: { priority: 'high', frequency: 'high' }
        },
        engagement: {
          credit: { readRate: 80, clickRate: 60, averageReadTime: 15 },
          dispute: { readRate: 90, clickRate: 70, averageReadTime: 20 },
          training: { readRate: 60, clickRate: 40, averageReadTime: 10 },
          payment: { readRate: 95, clickRate: 80, averageReadTime: 8 },
          system: { readRate: 30, clickRate: 10, averageReadTime: 5 },
          alert: { readRate: 85, clickRate: 65, averageReadTime: 12 }
        },
        behavior: {
          activeHours: [9, 10, 11, 14, 15, 16, 17, 18, 19, 20],
          preferredCategories: ['credit', 'dispute', 'payment'],
          notificationFrequency: 'medium'
        },
        recentActivity: {
          lastActiveAt: new Date(),
          notificationsReceived: 0,
          notificationsRead: 0,
          notificationsClicked: 0
        }
      }
      
      this.userContexts.set(userId, context)
    }
    
    return context
  }

  /**
   * Update user context with new data
   */
  updateUserContext(userId: string, updates: Partial<UserContext>): void {
    const currentContext = this.getUserContext(userId)
    const updatedContext = { ...currentContext, ...updates }
    this.userContexts.set(userId, updatedContext)
  }

  /**
   * Add or update a priority rule
   */
  addRule(rule: PriorityRule): void {
    this.rules.set(rule.id, rule)
    console.log(`🎯 Added priority rule: ${rule.name}`)
  }

  /**
   * Remove a priority rule
   */
  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId)
    if (removed) {
      console.log(`🎯 Removed priority rule: ${ruleId}`)
    }
    return removed
  }

  /**
   * Get all priority rules
   */
  getAllRules(): PriorityRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Get rules by priority level
   */
  getRulesByPriority(priority: 'low' | 'medium' | 'high'): PriorityRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.priority === priority)
  }

  /**
   * Get user context
   */
  getUserContextData(userId: string): UserContext | null {
    return this.userContexts.get(userId) || null
  }

  /**
   * Get priority statistics
   */
  getPriorityStats(): {
    totalRules: number
    enabledRules: number
    rulesByPriority: { [key: string]: number }
    totalUsers: number
  } {
    const rules = Array.from(this.rules.values())
    const enabledRules = rules.filter(rule => rule.enabled)
    
    const rulesByPriority = rules.reduce((acc, rule) => {
      acc[rule.priority] = (acc[rule.priority] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    return {
      totalRules: rules.length,
      enabledRules: enabledRules.length,
      rulesByPriority,
      totalUsers: this.userContexts.size
    }
  }
}

export const notificationPrioritySystem = new NotificationPrioritySystem()