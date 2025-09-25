// Comprehensive email service for Credit Repair App
// Dynamic import to avoid browser compatibility issues
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

export async function sendTeamUpdateEmail(data: {
  to: string
  name: string
  teamCode: string
  updateType: 'rank_upgrade' | 'new_member' | 'commission_earned'
  details: any
}): Promise<void> {
  try {
    console.log('📧 Sending Team Update Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Team Code: ${data.teamCode}`)
    console.log(`   Update Type: ${data.updateType}`)
    console.log(`   Details:`, data.details)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: `Team Update: ${data.updateType.replace('_', ' ').toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Team Update!</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We have an exciting update about your MLM team!
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Update Details:</h3>
              <p><strong>Type:</strong> ${data.updateType.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Team Code:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${data.teamCode}</code></p>
              <p><strong>Details:</strong> ${JSON.stringify(data.details, null, 2)}</p>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Team update email sent successfully:', info.messageId)
    
  } catch (error) {
    console.error('Failed to send team update email:', error)
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

// Admin Email Functions
export async function sendAdminEmail(data: AdminEmailData): Promise<any> {
  try {
    console.log('📧 Sending Admin Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Subject: ${data.subject}`)
    console.log(`   Type: ${data.type}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name} Admin" <${config.from.email}>`,
      to: data.to,
      subject: data.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF5722 0%, #D32F2F 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">${data.type === 'notification' ? '🔔' : '⚠️'} Admin ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">${data.subject}</h3>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(data.data, null, 2)}</pre>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Admin email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send admin email:', error)
    throw error
  }
}

// ===========================================
// MLM-SPECIFIC EMAIL FUNCTIONS
// ===========================================

// Team Join Email
export async function sendTeamJoinEmail(data: TeamJoinEmailData): Promise<any> {
  try {
    console.log('📧 Sending Team Join Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Team Code: ${data.teamCode}`)
    console.log(`   Sponsor: ${data.sponsorName}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: `🎉 Welcome to ${data.sponsorName}'s Team!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to the Team!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You've successfully joined ${data.sponsorName}'s team</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Great news! You've successfully joined <strong>${data.sponsorName}'s</strong> team. 
              You're now part of a supportive community that will help you achieve your goals.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Your Team Details:</h3>
              <p><strong>Team Code:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${data.teamCode}</code></p>
              <p><strong>Sponsor:</strong> ${data.sponsorName}</p>
              <p><strong>Join Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardLink}" 
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
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
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Team join email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send team join email:', error)
    throw error
  }
}

// Team Creation Email
export async function sendTeamCreationEmail(data: TeamCreationEmailData): Promise<any> {
  try {
    console.log('📧 Sending Team Creation Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Team Code: ${data.teamCode}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: `🎉 Congratulations! You're Now a Team Leader!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You're now a Team Leader</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Congratulations! You've created your own team and are now a Team Leader. 
              This is the beginning of your leadership journey in our MLM program.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Your Team Information:</h3>
              <p><strong>Team Code:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${data.teamCode}</code></p>
              <p><strong>Role:</strong> <span style="color: #ff6b6b; font-weight: bold;">Team Leader</span></p>
              <p><strong>Creation Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                💡 <strong>As a Team Leader:</strong> You can now invite members, earn leadership bonuses, and build your network!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardLink}" 
                 style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                🚀 Manage Your Team
              </a>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Team creation email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send team creation email:', error)
    throw error
  }
}

// Commission Earned Email
export async function sendCommissionEarnedEmail(data: CommissionEarnedEmailData): Promise<any> {
  try {
    console.log('📧 Sending Commission Earned Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Amount: $${data.amount}`)
    console.log(`   Type: ${data.type}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: `💰 You Earned $${data.amount.toFixed(2)} Commission!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">💰 Commission Earned!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You've earned $${data.amount.toFixed(2)}</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Congratulations! You've earned a commission from your MLM activities. 
              Keep up the great work!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Commission Details:</h3>
              <p><strong>Amount Earned:</strong> <span style="color: #f39c12; font-weight: bold; font-size: 18px;">$${data.amount.toFixed(2)}</span></p>
              <p><strong>Type:</strong> ${data.type.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Level:</strong> ${data.level}</p>
              <p><strong>Total Earnings:</strong> $${data.totalEarnings.toFixed(2)}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardLink}" 
                 style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                💰 View Earnings
              </a>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Commission earned email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send commission earned email:', error)
    throw error
  }
}

// Rank Advancement Email
export async function sendRankAdvancementEmail(data: RankAdvancementEmailData): Promise<any> {
  try {
    console.log('📧 Sending Rank Advancement Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Old Rank: ${data.oldRank}`)
    console.log(`   New Rank: ${data.newRank}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: `🎖️ Congratulations! You've Advanced to ${data.newRank}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎖️ Rank Advancement!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You've reached ${data.newRank} level</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Outstanding achievement! You've successfully advanced from <strong>${data.oldRank}</strong> 
              to <strong>${data.newRank}</strong>. This is a significant milestone in your MLM journey!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">New Rank Benefits:</h3>
              <ul style="color: #666; line-height: 1.8;">
                ${data.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
              </ul>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                🎉 <strong>Congratulations!</strong> You now have access to higher commission rates and exclusive benefits!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardLink}" 
                 style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                🎖️ View Your Progress
              </a>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Rank advancement email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send rank advancement email:', error)
    throw error
  }
}

// New Team Member Email (to sponsor)
export async function sendNewTeamMemberEmail(data: NewTeamMemberEmailData): Promise<any> {
  try {
    console.log('📧 Sending New Team Member Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Sponsor: ${data.sponsorName}`)
    console.log(`   New Member: ${data.newMemberName}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: `🎉 New Team Member: ${data.newMemberName} joined your team!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎉 New Team Member!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${data.newMemberName} joined your team</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.sponsorName},</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Great news! <strong>${data.newMemberName}</strong> has successfully joined your team. 
              This is an exciting opportunity to help them succeed and grow your network!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">New Team Member Details:</h3>
              <p><strong>Name:</strong> ${data.newMemberName}</p>
              <p><strong>Email:</strong> ${data.newMemberEmail}</p>
              <p><strong>Team Code:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${data.teamCode}</code></p>
              <p><strong>Join Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;">
                💡 <strong>Next Steps:</strong> Reach out to welcome them, share resources, and help them get started!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardLink}" 
                 style="background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                👥 Manage Your Team
              </a>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ New team member email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send new team member email:', error)
    throw error
  }
}

// Payout Processed Email
export async function sendPayoutProcessedEmail(data: PayoutProcessedEmailData): Promise<any> {
  try {
    console.log('📧 Sending Payout Processed Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Amount: $${data.amount}`)
    console.log(`   Method: ${data.method}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: `💰 Payout Processed: $${data.amount.toFixed(2)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">💰 Payout Processed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your earnings have been sent</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Great news! Your payout has been successfully processed and should appear in your account soon.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Payout Details:</h3>
              <p><strong>Amount:</strong> <span style="color: #28a745; font-weight: bold; font-size: 18px;">$${data.amount.toFixed(2)}</span></p>
              <p><strong>Method:</strong> ${data.method}</p>
              <p><strong>Transaction ID:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px;">${data.transactionId}</code></p>
              <p><strong>Processed Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardLink}" 
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                💰 View Earnings
              </a>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Payout processed email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send payout processed email:', error)
    throw error
  }
}

// Training Completion Email
export async function sendTrainingCompletionEmail(data: TrainingCompletionEmailData): Promise<any> {
  try {
    console.log('📧 Sending Training Completion Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Course: ${data.courseName}`)
    console.log(`   Points: ${data.pointsEarned}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: `🎓 Training Complete: ${data.courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎓 Training Complete!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You've completed ${data.courseName}</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Congratulations! You've successfully completed the <strong>${data.courseName}</strong> training course. 
              Your dedication to learning is commendable!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Course Completion Details:</h3>
              <p><strong>Course:</strong> ${data.courseName}</p>
              <p><strong>Points Earned:</strong> <span style="color: #6f42c1; font-weight: bold;">${data.pointsEarned}</span></p>
              <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Next Course:</strong> ${data.nextCourse}</p>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;">
                💡 <strong>Keep Learning:</strong> Continue with the next course to unlock more opportunities!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardLink}" 
                 style="background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                🎓 Continue Training
              </a>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Training completion email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send training completion email:', error)
    throw error
  }
}

// Task Completion Email
export async function sendTaskCompletionEmail(data: TaskCompletionEmailData): Promise<any> {
  try {
    console.log('📧 Sending Task Completion Email:')
    console.log(`   To: ${data.to}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Task: ${data.taskName}`)
    console.log(`   Points: ${data.pointsEarned}`)
    
    const transporter = await createTransporter()
    const config = getEmailConfig()
    
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to: data.to,
      subject: `✅ Task Complete: ${data.taskName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">✅ Task Complete!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You've completed ${data.taskName}</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello ${data.name},</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Excellent work! You've successfully completed the <strong>${data.taskName}</strong> task. 
              Your progress is impressive!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #333; margin-top: 0;">Task Completion Details:</h3>
              <p><strong>Task:</strong> ${data.taskName}</p>
              <p><strong>Points Earned:</strong> <span style="color: #fd7e14; font-weight: bold;">${data.pointsEarned}</span></p>
              <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Next Task:</strong> ${data.nextTask}</p>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;">
                💡 <strong>Keep Going:</strong> Complete the next task to continue your progress!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardLink}" 
                 style="background: linear-gradient(135deg, #fd7e14 0%, #e8590c 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                ✅ View Progress
              </a>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Task completion email sent successfully:', info.messageId)
    
    return info
  } catch (error) {
    console.error('Failed to send task completion email:', error)
    throw error
  }
}