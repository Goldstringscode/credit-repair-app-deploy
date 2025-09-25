"use client"

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
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to CreditAI Pro</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }.button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }.highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }.footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }</style></head><body><div class="header"><h1>Welcome to CreditAI Pro!</h1><p>Your personalized credit repair solution is ready</p></div><div class="content"><h2>Hello {{userName}},</h2><p>Congratulations on taking the first step towards better credit! We\'re thrilled to have you join the CreditAI Pro family.</p><div class="highlight"><h3>What happens next?</h3><ul><li>📊 Complete your credit profile analysis</li><li>📋 Upload your credit reports for AI-powered review</li><li>📝 Generate personalized dispute letters</li><li>📈 Track your credit improvement progress</li></ul></div><p>Your personalized dashboard is ready with everything you need to start improving your credit score. Our AI-powered system will analyze your credit reports and create customized dispute letters to help you challenge inaccurate information.</p><div style="text-align: center;"><a href="{{dashboardUrl}}" class="button">Access Your Dashboard</a></div><h3>Need Help Getting Started?</h3><p>Our support team is here to help you every step of the way. Don\'t hesitate to reach out if you have any questions.</p><p>Best regards,<br>The CreditAI Pro Team</p></div><div class="footer"><p>This email was sent to {{userEmail}}. If you have any questions, contact us at support@creditai.com</p><p>© 2024 CreditAI Pro. All rights reserved.</p></div></body></html>',
    textContent: 'Welcome to CreditAI Pro!\n\nHello {{userName}},\n\nCongratulations on taking the first step towards better credit! We\'re thrilled to have you join the CreditAI Pro family.\n\nWhat happens next?\n- Complete your credit profile analysis\n- Upload your credit reports for AI-powered review\n- Generate personalized dispute letters\n- Track your credit improvement progress\n\nYour personalized dashboard is ready with everything you need to start improving your credit score. Our AI-powered system will analyze your credit reports and create customized dispute letters to help you challenge inaccurate information.\n\nAccess Your Dashboard: {{dashboardUrl}}\n\nNeed Help Getting Started?\nOur support team is here to help you every step of the way. Don\'t hesitate to reach out if you have any questions.\n\nBest regards,\nThe CreditAI Pro Team\n\n---\nThis email was sent to {{userEmail}}. If you have any questions, contact us at support@creditai.com\n© 2024 CreditAI Pro. All rights reserved.',
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
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Complete Your Credit Profile</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }.content { background: #ecf0f1; padding: 25px; border-radius: 0 0 8px 8px; }.step { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #3498db; }.progress { background: #bdc3c7; height: 8px; border-radius: 4px; margin: 20px 0; }.progress-bar { background: #3498db; height: 8px; border-radius: 4px; width: 20%; }.button { display: inline-block; background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }</style></head><body><div class="header"><h1>Welcome to CreditAI Pro!</h1><p>Let\'s get your credit repair journey started</p></div><div class="content"><div class="progress"><div class="progress-bar"></div></div><p style="text-align: center; margin: 0;">Step 1 of 5 - Profile Setup</p><h2>Hello {{userName}},</h2><p>Great to have you on board! To provide you with the most accurate credit repair assistance, we need to set up your profile.</p><div class="step"><h3>📋 Complete Your Profile</h3><p>Tell us about yourself so we can personalize your experience:</p><ul><li>Personal information</li><li>Current credit situation</li><li>Credit repair goals</li><li>Contact preferences</li></ul></div><div style="text-align: center;"><a href="{{profileSetupUrl}}" class="button">Complete Profile Setup</a></div><p><strong>Why is this important?</strong><br>Your profile helps our AI system understand your specific situation and create the most effective dispute letters and strategies for your credit repair journey.</p><p>Questions? Reply to this email or contact our support team.</p><p>Best regards,<br>The CreditAI Pro Team</p></div></body></html>',
    textContent: 'Welcome to CreditAI Pro!\n\nHello {{userName}},\n\nGreat to have you on board! To provide you with the most accurate credit repair assistance, we need to set up your profile.\n\nStep 1 of 5 - Profile Setup\n\nComplete Your Profile\nTell us about yourself so we can personalize your experience:\n- Personal information\n- Current credit situation\n- Credit repair goals\n- Contact preferences\n\nComplete Profile Setup: {{profileSetupUrl}}\n\nWhy is this important?\nYour profile helps our AI system understand your specific situation and create the most effective dispute letters and strategies for your credit repair journey.\n\nQuestions? Reply to this email or contact our support team.\n\nBest regards,\nThe CreditAI Pro Team',
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
    subject: 'Your Dispute Letter is Ready - {{disputeType}}',
    category: 'dispute',
    description: 'Notification when a dispute letter is generated and ready for review',
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dispute Letter Ready</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }.content { background: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; }.alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }.button { display: inline-block; background: #e74c3c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }.dispute-info { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #e74c3c; margin: 15px 0; }</style></head><body><div class="header"><h1>📝 Dispute Letter Ready!</h1><p>Your personalized dispute letter has been generated</p></div><div class="content"><h2>Hello {{userName}},</h2><p>Great news! Your AI-generated dispute letter for <strong>{{disputeType}}</strong> is ready for review.</p><div class="dispute-info"><h3>Dispute Details:</h3><ul><li><strong>Type:</strong> {{disputeType}}</li><li><strong>Credit Bureau:</strong> {{creditBureau}}</li><li><strong>Account:</strong> {{accountName}}</li><li><strong>Generated:</strong> {{generatedDate}}</li></ul></div><div class="alert"><strong>⚠️ Important:</strong> Please review your dispute letter carefully before sending. Make sure all information is accurate and complete.</div><div style="text-align: center;"><a href="{{disputeLetterUrl}}" class="button">Review Dispute Letter</a></div><h3>Next Steps:</h3><ol><li>Review the generated dispute letter</li><li>Make any necessary edits</li><li>Print and sign the letter</li><li>Send via certified mail with return receipt</li><li>Track the dispute in your dashboard</li></ol><p><strong>Pro Tip:</strong> Keep copies of all correspondence and tracking numbers for your records.</p><p>Need help? Our support team is here to assist you with any questions about your dispute letter.</p><p>Best regards,<br>The CreditAI Pro Team</p></div></body></html>',
    textContent: 'Dispute Letter Ready!\n\nHello {{userName}},\n\nGreat news! Your AI-generated dispute letter for {{disputeType}} is ready for review.\n\nDispute Details:\n- Type: {{disputeType}}\n- Credit Bureau: {{creditBureau}}\n- Account: {{accountName}}\n- Generated: {{generatedDate}}\n\nIMPORTANT: Please review your dispute letter carefully before sending. Make sure all information is accurate and complete.\n\nReview Dispute Letter: {{disputeLetterUrl}}\n\nNext Steps:\n1. Review the generated dispute letter\n2. Make any necessary edits\n3. Print and sign the letter\n4. Send via certified mail with return receipt\n5. Track the dispute in your dashboard\n\nPro Tip: Keep copies of all correspondence and tracking numbers for your records.\n\nNeed help? Our support team is here to assist you with any questions about your dispute letter.\n\nBest regards,\nThe CreditAI Pro Team',
    variables: ['userName', 'disputeType', 'creditBureau', 'accountName', 'generatedDate', 'disputeLetterUrl'],
    tags: ['dispute', 'letter', 'ready', 'notification'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  },

  // SUCCESS EMAILS
  {
    id: 'credit-score-improvement',
    name: 'Credit Score Improvement',
    subject: '🎉 Congratulations! Your Credit Score Improved by {{scoreIncrease}} Points',
    category: 'success',
    description: 'Celebration email when credit score improves',
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Credit Score Improvement</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }.content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }.celebration { background: #d5f4e6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }.score-display { font-size: 48px; font-weight: bold; color: #27ae60; margin: 20px 0; }.improvement { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60; margin: 20px 0; }.button { display: inline-block; background: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }</style></head><body><div class="header"><h1>🎉 Congratulations!</h1><p>Your credit repair efforts are paying off!</p></div><div class="content"><div class="celebration"><h2>Hello {{userName}},</h2><p>We have amazing news to share with you!</p><div class="score-display">+{{scoreIncrease}}</div><p>Your credit score has improved by <strong>{{scoreIncrease}} points</strong>!</p></div><div class="improvement"><h3>📈 Your Progress:</h3><ul><li><strong>Previous Score:</strong> {{previousScore}}</li><li><strong>Current Score:</strong> {{currentScore}}</li><li><strong>Improvement:</strong> +{{scoreIncrease}} points</li><li><strong>Date Updated:</strong> {{updateDate}}</li></ul></div><p>This is fantastic progress! Your dedication to improving your credit is clearly working. Here\'s what likely contributed to this improvement:</p><ul><li>✅ Successfully disputed inaccurate information</li><li>✅ Maintained on-time payments</li><li>✅ Reduced credit utilization</li><li>✅ Improved credit mix</li></ul><div style="text-align: center;"><a href="{{dashboardUrl}}" class="button">View Your Progress</a></div><h3>Keep Up the Great Work!</h3><p>Continue following your personalized credit repair plan to see even more improvements. Remember, credit repair is a journey, and you\'re making excellent progress!</p><p>Need help with your next steps? Our team is here to support you on your credit repair journey.</p><p>Congratulations again,<br>The CreditAI Pro Team</p></div></body></html>',
    textContent: 'Congratulations!\n\nHello {{userName}},\n\nWe have amazing news to share with you!\n\nYour credit score has improved by {{scoreIncrease}} points!\n\nYour Progress:\n- Previous Score: {{previousScore}}\n- Current Score: {{currentScore}}\n- Improvement: +{{scoreIncrease}} points\n- Date Updated: {{updateDate}}\n\nThis is fantastic progress! Your dedication to improving your credit is clearly working. Here\'s what likely contributed to this improvement:\n\n- Successfully disputed inaccurate information\n- Maintained on-time payments\n- Reduced credit utilization\n- Improved credit mix\n\nView Your Progress: {{dashboardUrl}}\n\nKeep Up the Great Work!\nContinue following your personalized credit repair plan to see even more improvements. Remember, credit repair is a journey, and you\'re making excellent progress!\n\nNeed help with your next steps? Our team is here to support you on your credit repair journey.\n\nCongratulations again,\nThe CreditAI Pro Team',
    variables: ['userName', 'scoreIncrease', 'previousScore', 'currentScore', 'updateDate', 'dashboardUrl'],
    tags: ['success', 'celebration', 'credit-score', 'improvement'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  },

  // BILLING EMAILS
  {
    id: 'payment-success',
    name: 'Payment Success',
    subject: 'Payment Confirmed - Thank You for Your Subscription!',
    category: 'billing',
    description: 'Confirmation email when payment is successfully processed',
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment Confirmation</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }.content { background: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; }.receipt { background: white; padding: 20px; border-radius: 5px; border: 1px solid #ddd; margin: 15px 0; }.amount-value { font-size: 24px; font-weight: bold; color: #27ae60; }.button { display: inline-block; background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }</style></head><body><div class="header"><h1>✅ Payment Confirmed</h1><p>Thank you for your subscription!</p></div><div class="content"><h2>Hello {{userName}},</h2><p>Your payment has been successfully processed. Thank you for continuing your credit repair journey with CreditAI Pro!</p><div class="receipt"><h3>Payment Receipt</h3><p><strong>Transaction ID:</strong> {{transactionId}}</p><p><strong>Amount:</strong> <span class="amount-value">${{amount}}</span></p><p><strong>Plan:</strong> {{planName}}</p><p><strong>Billing Period:</strong> {{billingPeriod}}</p><p><strong>Payment Date:</strong> {{paymentDate}}</p><p><strong>Next Billing Date:</strong> {{nextBillingDate}}</p></div><p>Your subscription is now active and you have full access to all CreditAI Pro features:</p><ul><li>✅ Unlimited dispute letter generation</li><li>✅ AI-powered credit analysis</li><li>✅ Progress tracking and reporting</li><li>✅ Priority customer support</li></ul><div style="text-align: center;"><a href="{{dashboardUrl}}" class="button">Access Your Dashboard</a></div><p>Questions about your billing? Contact our support team or view your billing history in your dashboard.</p><p>Thank you for choosing CreditAI Pro!<br>The CreditAI Pro Team</p></div></body></html>',
    textContent: 'Payment Confirmed\n\nHello {{userName}},\n\nYour payment has been successfully processed. Thank you for continuing your credit repair journey with CreditAI Pro!\n\nPayment Receipt\n- Transaction ID: {{transactionId}}\n- Amount: ${{amount}}\n- Plan: {{planName}}\n- Billing Period: {{billingPeriod}}\n- Payment Date: {{paymentDate}}\n- Next Billing Date: {{nextBillingDate}}\n\nYour subscription is now active and you have full access to all CreditAI Pro features:\n- Unlimited dispute letter generation\n- AI-powered credit analysis\n- Progress tracking and reporting\n- Priority customer support\n\nAccess Your Dashboard: {{dashboardUrl}}\n\nQuestions about your billing? Contact our support team or view your billing history in your dashboard.\n\nThank you for choosing CreditAI Pro!\nThe CreditAI Pro Team',
    variables: ['userName', 'transactionId', 'amount', 'planName', 'billingPeriod', 'paymentDate', 'nextBillingDate', 'dashboardUrl'],
    tags: ['billing', 'payment', 'confirmation', 'receipt'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  }
]

// Additional templates would continue here...
export const additionalCreditRepairTemplates: CreditRepairEmailTemplate[] = [
  {
    id: 'follow-up-dispute',
    name: 'Follow-up Dispute',
    subject: 'Follow-up on Your Dispute - {{disputeType}}',
    category: 'follow-up',
    description: 'Follow-up email for dispute letters',
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Follow-up Dispute</title></head><body><h1>Follow-up on Your Dispute</h1><p>Hello {{userName}},</p><p>This is a follow-up on your {{disputeType}} dispute.</p></body></html>',
    textContent: 'Follow-up on Your Dispute\n\nHello {{userName}},\n\nThis is a follow-up on your {{disputeType}} dispute.',
    variables: ['userName', 'disputeType'],
    tags: ['follow-up', 'dispute'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  }
]

export const getTemplatesByCategory = (category: string) => {
  return creditRepairEmailTemplates.filter(template => template.category === category)
}

export const getTemplateById = (id: string) => {
  return creditRepairEmailTemplates.find(template => template.id === id)
}

export const getActiveTemplates = () => {
  return creditRepairEmailTemplates.filter(template => template.isActive)
}