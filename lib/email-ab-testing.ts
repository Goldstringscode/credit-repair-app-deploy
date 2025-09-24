// A/B testing system for email campaigns
export interface ABTest {
  id: string
  name: string
  description: string
  campaignId: string
  variants: EmailVariant[]
  trafficSplit: number // Percentage of traffic to test (0-100)
  testType: 'subject' | 'content' | 'send_time' | 'sender_name' | 'full_template'
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled'
  startDate?: Date
  endDate?: Date
  winnerCriteria: 'open_rate' | 'click_rate' | 'conversion_rate' | 'revenue' | 'manual'
  minSampleSize: number
  confidenceLevel: number // 95, 99, etc.
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface EmailVariant {
  id: string
  name: string
  subject?: string
  htmlContent?: string
  textContent?: string
  senderName?: string
  sendTime?: Date
  templateId?: string
  weight: number // Traffic weight (0-100)
  isControl: boolean
}

export interface ABTestResult {
  testId: string
  variantId: string
  variantName: string
  isControl: boolean
  metrics: {
    emailsSent: number
    emailsDelivered: number
    emailsOpened: number
    emailsClicked: number
    conversions: number
    revenue: number
    unsubscribes: number
    bounces: number
  }
  rates: {
    deliveryRate: number
    openRate: number
    clickRate: number
    conversionRate: number
    unsubscribeRate: number
    bounceRate: number
  }
  statisticalSignificance: {
    isSignificant: boolean
    confidenceLevel: number
    pValue: number
    marginOfError: number
  }
  performance: {
    score: number
    rank: number
    improvement: number // Percentage improvement over control
  }
}

export interface ABTestParticipant {
  id: string
  testId: string
  variantId: string
  email: string
  assignedAt: Date
  sentAt?: Date
  openedAt?: Date
  clickedAt?: Date
  convertedAt?: Date
  unsubscribedAt?: Date
  bouncedAt?: Date
}

class EmailABTestingService {
  private tests: Map<string, ABTest> = new Map()
  private participants: Map<string, ABTestParticipant> = new Map()
  private results: Map<string, ABTestResult[]> = new Map()

  constructor() {
    this.initializeSampleTests()
  }

  private initializeSampleTests() {
    const sampleTests: ABTest[] = [
      {
        id: 'test_1',
        name: 'Welcome Email Subject Test',
        description: 'Testing different subject lines for welcome emails',
        campaignId: 'campaign_1',
        variants: [
          {
            id: 'variant_1',
            name: 'Control - Welcome to CreditAI Pro',
            subject: 'Welcome to CreditAI Pro - Your Credit Repair Journey Starts Now!',
            weight: 50,
            isControl: true
          },
          {
            id: 'variant_2',
            name: 'Test A - Urgent Action Required',
            subject: '🚨 Action Required: Complete Your Credit Profile Setup',
            weight: 50,
            isControl: false
          }
        ],
        trafficSplit: 50,
        testType: 'subject',
        status: 'running',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        winnerCriteria: 'open_rate',
        minSampleSize: 1000,
        confidenceLevel: 95,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdBy: 'admin'
      },
      {
        id: 'test_2',
        name: 'Payment Confirmation Design Test',
        description: 'Testing different designs for payment confirmation emails',
        campaignId: 'campaign_2',
        variants: [
          {
            id: 'variant_3',
            name: 'Control - Simple Design',
            templateId: 'payment-success-simple',
            weight: 50,
            isControl: true
          },
          {
            id: 'variant_4',
            name: 'Test A - Rich Design',
            templateId: 'payment-success-rich',
            weight: 50,
            isControl: false
          }
        ],
        trafficSplit: 30,
        testType: 'full_template',
        status: 'running',
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        winnerCriteria: 'click_rate',
        minSampleSize: 500,
        confidenceLevel: 95,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdBy: 'admin'
      }
    ]

    sampleTests.forEach(test => {
      this.tests.set(test.id, test)
    })

    console.log(`🧪 Initialized ${sampleTests.length} A/B tests`)
  }

