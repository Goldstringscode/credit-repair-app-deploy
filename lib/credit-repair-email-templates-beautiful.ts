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
  // WELCOME EMAILS
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
                Hello \{\{userName\}\}! 👋
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
                <a href="\{\{dashboardUrl\}\}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
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
                This email was sent to \{\{userEmail\}\}. If you have any questions, contact us at 
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

Hello \{\{userName\}\},

Congratulations on taking the first step towards better credit! We're thrilled to have you join the CreditAI Pro family.

What happens next?
- Complete your credit profile analysis
- Upload your credit reports for AI-powered review
- Generate personalized dispute letters
- Track your credit improvement progress

Your personalized dashboard is ready with everything you need to start improving your credit score. Our AI-powered system will analyze your credit reports and create customized dispute letters to help you challenge inaccurate information.

Access Your Dashboard: \{\{dashboardUrl\}\}

Need Help Getting Started?
Our support team is here to help you every step of the way. Don't hesitate to reach out if you have any questions.

Best regards,
The CreditAI Pro Team

---
This email was sent to \{\{userEmail\}\}. If you have any questions, contact us at support@creditai.com
© 2024 CreditAI Pro. All rights reserved.`,
    variables: ['userName', 'userEmail', 'dashboardUrl'],
    tags: ['welcome', 'onboarding', 'new-user'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  },

  // ONBOARDING EMAILS
  {
    id: 'onboarding-step-1',
    name: 'Onboarding Step 1 - Profile Setup',
    subject: 'Let\'s Set Up Your Credit Profile - Step 1 of 5',
    category: 'onboarding',
    description: 'First step in the onboarding process - profile setup',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Credit Profile</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎯 Let's Get Started!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                Your personalized credit repair journey begins here
              </p>
            </td>
          </tr>
          
          <!-- Progress Bar -->
          <tr>
            <td style="padding: 20px 30px 0 30px;">
              <div style="background-color: #e9ecef; height: 8px; border-radius: 4px; margin-bottom: 10px;">
                <div style="background: linear-gradient(90deg, #3498db 0%, #2980b9 100%); height: 8px; border-radius: 4px; width: 20%;"></div>
              </div>
              <p style="text-align: center; margin: 0; color: #6c757d; font-size: 14px; font-weight: 600;">
                Step 1 of 5 - Profile Setup
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">
                Hello \{\{userName\}\}! 👋
              </h2>
              
              <p style="margin: 0 0 25px 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Great to have you on board! To provide you with the most accurate credit repair assistance, we need to set up your profile.
              </p>
              
              <!-- Step Card -->
              <div style="background: #ffffff; padding: 25px; margin: 20px 0; border-radius: 10px; border-left: 5px solid #3498db; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">
                  📋 Complete Your Profile
                </h3>
                <p style="margin: 0 0 15px 0; color: #5a6c7d; font-size: 16px;">
                  Tell us about yourself so we can personalize your experience:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #5a6c7d; font-size: 16px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Personal information</li>
                  <li style="margin-bottom: 8px;">Current credit situation</li>
                  <li style="margin-bottom: 8px;">Credit repair goals</li>
                  <li style="margin-bottom: 8px;">Contact preferences</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="\{\{profileSetupUrl\}\}" style="display: inline-block; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);">
                  🚀 Complete Profile Setup
                </a>
              </div>
              
              <!-- Info Box -->
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px; font-weight: 600;">
                  💡 Why is this important?
                </h3>
                <p style="margin: 0; color: #5a6c7d; font-size: 14px; line-height: 1.5;">
                  Your profile helps our AI system understand your specific situation and create the most effective dispute letters and strategies for your credit repair journey.
                </p>
              </div>
              
              <p style="margin: 25px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Questions? Reply to this email or contact our support team.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #2c3e50;">The CreditAI Pro Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
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

Hello \{\{userName\}\},

Great to have you on board! To provide you with the most accurate credit repair assistance, we need to set up your profile.

Step 1 of 5 - Profile Setup

Complete Your Profile
Tell us about yourself so we can personalize your experience:
- Personal information
- Current credit situation
- Credit repair goals
- Contact preferences

Complete Profile Setup: \{\{profileSetupUrl\}\}

Why is this important?
Your profile helps our AI system understand your specific situation and create the most effective dispute letters and strategies for your credit repair journey.

Questions? Reply to this email or contact our support team.

Best regards,
The CreditAI Pro Team`,
    variables: ['userName', 'profileSetupUrl'],
    tags: ['onboarding', 'profile', 'setup'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  },

  // DISPUTE EMAILS
  {
    id: 'dispute-letter-ready',
    name: 'Dispute Letter Ready',
    subject: 'Your Dispute Letter is Ready! 📝',
    category: 'dispute',
    description: 'Notification when dispute letter is generated and ready for review',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dispute Letter Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                📝 Your Dispute Letter is Ready!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.9;">
                AI-powered and personalized for your situation
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">
                Hello \{\{userName\}\}! 🎉
              </h2>
              
              <p style="margin: 0 0 25px 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Great news! Your personalized dispute letter has been generated and is ready for your review. Our AI analyzed your credit report and created a customized letter to challenge the inaccurate information.
              </p>
              
              <!-- Success Box -->
              <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 25px; border-radius: 10px; border-left: 5px solid #28a745; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #155724; font-size: 20px; font-weight: 600;">
                  ✅ Letter Details
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #155724; font-size: 16px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;"><strong>Account:</strong> \{\{accountName\}\}</li>
                  <li style="margin-bottom: 8px;"><strong>Issue Type:</strong> \{\{issueType\}\}</li>
                  <li style="margin-bottom: 8px;"><strong>Generated:</strong> \{\{generatedDate\}\}</li>
                  <li style="margin-bottom: 8px;"><strong>Status:</strong> Ready for Review</li>
                </ul>
              </div>
              
              <!-- CTA Buttons -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="\{\{letterUrl\}\}" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4); margin: 0 10px 10px 0;">
                  📄 Review Letter
                </a>
                <a href="\{\{dashboardUrl\}\}" style="display: inline-block; background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(108, 117, 125, 0.4); margin: 0 0 10px 10px;">
                  🏠 Go to Dashboard
                </a>
              </div>
              
              <!-- Next Steps -->
              <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">
                  🚀 Next Steps
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #5a6c7d; font-size: 16px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Review the generated dispute letter</li>
                  <li style="margin-bottom: 8px;">Make any necessary edits or additions</li>
                  <li style="margin-bottom: 8px;">Print and sign the letter</li>
                  <li style="margin-bottom: 8px;">Send via certified mail with return receipt</li>
                  <li style="margin-bottom: 8px;">Track the dispute status in your dashboard</li>
                </ol>
              </div>
              
              <p style="margin: 25px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Need help with the next steps? Our support team is here to assist you.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #2c3e50;">The CreditAI Pro Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
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
    textContent: `Your Dispute Letter is Ready!

Hello \{\{userName\}\},

Great news! Your personalized dispute letter has been generated and is ready for your review. Our AI analyzed your credit report and created a customized letter to challenge the inaccurate information.

Letter Details:
- Account: \{\{accountName\}\}
- Issue Type: \{\{issueType\}\}
- Generated: \{\{generatedDate\}\}
- Status: Ready for Review

Review Letter: \{\{letterUrl\}\}
Go to Dashboard: \{\{dashboardUrl\}\}

Next Steps:
1. Review the generated dispute letter
2. Make any necessary edits or additions
3. Print and sign the letter
4. Send via certified mail with return receipt
5. Track the dispute status in your dashboard

Need help with the next steps? Our support team is here to assist you.

Best regards,
The CreditAI Pro Team`,
    variables: ['userName', 'accountName', 'issueType', 'generatedDate', 'letterUrl', 'dashboardUrl'],
    tags: ['dispute', 'letter', 'ready'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  },

  // SUCCESS EMAILS
  {
    id: 'credit-score-improvement',
    name: 'Credit Score Improvement',
    subject: '🎉 Congratulations! Your Credit Score Improved!',
    category: 'success',
    description: 'Celebration email when credit score improves',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Credit Score Improvement</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                🎉 Congratulations!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.9;">
                Your credit score has improved!
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">
                Hello \{\{userName\}\}! 🎊
              </h2>
              
              <p style="margin: 0 0 25px 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                We have fantastic news! Your credit score has improved, and all your hard work is paying off. This is a significant milestone in your credit repair journey!
              </p>
              
              <!-- Score Improvement Box -->
              <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 30px; border-radius: 15px; text-align: center; margin: 25px 0; border: 2px solid #28a745;">
                <h3 style="margin: 0 0 15px 0; color: #155724; font-size: 24px; font-weight: 700;">
                  📈 Score Improvement
                </h3>
                <div style="display: flex; justify-content: center; align-items: center; margin: 20px 0;">
                  <div style="background: #ffffff; padding: 20px; border-radius: 10px; margin: 0 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; color: #6c757d; font-size: 14px; font-weight: 600;">Previous Score</p>
                    <p style="margin: 5px 0 0 0; color: #2c3e50; font-size: 28px; font-weight: 700;">\{\{previousScore\}\}</p>
                  </div>
                  <div style="color: #28a745; font-size: 24px; font-weight: bold;">→</div>
                  <div style="background: #ffffff; padding: 20px; border-radius: 10px; margin: 0 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; color: #6c757d; font-size: 14px; font-weight: 600;">New Score</p>
                    <p style="margin: 5px 0 0 0; color: #28a745; font-size: 28px; font-weight: 700;">\{\{newScore\}\}</p>
                  </div>
                </div>
                <p style="margin: 0; color: #155724; font-size: 18px; font-weight: 600;">
                  +\{\{scoreIncrease\}\} points improvement! 🚀
                </p>
              </div>
              
              <!-- Achievement Box -->
              <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">
                  🏆 What This Means
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #5a6c7d; font-size: 16px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Better loan and credit card interest rates</li>
                  <li style="margin-bottom: 8px;">Increased approval chances for new credit</li>
                  <li style="margin-bottom: 8px;">Lower insurance premiums</li>
                  <li style="margin-bottom: 8px;">More financial opportunities</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="\{\{dashboardUrl\}\}" style="display: inline-block; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);">
                  📊 View Full Report
                </a>
              </div>
              
              <p style="margin: 25px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Keep up the great work! Continue monitoring your credit and following our recommendations for even better results.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #2c3e50;">The CreditAI Pro Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
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
    textContent: `Congratulations! Your Credit Score Improved!

Hello \{\{userName\}\},

We have fantastic news! Your credit score has improved, and all your hard work is paying off. This is a significant milestone in your credit repair journey!

Score Improvement:
Previous Score: \{\{previousScore\}\}
New Score: \{\{newScore\}\}
Improvement: +\{\{scoreIncrease\}\} points!

What This Means:
- Better loan and credit card interest rates
- Increased approval chances for new credit
- Lower insurance premiums
- More financial opportunities

View Full Report: \{\{dashboardUrl\}\}

Keep up the great work! Continue monitoring your credit and following our recommendations for even better results.

Best regards,
The CreditAI Pro Team`,
    variables: ['userName', 'previousScore', 'newScore', 'scoreIncrease', 'dashboardUrl'],
    tags: ['success', 'credit-score', 'improvement'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  },

  // BILLING EMAILS
  {
    id: 'payment-success',
    name: 'Payment Success',
    subject: 'Payment Confirmed - Thank You! 💳',
    category: 'billing',
    description: 'Confirmation email for successful payment',
    htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                💳 Payment Confirmed!
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.9;">
                Thank you for your payment
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 24px; font-weight: 600;">
                Hello \{\{userName\}\}! ✅
              </h2>
              
              <p style="margin: 0 0 25px 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Your payment has been successfully processed. Thank you for continuing your credit repair journey with CreditAI Pro!
              </p>
              
              <!-- Receipt Box -->
              <div style="background: #ffffff; padding: 30px; border-radius: 10px; border: 2px solid #e9ecef; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 20px; font-weight: 600; text-align: center;">
                  📄 Payment Receipt
                </h3>
                <table width="100%" cellpadding="10" cellspacing="0">
                  <tr>
                    <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0; color: #6c757d; font-weight: 600;">Transaction ID:</td>
                    <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0; color: #2c3e50; font-family: monospace;">\{\{transactionId\}\}</td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0; color: #6c757d; font-weight: 600;">Amount:</td>
                    <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0; color: #27ae60; font-size: 18px; font-weight: 700;">$\{\{amount\}\}</td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0; color: #6c757d; font-weight: 600;">Plan:</td>
                    <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0; color: #2c3e50;">\{\{planName\}\}</td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0; color: #6c757d; font-weight: 600;">Billing Period:</td>
                    <td style="border-bottom: 1px solid #e9ecef; padding: 10px 0; color: #2c3e50;">\{\{billingPeriod\}\}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6c757d; font-weight: 600;">Payment Date:</td>
                    <td style="padding: 10px 0; color: #2c3e50;">\{\{paymentDate\}\}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Next Billing -->
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px; font-weight: 600;">
                  📅 Next Billing Date
                </h3>
                <p style="margin: 0; color: #5a6c7d; font-size: 16px;">
                  Your next billing date is <strong>\{\{nextBillingDate\}\}</strong>
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="\{\{dashboardUrl\}\}" style="display: inline-block; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);">
                  🏠 Go to Dashboard
                </a>
              </div>
              
              <p style="margin: 25px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                You can view your subscription details and past invoices in your dashboard.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                If you have any questions, please don't hesitate to contact our support team.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #5a6c7d; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #2c3e50;">The CreditAI Pro Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
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
    textContent: `Payment Confirmation

Hello \{\{userName\}\},

Your payment has been successfully processed. Thank you for continuing your credit repair journey with CreditAI Pro!

Payment Receipt:
Transaction ID: \{\{transactionId\}\}
Amount: $\{\{amount\}\}
Plan: \{\{planName\}\}
Billing Period: \{\{billingPeriod\}\}
Payment Date: \{\{paymentDate\}\}

Next Billing Date: \{\{nextBillingDate\}\}

You can view your subscription details and past invoices in your dashboard: \{\{dashboardUrl\}\}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The CreditAI Pro Team`,
    variables: ['userName', 'transactionId', 'amount', 'planName', 'billingPeriod', 'paymentDate', 'nextBillingDate', 'dashboardUrl'],
    tags: ['billing', 'payment', 'confirmation'],
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
