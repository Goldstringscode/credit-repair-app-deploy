// Client-safe email service for Credit Repair App
// This file provides mock implementations for client-side compatibility
// For server-side functionality, use lib/email-service-server.ts

export interface InvitationEmailData {
  to: string
  name: string
  sponsorName: string
  teamCode: string
  invitationCode: string
  invitationLink: string
}

export interface WelcomeEmailData {
  to: string
  name: string
  teamCode: string
  dashboardLink: string
}

export interface CreditRepairEmailData {
  to: string
  name: string
  type: 'welcome' | 'update' | 'completion'
  data: any
}

export interface AdminEmailData {
  to: string
  subject: string
  type: 'notification' | 'alert'
  data: any
}

// MLM-specific email interfaces
export interface TeamJoinEmailData {
  to: string
  name: string
  teamCode: string
  sponsorName: string
  dashboardLink: string
}

export interface TeamCreationEmailData {
  to: string
  name: string
  teamCode: string
  dashboardLink: string
}

export interface CommissionEarnedEmailData {
  to: string
  name: string
  amount: number
  type: string
  level: number
  totalEarnings: number
  dashboardLink: string
}

export interface RankAdvancementEmailData {
  to: string
  name: string
  oldRank: string
  newRank: string
  benefits: string[]
  dashboardLink: string
}

export interface NewTeamMemberEmailData {
  to: string
  sponsorName: string
  newMemberName: string
  newMemberEmail: string
  teamCode: string
  dashboardLink: string
}

export interface PayoutProcessedEmailData {
  to: string
  name: string
  amount: number
  method: string
  transactionId: string
  dashboardLink: string
}

export interface TrainingCompletionEmailData {
  to: string
  name: string
  courseName: string
  pointsEarned: number
  nextCourse: string
  dashboardLink: string
}

export interface TaskCompletionEmailData {
  to: string
  name: string
  taskName: string
  pointsEarned: number
  nextTask: string
  dashboardLink: string
}