  // Test Management
  public createABTest(test: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTest: ABTest = {
      ...test,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.tests.set(id, newTest)
    console.log(`🧪 Created A/B test: ${id}`)
    return id
  }

  public getABTests(): ABTest[] {
    return Array.from(this.tests.values())
  }

  public getABTest(testId: string): ABTest | null {
    return this.tests.get(testId) || null
  }

  public updateABTest(testId: string, updates: Partial<ABTest>): boolean {
    const test = this.tests.get(testId)
    if (!test) {
      return false
    }

    const updatedTest = {
      ...test,
      ...updates,
      updatedAt: new Date()
    }

    this.tests.set(testId, updatedTest)
    console.log(`🧪 Updated A/B test: ${testId}`)
    return true
  }

  public startABTest(testId: string): boolean {
    const test = this.tests.get(testId)
    if (!test || test.status !== 'draft') {
      return false
    }

    test.status = 'running'
    test.startDate = new Date()
    this.tests.set(testId, test)
    console.log(`🧪 Started A/B test: ${testId}`)
    return true
  }

  public pauseABTest(testId: string): boolean {
    const test = this.tests.get(testId)
    if (!test || test.status !== 'running') {
      return false
    }

    test.status = 'paused'
    this.tests.set(testId, test)
    console.log(`🧪 Paused A/B test: ${testId}`)
    return true
  }

  public completeABTest(testId: string, winnerVariantId?: string): boolean {
    const test = this.tests.get(testId)
    if (!test || test.status !== 'running') {
      return false
    }

    test.status = 'completed'
    test.endDate = new Date()
    this.tests.set(testId, test)
    console.log(`🧪 Completed A/B test: ${testId}`)
    return true
  }

  // Participant Management
  public assignParticipant(testId: string, email: string): string | null {
    const test = this.tests.get(testId)
    if (!test || test.status !== 'running') {
      return null
    }

    // Check if participant already exists
    for (const participant of this.participants.values()) {
      if (participant.testId === testId && participant.email === email) {
        return participant.id
      }
    }

    // Assign to variant based on weight
    const variant = this.selectVariant(test.variants)
    if (!variant) {
      return null
    }

    const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const participant: ABTestParticipant = {
      id: participantId,
      testId,
      variantId: variant.id,
      email,
      assignedAt: new Date()
    }

    this.participants.set(participantId, participant)
    console.log(`👤 Assigned participant to test ${testId}, variant ${variant.id}`)
    return participantId
  }

  private selectVariant(variants: EmailVariant[]): EmailVariant | null {
    if (variants.length === 0) {
      return null
    }

    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0)
    const random = Math.random() * totalWeight
    
    let currentWeight = 0
    for (const variant of variants) {
      currentWeight += variant.weight
      if (random <= currentWeight) {
        return variant
      }
    }

    return variants[variants.length - 1] // Fallback
  }

  public recordEmailSent(participantId: string): boolean {
    const participant = this.participants.get(participantId)
    if (!participant) {
      return false
    }

    participant.sentAt = new Date()
    this.participants.set(participantId, participant)
    return true
  }

  public recordEmailOpened(participantId: string): boolean {
    const participant = this.participants.get(participantId)
    if (!participant) {
      return false
    }

    participant.openedAt = new Date()
    this.participants.set(participantId, participant)
    return true
  }

  public recordEmailClicked(participantId: string): boolean {
    const participant = this.participants.get(participantId)
    if (!participant) {
      return false
    }

    participant.clickedAt = new Date()
    this.participants.set(participantId, participant)
    return true
  }

  public recordConversion(participantId: string): boolean {
    const participant = this.participants.get(participantId)
    if (!participant) {
      return false
    }

    participant.convertedAt = new Date()
    this.participants.set(participantId, participant)
    return true
  }

  public recordUnsubscribe(participantId: string): boolean {
    const participant = this.participants.get(participantId)
    if (!participant) {
      return false
    }

    participant.unsubscribedAt = new Date()
    this.participants.set(participantId, participant)
    return true
  }

