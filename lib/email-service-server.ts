// Server-only email service for Credit Repair App
// This file should only be imported by server-side code (API routes)
import { getEmailConfig, EMAIL_TEMPLATES, getEmailService } from './email-config'

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

// Create a transporter for sending emails
const createTransporter = async () => {
  const config = getEmailConfig()
  const service = getEmailService()
  
  console.log(`📧 Using email service: ${service}`)
  console.log(`📧 SMTP Host: ${config.host}:${config.port}`)
  
  // Dynamic import to avoid browser compatibility issues
  const nodemailer = await import('nodemailer')
  
  return nodemailer.default.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    tls: {
      rejectUnauthorized: false // For development, set to true in production
    }
  })
}

export async function sendInvitationEmail(data: InvitationEmailData): Promise<any> {
  try {
    console.log('📧 Sending MLM Invitation Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Sponsor: ${data.sponsorName}`)
    console.log(`   Team Code: ${data.teamCode}`)
    console.log(`   Invitation Code: ${data.invitationCode}`)
    console.log(`   Invitation Link: ${data.invitationLink}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    const template = EMAIL_TEMPLATES.MLM_INVITATION
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: template.subject(data.sponsorName, data.teamCode),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎉 You're Invited to Join Our MLM Team!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>${data.sponsorName}</strong> has invited you to join their exclusive MLM team. 
              This is your opportunity to start building your own successful business!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Your Team Information:</h3>
              <p><strong>Team Code:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${data.teamCode}</code></p>
              <p><strong>Invitation Code:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${data.invitationCode}</code></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.invitationLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                🚀 Join Team Now
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                ⏰ <strong>Important:</strong> This invitation expires in 7 days. Don't miss out on this opportunity!
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you have any questions, please contact ${data.sponsorName} or reply to this email.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 MLM Team. All rights reserved.</p>
          </div>
        </div>
      `
    }
    
    // Send the email
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', info.messageId)
    
    // Only show preview URL for test services
    const service = getEmailService()
    if (service === 'gmail' && process.env.NODE_ENV === 'development') {
      const nodemailer = await import('nodemailer')
      console.log('📧 Preview URL:', nodemailer.default.getTestMessageUrl(info))
    }
    
    return info
  } catch (error) {
    console.error('❌ Failed to send invitation email:', error)
    throw error // Re-throw to handle in calling function
  }
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<any> {
  try {
    console.log('📧 Sending MLM Welcome Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Team Code: ${data.teamCode}`)
    console.log(`   Dashboard Link: ${data.dashboardLink}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: `🎉 Welcome to Your MLM Team, ${data.name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Your MLM Journey!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your success story starts now</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Congratulations on joining our exclusive MLM program! You're now part of a community 
              dedicated to financial success and personal growth.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Your Team Information:</h3>
              <p><strong>Team Code:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${data.teamCode}</code></p>
              <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Active Member</span></p>
              <p><strong>Join Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                🚀 Access Your Dashboard
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                💡 <strong>Next Steps:</strong> Complete your profile, start training, and begin building your team!
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you have any questions, please don't hesitate to contact our support team.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 MLM Team. All rights reserved.</p>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Welcome email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    throw error
  }
}

// Credit Repair Email Functions
export async function sendCreditRepairEmail(data: CreditRepairEmailData): Promise<any> {
  try {
    console.log('📧 Sending Credit Repair Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Type: ${data.type}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const template = data.type === 'welcome' ? EMAIL_TEMPLATES.CREDIT_REPAIR_WELCOME :
                    data.type === 'update' ? EMAIL_TEMPLATES.CREDIT_REPAIR_UPDATE :
                    EMAIL_TEMPLATES.CREDIT_REPAIR_COMPLETION
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: template.subject(data.name),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">${data.type === 'welcome' ? '🎉' : data.type === 'update' ? '📊' : '✅'} Credit Repair ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              ${data.type === 'welcome' ? 'Welcome to our credit repair services! We\'re here to help you improve your credit score.' :
                data.type === 'update' ? 'Here\'s an update on your credit repair progress.' :
                'Congratulations! Your credit repair process has been completed successfully.'}
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Details:</h3>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(data.data, null, 2)}</pre>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Credit repair email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send credit repair email:', error)
    throw error
  }
}

// New function for sending credit repair template emails
export async function sendCreditRepairTemplateEmail(data: {
  to: string
  subject: string
  htmlContent: string
  textContent: string
}): Promise<any> {
  try {
    console.log('📧 Sending Credit Repair Template Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Subject: ${data.subject}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: data.subject,
      html: data.htmlContent,
      text: data.textContent
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Credit repair template email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send credit repair template email:', error)
    throw error
  }
}

// Export all other functions with mock implementations for client-side compatibility
export const sendTeamUpdateEmail = async (data: any) => {
  console.log('📧 Mock: Team update email (server-only)')
  return { messageId: 'mock-team-update' }
}

export const sendAdminEmail = async (data: any) => {
  console.log('📧 Mock: Admin email (server-only)')
  return { messageId: 'mock-admin' }
}

export const sendTeamJoinEmail = async (data: any) => {
  console.log('📧 Mock: Team join email (server-only)')
  return { messageId: 'mock-team-join' }
}

export const sendTeamCreationEmail = async (data: any) => {
  console.log('📧 Mock: Team creation email (server-only)')
  return { messageId: 'mock-team-creation' }
}

export const sendCommissionEarnedEmail = async (data: any) => {
  console.log('📧 Mock: Commission earned email (server-only)')
  return { messageId: 'mock-commission' }
}

export const sendRankAdvancementEmail = async (data: any) => {
  console.log('📧 Mock: Rank advancement email (server-only)')
  return { messageId: 'mock-rank' }
}

export const sendNewTeamMemberEmail = async (data: any) => {
  console.log('📧 Mock: New team member email (server-only)')
  return { messageId: 'mock-new-member' }
}

export const sendPayoutProcessedEmail = async (data: any) => {
  console.log('📧 Mock: Payout processed email (server-only)')
  return { messageId: 'mock-payout' }
}

export const sendTrainingCompletionEmail = async (data: any) => {
  console.log('📧 Mock: Training completion email (server-only)')
  return { messageId: 'mock-training' }
}

export const sendTaskCompletionEmail = async (data: any) => {
  console.log('📧 Mock: Task completion email (server-only)')
  return { messageId: 'mock-task' }
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
}
