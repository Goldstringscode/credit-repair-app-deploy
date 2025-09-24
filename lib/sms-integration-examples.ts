// SMS Integration Examples for Credit Repair App and MLM System

import { smsNotificationService } from './sms-notification-service'

/**
 * Credit Repair App Integration Examples
 */

// Example: Credit score update notification
export async function notifyCreditScoreUpdate(userData: {
  userName: string
  phoneNumber: string
  previousScore: number
  newScore: number
  scoreIncrease: number
}) {
  await smsNotificationService.processEvent('credit_score_updated', {
    userName: userData.userName,
    phoneNumber: userData.phoneNumber,
    previousScore: userData.previousScore,
    newScore: userData.newScore,
    scoreIncrease: userData.scoreIncrease,
    dashboardUrl: 'https://creditai.com/dashboard'
  })
}

// Example: Payment confirmation notification
export async function notifyPaymentConfirmation(paymentData: {
  userName: string
  phoneNumber: string
  amount: number
  planName: string
  nextBillingDate: string
}) {
  await smsNotificationService.processEvent('payment_completed', {
    userName: paymentData.userName,
    phoneNumber: paymentData.phoneNumber,
    amount: paymentData.amount,
    planName: paymentData.planName,
    nextBillingDate: paymentData.nextBillingDate,
    dashboardUrl: 'https://creditai.com/dashboard'
  })
}

// Example: Dispute letter ready notification
export async function notifyDisputeLetterReady(disputeData: {
  userName: string
  phoneNumber: string
  accountName: string
}) {
  await smsNotificationService.processEvent('dispute_letter_created', {
    userName: disputeData.userName,
    phoneNumber: disputeData.phoneNumber,
    accountName: disputeData.accountName,
    dashboardUrl: 'https://creditai.com/dashboard'
  })
}

// Example: New user welcome
export async function notifyNewUserWelcome(userData: {
  userName: string
  phoneNumber: string
}) {
  await smsNotificationService.processEvent('user_registered', {
    userName: userData.userName,
    phoneNumber: userData.phoneNumber,
    dashboardUrl: 'https://creditai.com/dashboard'
  })
}

// Example: Upload reports reminder
export async function notifyUploadReportsReminder(userData: {
  userName: string
  phoneNumber: string
}) {
  await smsNotificationService.processEvent('scheduled_reminder', {
    userName: userData.userName,
    phoneNumber: userData.phoneNumber,
    reminderType: 'upload_reports',
    dashboardUrl: 'https://creditai.com/dashboard'
  })
}

/**
 * MLM System Integration Examples
 */

// Example: Commission earned notification
export async function notifyCommissionEarned(commissionData: {
  userName: string
  phoneNumber: string
  amount: number
  totalEarnings: number
}) {
  await smsNotificationService.processEvent('commission_calculated', {
    userName: commissionData.userName,
    phoneNumber: commissionData.phoneNumber,
    amount: commissionData.amount,
    totalEarnings: commissionData.totalEarnings
  })
}

// Example: New downline member notification
export async function notifyNewDownlineMember(downlineData: {
  userName: string
  phoneNumber: string
  newMemberName: string
}) {
  await smsNotificationService.processEvent('downline_member_added', {
    userName: downlineData.userName,
    phoneNumber: downlineData.phoneNumber,
    newMemberName: downlineData.newMemberName,
    dashboardUrl: 'https://creditai.com/mlm/dashboard'
  })
}

// Example: Rank achievement notification
export async function notifyRankAchievement(rankData: {
  userName: string
  phoneNumber: string
  newRank: string
}) {
  await smsNotificationService.processEvent('rank_updated', {
    userName: rankData.userName,
    phoneNumber: rankData.phoneNumber,
    newRank: rankData.newRank,
    rankChanged: true
  })
}

// Example: Bonus earned notification
export async function notifyBonusEarned(bonusData: {
  userName: string
  phoneNumber: string
  bonusAmount: number
  bonusType: string
}) {
  await smsNotificationService.processEvent('bonus_calculated', {
    userName: bonusData.userName,
    phoneNumber: bonusData.phoneNumber,
    bonusAmount: bonusData.bonusAmount,
    bonusType: bonusData.bonusType
  })
}