// Client-safe mock implementations
export async function sendInvitationEmail(data: InvitationEmailData): Promise<any> {
  console.log('📧 Mock: Sending MLM Invitation Email (client-side)')
  console.log(`   To: ${data.to}`)
  console.log(`   Name: ${data.name}`)
  console.log(`   Sponsor: ${data.sponsorName}`)
  console.log(`   Team Code: ${data.teamCode}`)
  console.log(`   Invitation Code: ${data.invitationCode}`)
  console.log(`   Invitation Link: ${data.invitationLink}`)
  
  // In a real implementation, this would call the API endpoint
  try {
    const response = await fetch('/api/email/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'send_invitation_email', 
        data: data 
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Email sent via API:', result)
      return result
    } else {
      throw new Error('API call failed')
    }
  } catch (error) {
    console.error('❌ Failed to send invitation email via API:', error)
    // Return mock response for client-side compatibility
    return { messageId: 'mock-invitation-' + Date.now() }
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<any> {
  console.log('📧 Mock: Sending MLM Welcome Email (client-side)')
  console.log(`   To: ${data.to}`)
  console.log(`   Name: ${data.name}`)
  console.log(`   Team Code: ${data.teamCode}`)
  console.log(`   Dashboard Link: ${data.dashboardLink}`)
  
  try {
    const response = await fetch('/api/email/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'send_welcome_email', 
        data: data 
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Email sent via API:', result)
      return result
    } else {
      throw new Error('API call failed')
    }
  } catch (error) {
    console.error('❌ Failed to send welcome email via API:', error)
    return { messageId: 'mock-welcome-' + Date.now() }
  }
}

export async function sendCreditRepairEmail(data: CreditRepairEmailData): Promise<any> {
  console.log('📧 Mock: Sending Credit Repair Email (client-side)')
  console.log(`   To: ${data.to}`)
  console.log(`   Name: ${data.name}`)
  console.log(`   Type: ${data.type}`)
  
  try {
    const response = await fetch('/api/email/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'send_credit_repair_email', 
        data: data 
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Email sent via API:', result)
      return result
    } else {
      throw new Error('API call failed')
    }
  } catch (error) {
    console.error('❌ Failed to send credit repair email via API:', error)
    return { messageId: 'mock-credit-repair-' + Date.now() }
  }
}

export async function sendCreditRepairTemplateEmail(data: {
  to: string
  subject: string
  htmlContent: string
  textContent: string
}): Promise<any> {
  console.log('📧 Mock: Sending Credit Repair Template Email (client-side)')
  console.log(`   To: ${data.to}`)
  console.log(`   Subject: ${data.subject}`)
  
  try {
    const response = await fetch('/api/email/dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'send_credit_repair_template_email', 
        data: data 
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Email sent via API:', result)
      return result
    } else {
      throw new Error('API call failed')
    }
  } catch (error) {
    console.error('❌ Failed to send credit repair template email via API:', error)
    return { messageId: 'mock-template-' + Date.now() }
  }
}

// Mock implementations for all other functions
export const sendTeamUpdateEmail = async (data: any) => {
  console.log('📧 Mock: Team update email (client-side)')
  return { messageId: 'mock-team-update-' + Date.now() }
}

export const sendAdminEmail = async (data: any) => {
  console.log('📧 Mock: Admin email (client-side)')
  return { messageId: 'mock-admin-' + Date.now() }
}

export const sendTeamJoinEmail = async (data: any) => {
  console.log('📧 Mock: Team join email (client-side)')
  return { messageId: 'mock-team-join-' + Date.now() }
}

export const sendTeamCreationEmail = async (data: any) => {
  console.log('📧 Mock: Team creation email (client-side)')
  return { messageId: 'mock-team-creation-' + Date.now() }
}

export const sendCommissionEarnedEmail = async (data: any) => {
  console.log('📧 Mock: Commission earned email (client-side)')
  return { messageId: 'mock-commission-' + Date.now() }
}

export const sendRankAdvancementEmail = async (data: any) => {
  console.log('📧 Mock: Rank advancement email (client-side)')
  return { messageId: 'mock-rank-' + Date.now() }
}

export const sendNewTeamMemberEmail = async (data: any) => {
  console.log('📧 Mock: New team member email (client-side)')
  return { messageId: 'mock-new-member-' + Date.now() }
}

export const sendPayoutProcessedEmail = async (data: any) => {
  console.log('📧 Mock: Payout processed email (client-side)')
  return { messageId: 'mock-payout-' + Date.now() }
}

export const sendTrainingCompletionEmail = async (data: any) => {
  console.log('📧 Mock: Training completion email (client-side)')
  return { messageId: 'mock-training-' + Date.now() }
}

export const sendTaskCompletionEmail = async (data: any) => {
  console.log('📧 Mock: Task completion email (client-side)')
  return { messageId: 'mock-task-' + Date.now() }
}

// Mock email service for client-side compatibility
export const emailService = {
  sendInvitationEmail,
  sendWelcomeEmail,
  sendCreditRepairEmail,
  sendCreditRepairTemplateEmail,
  sendTeamUpdateEmail,
  sendAdminEmail,
  sendTeamJoinEmail,
  sendTeamCreationEmail,
  sendCommissionEarnedEmail,
  sendRankAdvancementEmail,
  sendNewTeamMemberEmail,
  sendPayoutProcessedEmail,
  sendTrainingCompletionEmail,
  sendTaskCompletionEmail
}

export class EmailService {
  static async sendInvitationEmail(data: InvitationEmailData) {
    return sendInvitationEmail(data)
  }
  
  static async sendWelcomeEmail(data: WelcomeEmailData) {
    return sendWelcomeEmail(data)
  }
  
  static async sendCreditRepairEmail(data: CreditRepairEmailData) {
    return sendCreditRepairEmail(data)
  }
  
  static async sendCreditRepairTemplateEmail(data: any) {
    return sendCreditRepairTemplateEmail(data)
  }

  static async sendPasswordResetEmail(email: string, name: string, resetToken: string) {
    console.log('📧 Mock: Sending Password Reset Email (client-side)')
    console.log(`   To: ${email}`)
    console.log(`   Name: ${name}`)
    console.log(`   Reset Token: ${resetToken}`)
    
    try {
      const response = await fetch('/api/email/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_password_reset_email', 
          data: { email, name, resetToken }
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Password reset email sent via API:', result)
        return result
      } else {
        throw new Error('API call failed')
      }
    } catch (error) {
      console.error('❌ Failed to send password reset email via API:', error)
      // Return mock response for client-side compatibility
      return { success: true, messageId: 'mock-password-reset-' + Date.now() }
    }
  }
}
