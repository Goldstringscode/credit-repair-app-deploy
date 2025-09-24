// Server-side email templates

export interface CreditRepairEmailTemplate {
  id: string
  name: string
  subject: string
  category: 'welcome' | 'onboarding' | 'dispute' | 'follow-up' | 'success' | 'reminder' | 'billing' | 'support' | 'marketing' | 'compliance'
  description: string
  htmlContent: string
  textContent: string
  variables: string[]
  tags: string[]
  isActive: boolean
  createdAt: string
  lastUsed?: string
  usageCount: number
}

export const creditRepairEmailTemplates: CreditRepairEmailTemplate[] = [
  {
    id: 'welcome-new-user',
    name: 'Welcome New User',
    subject: 'Welcome to CreditAI Pro - Your Credit Repair Journey Starts Now!',
    category: 'welcome',
    description: 'Welcome email for new users signing up for credit repair services',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CreditAI Pro</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🎉 Welcome to CreditAI Pro!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.9;">
                Your personalized credit repair solution is ready
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">
                Hello {{userName}}! 👋
              </h2>
              
              <p style="margin: 0 0 25px 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Congratulations on taking the first step towards better credit! We're thrilled to have you join the CreditAI Pro family.
              </p>
              
              <!-- Highlight Box -->
              <div style="background: linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%); padding: 25px; border-radius: 10px; border-left: 5px solid #667eea; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">
                  🚀 What happens next?
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #5a6c7d; font-size: 16px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">📊 Complete your credit profile analysis</li>
                  <li style="margin-bottom: 8px;">📋 Upload your credit reports for AI-powered review</li>
                  <li style="margin-bottom: 8px;">📝 Generate personalized dispute letters</li>
                  <li style="margin-bottom: 8px;">📈 Track your credit improvement progress</li>
                </ul>
              </div>
              
              <p style="margin: 25px 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Your personalized dashboard is ready with everything you need to start improving your credit score. Our AI-powered system will analyze your credit reports and create customized dispute letters to help you challenge inaccurate information.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                  🎯 Access Your Dashboard
                </a>
              </div>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px; font-weight: 600;">
                  💡 Need Help Getting Started?
                </h3>
                <p style="margin: 0; color: #5a6c7d; font-size: 14px; line-height: 1.5;">
                  Our support team is here to help you every step of the way. Don't hesitate to reach out if you have any questions.
                </p>
              </div>
              
              <p style="margin: 25px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #2c3e50;">The CreditAI Pro Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 12px; line-height: 1.4;">
                This email was sent to {{userEmail}}. If you have any questions, contact us at 
                <a href="mailto:support@creditai.com" style="color: #667eea; text-decoration: none;">support@creditai.com</a>
              </p>
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                © 2024 CreditAI Pro. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    textContent: `Welcome to CreditAI Pro!

Hello {{userName}},

Congratulations on taking the first step towards better credit! We're thrilled to have you join the CreditAI Pro family.

What happens next?
- Complete your credit profile analysis
- Upload your credit reports for AI-powered review
- Generate personalized dispute letters
- Track your credit improvement progress

Your personalized dashboard is ready with everything you need to start improving your credit score. Our AI-powered system will analyze your credit reports and create customized dispute letters to help you challenge inaccurate information.

Access Your Dashboard: {{dashboardUrl}}

Need Help Getting Started?
Our support team is here to help you every step of the way. Don't hesitate to reach out if you have any questions.

Best regards,
The CreditAI Pro Team

---
This email was sent to {{userEmail}}. If you have any questions, contact us at support@creditai.com
© 2024 CreditAI Pro. All rights reserved.`,
    variables: ['userName', 'userEmail', 'dashboardUrl'],
    tags: ['welcome', 'onboarding', 'new-user'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  }
]

// Export individual template functions for easy access
export const getCreditRepairTemplate = (templateId: string) => {
  return creditRepairEmailTemplates.find(template => template.id === templateId)
}

export const getTemplatesByCategory = (category: string) => {
  return creditRepairEmailTemplates.filter(template => template.category === category)
}

export const getAllTemplates = () => {
  return creditRepairEmailTemplates
}