  public recordBounce(participantId: string): boolean {
    const participant = this.participants.get(participantId)
    if (!participant) {
      return false
    }

    participant.bouncedAt = new Date()
    this.participants.set(participantId, participant)
    return true
  }

  // Results and Analytics
  public calculateTestResults(testId: string): ABTestResult[] {
    const test = this.tests.get(testId)
    if (!test) {
      return []
    }

    const participants = Array.from(this.participants.values())
      .filter(p => p.testId === testId)

    const results: ABTestResult[] = []

    for (const variant of test.variants) {
      const variantParticipants = participants.filter(p => p.variantId === variant.id)
      
      const metrics = this.calculateMetrics(variantParticipants)
      const rates = this.calculateRates(metrics)
      const statisticalSignificance = this.calculateStatisticalSignificance(variantParticipants, test)
      const performance = this.calculatePerformance(metrics, rates, variant.isControl)

      const result: ABTestResult = {
        testId,
        variantId: variant.id,
        variantName: variant.name,
        isControl: variant.isControl,
        metrics,
        rates,
        statisticalSignificance,
        performance
      }

      results.push(result)
    }

    // Calculate ranks and improvements
    this.calculateRanksAndImprovements(results)

    this.results.set(testId, results)
    return results
  }

  private calculateMetrics(participants: ABTestParticipant[]) {
    const emailsSent = participants.filter(p => p.sentAt).length
    const emailsDelivered = participants.filter(p => p.sentAt && !p.bouncedAt).length
    const emailsOpened = participants.filter(p => p.openedAt).length
    const emailsClicked = participants.filter(p => p.clickedAt).length
    const conversions = participants.filter(p => p.convertedAt).length
    const unsubscribes = participants.filter(p => p.unsubscribedAt).length
    const bounces = participants.filter(p => p.bouncedAt).length

    return {
      emailsSent,
      emailsDelivered,
      emailsOpened,
      emailsClicked,
      conversions,
      revenue: conversions * 50, // Mock revenue calculation
      unsubscribes,
      bounces
    }
  }

  private calculateRates(metrics: any) {
    return {
      deliveryRate: metrics.emailsSent > 0 ? (metrics.emailsDelivered / metrics.emailsSent) * 100 : 0,
      openRate: metrics.emailsDelivered > 0 ? (metrics.emailsOpened / metrics.emailsDelivered) * 100 : 0,
      clickRate: metrics.emailsOpened > 0 ? (metrics.emailsClicked / metrics.emailsOpened) * 100 : 0,
      conversionRate: metrics.emailsClicked > 0 ? (metrics.conversions / metrics.emailsClicked) * 100 : 0,
      unsubscribeRate: metrics.emailsDelivered > 0 ? (metrics.unsubscribes / metrics.emailsDelivered) * 100 : 0,
      bounceRate: metrics.emailsSent > 0 ? (metrics.bounces / metrics.emailsSent) * 100 : 0
    }
  }

  private calculateStatisticalSignificance(participants: ABTestParticipant[], test: ABTest) {
    // Simplified statistical significance calculation
    const sampleSize = participants.length
    const confidenceLevel = test.confidenceLevel / 100
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.58 // 95% or 99%
    
    const marginOfError = zScore * Math.sqrt((0.5 * 0.5) / sampleSize)
    const pValue = 0.05 // Simplified

    return {
      isSignificant: sampleSize >= test.minSampleSize && marginOfError < 0.1,
      confidenceLevel: test.confidenceLevel,
      pValue,
      marginOfError: marginOfError * 100
    }
  }

  private calculatePerformance(metrics: any, rates: any, isControl: boolean) {
    // Calculate performance score based on multiple metrics
    const score = (rates.openRate * 0.3) + (rates.clickRate * 0.4) + (rates.conversionRate * 0.3)
    
    return {
      score,
      rank: 0, // Will be calculated later
      improvement: 0 // Will be calculated later
    }
  }