// Example: MLM user welcome
export async function notifyMLMUserWelcome(userData: {
  userName: string
  phoneNumber: string
}) {
  await smsNotificationService.processEvent('mlm_user_registered', {
    userName: userData.userName,
    phoneNumber: userData.phoneNumber,
    dashboardUrl: 'https://creditai.com/mlm/dashboard'
  })
}

/**
 * System Integration Examples
 */

// Example: Security alert
export async function notifySecurityAlert(userData: {
  userName: string
  phoneNumber: string
}) {
  await smsNotificationService.processEvent('security_breach_detected', {
    userName: userData.userName,
    phoneNumber: userData.phoneNumber
  })
}

// Example: Password reset
export async function notifyPasswordReset(userData: {
  userName: string
  phoneNumber: string
  resetCode: string
}) {
  await smsNotificationService.processEvent('password_reset_requested', {
    userName: userData.userName,
    phoneNumber: userData.phoneNumber,
    resetCode: userData.resetCode
  })
}

// Example: Support ticket created
export async function notifySupportTicketCreated(ticketData: {
  userName: string
  phoneNumber: string
  ticketId: string
}) {
  await smsNotificationService.processEvent('support_ticket_created', {
    userName: ticketData.userName,
    phoneNumber: ticketData.phoneNumber,
    ticketId: ticketData.ticketId,
    dashboardUrl: 'https://creditai.com/dashboard/support'
  })
}

// Example: Support ticket resolved
export async function notifySupportTicketResolved(ticketData: {
  userName: string
  phoneNumber: string
  ticketId: string
}) {
  await smsNotificationService.processEvent('support_ticket_resolved', {
    userName: ticketData.userName,
    phoneNumber: ticketData.phoneNumber,
    ticketId: ticketData.ticketId,
    dashboardUrl: 'https://creditai.com/dashboard/support'
  })
}

/**
 * Marketing Integration Examples
 */

// Example: Promotional offer
export async function notifyPromotionalOffer(offerData: {
  userName: string
  phoneNumber: string
  discount: number
  promoCode: string
  expiryDate: string
}) {
  await smsNotificationService.processEvent('promotional_campaign', {
    userName: offerData.userName,
    phoneNumber: offerData.phoneNumber,
    discount: offerData.discount,
    promoCode: offerData.promoCode,
    expiryDate: offerData.expiryDate
  })
}

// Example: Feature announcement
export async function notifyFeatureAnnouncement(featureData: {
  userName: string
  phoneNumber: string
  featureName: string
}) {
  await smsNotificationService.processEvent('feature_released', {
    userName: featureData.userName,
    phoneNumber: featureData.phoneNumber,
    featureName: featureData.featureName,
    dashboardUrl: 'https://creditai.com/dashboard'
  })
}

/**
 * Usage Examples in Your App
 */

// In your credit repair app, when a credit score updates:
/*
import { notifyCreditScoreUpdate } from '@/lib/sms-integration-examples'

// When credit score is updated
await notifyCreditScoreUpdate({
  userName: 'John Doe',
  phoneNumber: '+1234567890',
  previousScore: 650,
  newScore: 720,
  scoreIncrease: 70
})
*/

// In your MLM system, when a commission is earned:
/*
import { notifyCommissionEarned } from '@/lib/sms-integration-examples'

// When commission is calculated
await notifyCommissionEarned({
  userName: 'Jane Smith',
  phoneNumber: '+1987654321',
  amount: 150.00,
  totalEarnings: 2500.00
})
*/

// In your payment system, when payment is successful:
/*
import { notifyPaymentConfirmation } from '@/lib/sms-integration-examples'

// When payment is completed
await notifyPaymentConfirmation({
  userName: 'Mike Johnson',
  phoneNumber: '+1555123456',
  amount: 99.99,
  planName: 'Professional Plan',
  nextBillingDate: '2024-02-01'
})
*/
