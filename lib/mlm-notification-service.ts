"use client"

export interface MLMNotificationServiceCallback {
  (notification: any): void
}

class MLMNotificationService {
  private static instance: MLMNotificationService | null = null
  private addNotificationCallbacks: Set<MLMNotificationServiceCallback> = new Set()

  private constructor() {
    // Initialize service
  }

  public static getInstance(): MLMNotificationService {
    if (!MLMNotificationService.instance) {
      MLMNotificationService.instance = new MLMNotificationService()
    }
    return MLMNotificationService.instance
  }

  // Register callback for adding notifications
  public setAddNotificationCallback(callback: MLMNotificationServiceCallback): void {
    this.addNotificationCallbacks.add(callback)
    console.log('🔔 MLMNotificationService: Callback registered')
  }

  // Remove callback
  public removeAddNotificationCallback(callback: MLMNotificationServiceCallback): void {
    this.addNotificationCallbacks.delete(callback)
    console.log('🔔 MLMNotificationService: Callback removed')
  }

  // Add notification and notify all callbacks
  public addNotification(notification: any): void {
    console.log('🔔 MLMNotificationService: Adding notification:', notification)
    
    // Notify all registered callbacks
    this.addNotificationCallbacks.forEach(callback => {
      try {
        callback(notification)
      } catch (error) {
        console.error('🔔 MLMNotificationService: Error in callback:', error)
      }
    })
  }

  // Create team join notification
  public createTeamJoinNotification(memberName: string, rank: string, teamCode: string) {
    const notification = {
      title: "New Team Member Joined! 👥",
      message: `${memberName} has joined your team using code ${teamCode} as ${rank}`,
      type: "team_join",
      priority: "high",
      category: "team",
      actions: [
        {
          label: "View Team",
          action: "view_team",
          variant: "default"
        }
      ]
    }
    this.addNotification(notification)
  }

  // Create rank advancement notification
  public createRankAdvancementNotification(memberName: string, oldRank: string, newRank: string) {
    const notification = {
      title: "Rank Advancement! 🏆",
      message: `${memberName} has been promoted from ${oldRank} to ${newRank}`,
      type: "rank_advancement",
      priority: "high",
      category: "achievement",
      actions: [
        {
          label: "View Team Performance",
          action: "view_milestone",
          variant: "default"
        }
      ]
    }
    this.addNotification(notification)
  }

  // Create commission earned notification
  public createCommissionEarnedNotification(amount: number, type: string, description: string) {
    const notification = {
      title: "Commission Earned! 💰",
      message: `You earned $${amount.toFixed(2)} in ${type}: ${description}`,
      type: "commission_earned",
      priority: "high",
      category: "earnings",
      actions: [
        {
          label: "View Earnings",
          action: "view_earnings",
          variant: "default"
        }
      ]
    }
    this.addNotification(notification)
  }

  // Create payout processed notification
  public createPayoutProcessedNotification(amount: number, method: string) {
    const notification = {
      title: "Payout Processed! 💳",
      message: `Your payout of $${amount.toFixed(2)} has been processed via ${method}`,
      type: "payout_processed",
      priority: "high",
      category: "payout",
      actions: [
        {
          label: "View Transaction",
          action: "view_transaction",
          variant: "default"
        }
      ]
    }
    this.addNotification(notification)
  }

  // Create training completed notification
  public createTrainingCompletedNotification(courseName: string, points: number) {
    const notification = {
      title: "Training Completed! 📚",
      message: `Great job completing "${courseName}"! You earned ${points} points.`,
      type: "training_completed",
      priority: "medium",
      category: "training",
      actions: [
        {
          label: "Continue Training",
          action: "continue_training",
          variant: "outline"
        }
      ]
    }
    this.addNotification(notification)
  }

  // Create milestone achieved notification
  public createMilestoneNotification(milestone: string, description: string) {
    const notification = {
      title: "Milestone Achieved! 🎯",
      message: `${milestone}: ${description}`,
      type: "milestone",
      priority: "high",
      category: "achievement",
      actions: [
        {
          label: "View Milestone",
          action: "view_milestone",
          variant: "default"
        }
      ]
    }
    this.addNotification(notification)
  }

  // Create invitation sent notification
  public createInvitationSentNotification(email: string, teamCode: string) {
    const notification = {
      title: "Invitation Sent! 📤",
      message: `Invitation sent to ${email} with team code ${teamCode}`,
      type: "invitation_sent",
      priority: "medium",
      category: "team",
      actions: [
        {
          label: "View Team",
          action: "view_team",
          variant: "outline"
        }
      ]
    }
    this.addNotification(notification)
  }

  // Create alert notification
  public createAlertNotification(title: string, message: string, action?: string) {
    const notification = {
      title: `Alert: ${title}`,
      message: message,
      type: "alert",
      priority: "high",
      category: "system",
      actions: action ? [
        {
          label: "View Details",
          action: action,
          variant: "destructive"
        }
      ] : []
    }
    this.addNotification(notification)
  }

  // Create info notification
  public createInfoNotification(title: string, message: string, action?: string) {
    const notification = {
      title: title,
      message: message,
      type: "info",
      priority: "medium",
      category: "system",
      actions: action ? [
        {
          label: "Learn More",
          action: action,
          variant: "outline"
        }
      ] : []
    }
    this.addNotification(notification)
  }
}

// Create and export singleton instance
export const mlmNotificationService = MLMNotificationService.getInstance()
export default MLMNotificationService