  private calculateRanksAndImprovements(results: ABTestResult[]) {
    // Sort by performance score
    results.sort((a, b) => b.performance.score - a.performance.score)
    
    // Assign ranks
    results.forEach((result, index) => {
      result.performance.rank = index + 1
    })

    // Calculate improvements over control
    const controlResult = results.find(r => r.isControl)
    if (controlResult) {
      results.forEach(result => {
        if (!result.isControl) {
          const improvement = ((result.performance.score - controlResult.performance.score) / controlResult.performance.score) * 100
          result.performance.improvement = improvement
        }
      })
    }
  }

  public getTestResults(testId: string): ABTestResult[] {
    return this.results.get(testId) || []
  }

  public getTestWinner(testId: string): ABTestResult | null {
    const results = this.getTestResults(testId)
    if (results.length === 0) {
      return null
    }

    // Return the highest performing variant
    return results.reduce((winner, current) => 
      current.performance.score > winner.performance.score ? current : winner
    )
  }

  public getTestRecommendations(testId: string): {
    shouldContinue: boolean
    recommendedAction: string
    confidence: number
  } {
    const results = this.getTestResults(testId)
    if (results.length < 2) {
      return {
        shouldContinue: true,
        recommendedAction: 'Need more data',
        confidence: 0
      }
    }

    const winner = this.getTestWinner(testId)
    if (!winner) {
      return {
        shouldContinue: true,
        recommendedAction: 'Continue testing',
        confidence: 0
      }
    }

    const isSignificant = winner.statisticalSignificance.isSignificant
    const improvement = winner.performance.improvement

    if (isSignificant && improvement > 10) {
      return {
        shouldContinue: false,
        recommendedAction: `Declare winner: ${winner.variantName}`,
        confidence: winner.statisticalSignificance.confidenceLevel
      }
    } else if (isSignificant && improvement < -10) {
      return {
        shouldContinue: false,
        recommendedAction: 'Keep control variant',
        confidence: winner.statisticalSignificance.confidenceLevel
      }
    } else {
      return {
        shouldContinue: true,
        recommendedAction: 'Continue testing - results not significant',
        confidence: winner.statisticalSignificance.confidenceLevel
      }
    }
  }
}

// Singleton instance
export const emailABTestingService = new EmailABTestingService()

// API functions
export const createABTest = (test: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>) => {
  return emailABTestingService.createABTest(test)
}

export const getABTests = () => {
  return emailABTestingService.getABTests()
}

export const getABTest = (testId: string) => {
  return emailABTestingService.getABTest(testId)
}

export const updateABTest = (testId: string, updates: Partial<ABTest>) => {
  return emailABTestingService.updateABTest(testId, updates)
}

export const startABTest = (testId: string) => {
  return emailABTestingService.startABTest(testId)
}

export const pauseABTest = (testId: string) => {
  return emailABTestingService.pauseABTest(testId)
}

export const completeABTest = (testId: string, winnerVariantId?: string) => {
  return emailABTestingService.completeABTest(testId, winnerVariantId)
}

export const assignParticipant = (testId: string, email: string) => {
  return emailABTestingService.assignParticipant(testId, email)
}

export const recordEmailSent = (participantId: string) => {
  return emailABTestingService.recordEmailSent(participantId)
}

export const recordEmailOpened = (participantId: string) => {
  return emailABTestingService.recordEmailOpened(participantId)
}

export const recordEmailClicked = (participantId: string) => {
  return emailABTestingService.recordEmailClicked(participantId)
}

export const recordConversion = (participantId: string) => {
  return emailABTestingService.recordConversion(participantId)
}

export const recordUnsubscribe = (participantId: string) => {
  return emailABTestingService.recordUnsubscribe(participantId)
}

export const recordBounce = (participantId: string) => {
  return emailABTestingService.recordBounce(participantId)
}

export const calculateTestResults = (testId: string) => {
  return emailABTestingService.calculateTestResults(testId)
}

export const getTestResults = (testId: string) => {
  return emailABTestingService.getTestResults(testId)
}

export const getTestWinner = (testId: string) => {
  return emailABTestingService.getTestWinner(testId)
}

export const getTestRecommendations = (testId: string) => {
  return emailABTestingService.getTestRecommendations(testId)
}
