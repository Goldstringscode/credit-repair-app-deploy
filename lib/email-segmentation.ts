// Email list segmentation and targeting system
export interface EmailSegment {
  id: string
  name: string
  description: string
  criteria: SegmentCriteria[]
  subscriberCount: number
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface SegmentCriteria {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface EmailSubscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  tags: string[]
  customFields: Record<string, any>
  subscriptionDate: Date
  lastActivity: Date
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained'
  source: string
  preferences: {
    emailFrequency: 'daily' | 'weekly' | 'monthly' | 'never'
    categories: string[]
    timezone: string
  }
}

export interface EmailTargeting {
  id: string
  name: string
  description: string
  segments: string[]
  excludeSegments: string[]
  additionalFilters: SegmentCriteria[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

class EmailSegmentationService {
  private segments: Map<string, EmailSegment> = new Map()
  private subscribers: Map<string, EmailSubscriber> = new Map()
  private targeting: Map<string, EmailTargeting> = new Map()

  constructor() {
    this.initializeDefaultSegments()
    this.initializeSampleSubscribers()
  }

  private initializeDefaultSegments() {
    const defaultSegments: EmailSegment[] = [
      {
        id: 'new-subscribers',
        name: 'New Subscribers',
        description: 'Subscribers who joined in the last 30 days',
        criteria: [
          {
            field: 'subscriptionDate',
            operator: 'greater_than',
            value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        ],
        subscriberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'active-users',
        name: 'Active Users',
        description: 'Users who have been active in the last 7 days',
        criteria: [
          {
            field: 'lastActivity',
            operator: 'greater_than',
            value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            field: 'status',
            operator: 'equals',
            value: 'active',
            logicalOperator: 'AND'
          }
        ],
        subscriberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'premium-users',
        name: 'Premium Users',
        description: 'Users with premium subscriptions',
        criteria: [
          {
            field: 'customFields.subscriptionType',
            operator: 'equals',
            value: 'premium'
          },
          {
            field: 'status',
            operator: 'equals',
            value: 'active',
            logicalOperator: 'AND'
          }
        ],
        subscriberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'credit-repair-interested',
        name: 'Credit Repair Interested',
        description: 'Users interested in credit repair services',
        criteria: [
          {
            field: 'tags',
            operator: 'contains',
            value: 'credit-repair'
          },
          {
            field: 'status',
            operator: 'equals',
            value: 'active',
            logicalOperator: 'AND'
          }
        ],
        subscriberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'high-engagement',
        name: 'High Engagement',
        description: 'Users with high email engagement',
        criteria: [
          {
            field: 'customFields.emailOpenRate',
            operator: 'greater_than',
            value: 0.7
          },
          {
            field: 'status',
            operator: 'equals',
            value: 'active',
            logicalOperator: 'AND'
          }
        ],
        subscriberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: 'inactive-users',
        name: 'Inactive Users',
        description: 'Users who haven\'t been active in 30+ days',
        criteria: [
          {
            field: 'lastActivity',
            operator: 'less_than',
            value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          {
            field: 'status',
            operator: 'equals',
            value: 'active',
            logicalOperator: 'AND'
          }
        ],
        subscriberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
    ]

    defaultSegments.forEach(segment => {
      this.segments.set(segment.id, segment)
    })

    console.log(`📊 Initialized ${defaultSegments.length} email segments`)
  }

  private initializeSampleSubscribers() {
    const sampleSubscribers: EmailSubscriber[] = [
      {
        id: 'sub_1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        tags: ['credit-repair', 'premium'],
        customFields: {
          subscriptionType: 'premium',
          creditScore: 650,
          emailOpenRate: 0.85,
          lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        subscriptionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'active',
        source: 'website',
        preferences: {
          emailFrequency: 'weekly',
          categories: ['credit-repair', 'tips'],
          timezone: 'America/New_York'
        }
      },
      {
        id: 'sub_2',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        tags: ['credit-repair', 'beginner'],
        customFields: {
          subscriptionType: 'basic',
          creditScore: 580,
          emailOpenRate: 0.65,
          lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        subscriptionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        source: 'referral',
        preferences: {
          emailFrequency: 'daily',
          categories: ['credit-repair', 'education'],
          timezone: 'America/Los_Angeles'
        }
      },
      {
        id: 'sub_3',
        email: 'mike.wilson@example.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        tags: ['mlm', 'business'],
        customFields: {
          subscriptionType: 'premium',
          creditScore: 720,
          emailOpenRate: 0.45,
          lastLogin: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
        },
        subscriptionDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        status: 'active',
        source: 'social-media',
        preferences: {
          emailFrequency: 'monthly',
          categories: ['business', 'mlm'],
          timezone: 'America/Chicago'
        }
      },
      {
        id: 'sub_4',
        email: 'sarah.jones@example.com',
        firstName: 'Sarah',
        lastName: 'Jones',
        tags: ['credit-repair', 'premium'],
        customFields: {
          subscriptionType: 'premium',
          creditScore: 680,
          emailOpenRate: 0.92,
          lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        subscriptionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'active',
        source: 'email-campaign',
        preferences: {
          emailFrequency: 'daily',
          categories: ['credit-repair', 'tips', 'success-stories'],
          timezone: 'America/New_York'
        }
      }
    ]

    sampleSubscribers.forEach(subscriber => {
      this.subscribers.set(subscriber.id, subscriber)
    })

    // Update segment counts
    this.updateSegmentCounts()
    console.log(`👥 Initialized ${sampleSubscribers.length} sample subscribers`)
  }

  private updateSegmentCounts() {
    for (const [segmentId, segment] of this.segments) {
      const matchingSubscribers = this.getSubscribersBySegment(segmentId)
      segment.subscriberCount = matchingSubscribers.length
      segment.updatedAt = new Date()
      this.segments.set(segmentId, segment)
    }
  }

  private evaluateCriteria(subscriber: EmailSubscriber, criteria: SegmentCriteria): boolean {
    const { field, operator, value } = criteria

    // Get field value
    let fieldValue: any
    if (field.startsWith('customFields.')) {
      const customField = field.replace('customFields.', '')
      fieldValue = subscriber.customFields[customField]
    } else {
      fieldValue = (subscriber as any)[field]
    }

    // Handle array fields (like tags)
    if (Array.isArray(fieldValue)) {
      switch (operator) {
        case 'contains':
          return fieldValue.includes(value)
        case 'not_contains':
          return !fieldValue.includes(value)
        case 'in':
          return value.some((v: any) => fieldValue.includes(v))
        case 'not_in':
          return !value.some((v: any) => fieldValue.includes(v))
        default:
          return false
      }
    }

    // Handle date fields
    if (fieldValue instanceof Date && value instanceof Date) {
      switch (operator) {
        case 'greater_than':
          return fieldValue > value
        case 'less_than':
          return fieldValue < value
        case 'equals':
          return fieldValue.getTime() === value.getTime()
        default:
          return false
      }
    }

    // Handle string fields
    if (typeof fieldValue === 'string') {
      switch (operator) {
        case 'equals':
          return fieldValue === value
        case 'not_equals':
          return fieldValue !== value
        case 'contains':
          return fieldValue.toLowerCase().includes(value.toLowerCase())
        case 'not_contains':
          return !fieldValue.toLowerCase().includes(value.toLowerCase())
        default:
          return false
      }
    }

    // Handle numeric fields
    if (typeof fieldValue === 'number') {
      switch (operator) {
        case 'equals':
          return fieldValue === value
        case 'not_equals':
          return fieldValue !== value
        case 'greater_than':
          return fieldValue > value
        case 'less_than':
          return fieldValue < value
        default:
          return false
      }
    }

    // Handle empty/not empty
    if (operator === 'is_empty') {
      return fieldValue === null || fieldValue === undefined || fieldValue === ''
    }
    if (operator === 'is_not_empty') {
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== ''
    }

    return false
  }

  private getSubscribersBySegment(segmentId: string): EmailSubscriber[] {
    const segment = this.segments.get(segmentId)
    if (!segment || !segment.isActive) {
      return []
    }

    const matchingSubscribers: EmailSubscriber[] = []

    for (const subscriber of this.subscribers.values()) {
      let matches = true
      let currentLogicalOperator: 'AND' | 'OR' | null = null

      for (let i = 0; i < segment.criteria.length; i++) {
        const criteria = segment.criteria[i]
        const criteriaMatches = this.evaluateCriteria(subscriber, criteria)

        if (i === 0) {
          matches = criteriaMatches
        } else if (currentLogicalOperator === 'AND') {
          matches = matches && criteriaMatches
        } else if (currentLogicalOperator === 'OR') {
          matches = matches || criteriaMatches
        }

        currentLogicalOperator = criteria.logicalOperator || null
      }

      if (matches) {
        matchingSubscribers.push(subscriber)
      }
    }

    return matchingSubscribers
  }

  // Public methods
  public createSegment(segment: Omit<EmailSegment, 'id' | 'subscriberCount' | 'createdAt' | 'updatedAt'>): string {
    const id = `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSegment: EmailSegment = {
      ...segment,
      id,
      subscriberCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.segments.set(id, newSegment)
    this.updateSegmentCounts()
    console.log(`📊 Created segment: ${id}`)
    return id
  }

  public getSegments(): EmailSegment[] {
    return Array.from(this.segments.values())
  }

  public getSegment(segmentId: string): EmailSegment | null {
    return this.segments.get(segmentId) || null
  }

  public updateSegment(segmentId: string, updates: Partial<EmailSegment>): boolean {
    const segment = this.segments.get(segmentId)
    if (!segment) {
      return false
    }

    const updatedSegment = {
      ...segment,
      ...updates,
      updatedAt: new Date()
    }

    this.segments.set(segmentId, updatedSegment)
    this.updateSegmentCounts()
    console.log(`📊 Updated segment: ${segmentId}`)
    return true
  }

  public deleteSegment(segmentId: string): boolean {
    const deleted = this.segments.delete(segmentId)
    if (deleted) {
      console.log(`📊 Deleted segment: ${segmentId}`)
    }
    return deleted
  }

  public getSubscribersBySegment(segmentId: string): EmailSubscriber[] {
    return this.getSubscribersBySegment(segmentId)
  }

  public getSubscribersByTargeting(targetingId: string): EmailSubscriber[] {
    const targeting = this.targeting.get(targetingId)
    if (!targeting || !targeting.isActive) {
      return []
    }

    let subscribers: EmailSubscriber[] = []

    // Include segments
    for (const segmentId of targeting.segments) {
      const segmentSubscribers = this.getSubscribersBySegment(segmentId)
      subscribers = [...subscribers, ...segmentSubscribers]
    }

    // Remove duplicates
    const uniqueSubscribers = subscribers.filter((subscriber, index, self) =>
      index === self.findIndex(s => s.id === subscriber.id)
    )

    // Exclude segments
    for (const segmentId of targeting.excludeSegments) {
      const excludeSubscribers = this.getSubscribersBySegment(segmentId)
      const excludeIds = new Set(excludeSubscribers.map(s => s.id))
      subscribers = subscribers.filter(s => !excludeIds.has(s.id))
    }

    // Apply additional filters
    if (targeting.additionalFilters.length > 0) {
      subscribers = subscribers.filter(subscriber => {
        let matches = true
        let currentLogicalOperator: 'AND' | 'OR' | null = null

        for (let i = 0; i < targeting.additionalFilters.length; i++) {
          const criteria = targeting.additionalFilters[i]
          const criteriaMatches = this.evaluateCriteria(subscriber, criteria)

          if (i === 0) {
            matches = criteriaMatches
          } else if (currentLogicalOperator === 'AND') {
            matches = matches && criteriaMatches
          } else if (currentLogicalOperator === 'OR') {
            matches = matches || criteriaMatches
          }

          currentLogicalOperator = criteria.logicalOperator || null
        }

        return matches
      })
    }

    return subscribers
  }

  public createTargeting(targeting: Omit<EmailTargeting, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `targeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTargeting: EmailTargeting = {
      ...targeting,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.targeting.set(id, newTargeting)
    console.log(`🎯 Created targeting: ${id}`)
    return id
  }

  public getTargeting(): EmailTargeting[] {
    return Array.from(this.targeting.values())
  }

  public getTargeting(targetingId: string): EmailTargeting | null {
    return this.targeting.get(targetingId) || null
  }

  public addSubscriber(subscriber: Omit<EmailSubscriber, 'id' | 'subscriptionDate' | 'lastActivity'>): string {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSubscriber: EmailSubscriber = {
      ...subscriber,
      id,
      subscriptionDate: new Date(),
      lastActivity: new Date()
    }

    this.subscribers.set(id, newSubscriber)
    this.updateSegmentCounts()
    console.log(`👥 Added subscriber: ${id}`)
    return id
  }

  public getSubscribers(): EmailSubscriber[] {
    return Array.from(this.subscribers.values())
  }

  public getSubscriber(subscriberId: string): EmailSubscriber | null {
    return this.subscribers.get(subscriberId) || null
  }

  public updateSubscriber(subscriberId: string, updates: Partial<EmailSubscriber>): boolean {
    const subscriber = this.subscribers.get(subscriberId)
    if (!subscriber) {
      return false
    }

    const updatedSubscriber = {
      ...subscriber,
      ...updates,
      lastActivity: new Date()
    }

    this.subscribers.set(subscriberId, updatedSubscriber)
    this.updateSegmentCounts()
    console.log(`👥 Updated subscriber: ${subscriberId}`)
    return true
  }
}

// Singleton instance
export const emailSegmentationService = new EmailSegmentationService()

// API functions
export const createSegment = (segment: Omit<EmailSegment, 'id' | 'subscriberCount' | 'createdAt' | 'updatedAt'>) => {
  return emailSegmentationService.createSegment(segment)
}

export const getSegments = () => {
  return emailSegmentationService.getSegments()
}

export const getSegment = (segmentId: string) => {
  return emailSegmentationService.getSegment(segmentId)
}

export const updateSegment = (segmentId: string, updates: Partial<EmailSegment>) => {
  return emailSegmentationService.updateSegment(segmentId, updates)
}

export const deleteSegment = (segmentId: string) => {
  return emailSegmentationService.deleteSegment(segmentId)
}

export const getSubscribersBySegment = (segmentId: string) => {
  return emailSegmentationService.getSubscribersBySegment(segmentId)
}

export const createTargeting = (targeting: Omit<EmailTargeting, 'id' | 'createdAt' | 'updatedAt'>) => {
  return emailSegmentationService.createTargeting(targeting)
}

export const getTargeting = () => {
  return emailSegmentationService.getTargeting()
}

export const getTargetingById = (targetingId: string) => {
  return emailSegmentationService.getTargeting(targetingId)
}

export const getSubscribersByTargeting = (targetingId: string) => {
  return emailSegmentationService.getSubscribersByTargeting(targetingId)
}

export const addSubscriber = (subscriber: Omit<EmailSubscriber, 'id' | 'subscriptionDate' | 'lastActivity'>) => {
  return emailSegmentationService.addSubscriber(subscriber)
}

export const getSubscribers = () => {
  return emailSegmentationService.getSubscribers()
}

export const getSubscriber = (subscriberId: string) => {
  return emailSegmentationService.getSubscriber(subscriberId)
}

export const updateSubscriber = (subscriberId: string, updates: Partial<EmailSubscriber>) => {
  return emailSegmentationService.updateSubscriber(subscriberId, updates)
}
