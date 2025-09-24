// Real-Time Credit Monitoring Service
// Handles continuous monitoring, alerts, and notifications

import { CreditAlert, CreditScore, MonitoringSettings } from './credit-bureau-apis'

export interface MonitoringEvent {
  id: string
  type: 'score_change' | 'new_account' | 'inquiry' | 'payment_missed' | 'balance_change' | 'identity_alert'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: string
  bureau: 'experian' | 'equifax' | 'transunion' | 'all'
  data: any
  actionRequired: boolean
  actionUrl?: string
}

export interface MonitoringSession {
  userId: string
  isActive: boolean
  lastCheck: string
  nextCheck: string
  settings: MonitoringSettings
  alerts: CreditAlert[]
  scores: CreditScore[]
}

export class RealTimeMonitor {
  private static sessions: Map<string, MonitoringSession> = new Map()
  private static intervalId: NodeJS.Timeout | null = null
  private static readonly CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

  static startMonitoring(userId: string, settings: MonitoringSettings) {
    const session: MonitoringSession = {
      userId,
      isActive: true,
      lastCheck: new Date().toISOString(),
      nextCheck: new Date(Date.now() + this.CHECK_INTERVAL).toISOString(),
      settings,
      alerts: [],
      scores: []
    }

    this.sessions.set(userId, session)

    // Start the monitoring loop if not already running
    if (!this.intervalId) {
      this.startMonitoringLoop()
    }

    console.log(`🔍 Started monitoring for user ${userId}`)
  }

  static stopMonitoring(userId: string) {
    const session = this.sessions.get(userId)
    if (session) {
      session.isActive = false
      this.sessions.set(userId, session)
      console.log(`⏹️ Stopped monitoring for user ${userId}`)
    }
  }

  static updateSettings(userId: string, settings: MonitoringSettings) {
    const session = this.sessions.get(userId)
    if (session) {
      session.settings = settings
      this.sessions.set(userId, session)
      console.log(`⚙️ Updated monitoring settings for user ${userId}`)
    }
  }

  private static startMonitoringLoop() {
    this.intervalId = setInterval(async () => {
      await this.checkAllSessions()
    }, this.CHECK_INTERVAL)

    console.log('🔄 Real-time monitoring loop started')
  }

  private static async checkAllSessions() {
    const activeSessions = Array.from(this.sessions.values()).filter(session => session.isActive)
    
    for (const session of activeSessions) {
      try {
        await this.checkUserCredit(session)
      } catch (error) {
        console.error(`❌ Error monitoring user ${session.userId}:`, error)
      }
    }
  }

  private static async checkUserCredit(session: MonitoringSession) {
    const now = new Date()
    const nextCheck = new Date(session.nextCheck)

    if (now < nextCheck) {
      return // Not time to check yet
    }

    try {
      // Simulate checking credit scores and reports
      const { CreditMonitoringService } = await import('./credit-bureau-apis')
      
      // Get latest scores
      const scores = await CreditMonitoringService.getAllCreditScores(session.userId)
      const alerts = await CreditMonitoringService.getAllAlerts(session.userId, session.lastCheck)

      // Check for score changes
      if (session.scores.length > 0) {
        for (let i = 0; i < scores.length; i++) {
          const currentScore = scores[i]
          const previousScore = session.scores.find(s => s.bureau === currentScore.bureau)
          
          if (previousScore && previousScore.score !== currentScore.score) {
            const change = currentScore.score - previousScore.score
            const severity = Math.abs(change) >= 20 ? 'high' : Math.abs(change) >= 10 ? 'medium' : 'low'
            
            const event: MonitoringEvent = {
              id: `score-change-${Date.now()}-${i}`,
              type: 'score_change',
              severity,
              title: `Credit Score ${change > 0 ? 'Increased' : 'Decreased'}`,
              description: `Your ${currentScore.bureau} credit score ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} points`,
              timestamp: new Date().toISOString(),
              bureau: currentScore.bureau,
              data: { current: currentScore.score, previous: previousScore.score, change },
              actionRequired: change < -10,
              actionUrl: change < -10 ? '/dashboard/monitoring/alerts/score-drop' : undefined
            }

            await this.processEvent(session.userId, event)
          }
        }
      }

      // Check for new alerts
      for (const alert of alerts) {
        const event: MonitoringEvent = {
          id: alert.id,
          type: alert.type as any,
          severity: alert.severity as any,
          title: alert.title,
          description: alert.description,
          timestamp: alert.date,
          bureau: alert.bureau,
          data: alert,
          actionRequired: alert.actionRequired,
          actionUrl: alert.actionUrl
        }

        await this.processEvent(session.userId, event)
      }

      // Update session
      session.scores = scores
      session.alerts = [...session.alerts, ...alerts]
      session.lastCheck = new Date().toISOString()
      session.nextCheck = new Date(Date.now() + this.CHECK_INTERVAL).toISOString()
      
      this.sessions.set(session.userId, session)

    } catch (error) {
      console.error(`❌ Error checking credit for user ${session.userId}:`, error)
    }
  }

  private static async processEvent(userId: string, event: MonitoringEvent) {
    const session = this.sessions.get(userId)
    if (!session) return

    // Check if we should send notifications based on settings
    if (this.shouldNotify(session.settings, event)) {
      await this.sendNotification(userId, event)
    }

    // Store the event
    session.alerts.push({
      id: event.id,
      type: event.type,
      severity: event.severity,
      title: event.title,
      description: event.description,
      date: event.timestamp,
      bureau: event.bureau,
      actionRequired: event.actionRequired,
      actionUrl: event.actionUrl
    })

    this.sessions.set(userId, session)
  }

  private static shouldNotify(settings: MonitoringSettings, event: MonitoringEvent): boolean {
    if (!settings.enabled) return false

    // Check frequency settings
    if (settings.frequency === 'weekly' && event.severity === 'low') return false
    if (settings.frequency === 'daily' && event.severity === 'low' && event.type === 'inquiry') return false

    // Check specific alert types
    switch (event.type) {
      case 'score_change':
        return settings.scoreAlerts.enabled && 
               Math.abs(event.data.change) >= settings.scoreAlerts.threshold
      case 'new_account':
        return settings.newAccountAlerts
      case 'inquiry':
        return settings.inquiryAlerts
      case 'payment_missed':
        return settings.paymentAlerts
      case 'balance_change':
        return settings.balanceAlerts.enabled && 
               Math.abs(event.data.change) >= settings.balanceAlerts.threshold
      default:
        return true
    }
  }

  private static async sendNotification(userId: string, event: MonitoringEvent) {
    // In a real implementation, you would:
    // 1. Send email notifications
    // 2. Send SMS notifications
    // 3. Send push notifications
    // 4. Store in database
    // 5. Update user dashboard

    console.log(`📧 Sending notification to user ${userId}:`, {
      type: event.type,
      severity: event.severity,
      title: event.title
    })

    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  static getSession(userId: string): MonitoringSession | undefined {
    return this.sessions.get(userId)
  }

  static getAllSessions(): MonitoringSession[] {
    return Array.from(this.sessions.values())
  }

  static getActiveSessionsCount(): number {
    return Array.from(this.sessions.values()).filter(session => session.isActive).length
  }

  static stopAllMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    this.sessions.clear()
    console.log('⏹️ Stopped all monitoring sessions')
  }
}

// Auto-start monitoring for demo purposes
if (typeof window !== 'undefined') {
  // This will run in the browser
  console.log('🔄 Real-time credit monitoring service initialized')
}
