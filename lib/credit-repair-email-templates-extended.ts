"use client"

import { CreditRepairEmailTemplate } from './credit-repair-email-templates'

export const additionalCreditRepairTemplates: CreditRepairEmailTemplate[] = [
  // FOLLOW-UP EMAILS
  {
    id: 'follow-up-dispute-status',
    name: 'Follow-up: Dispute Status Check',
    subject: 'Dispute Status Update - {{disputeType}} | {{creditBureau}}',
    category: 'follow-up',
    description: 'Follow-up email to check on dispute status',
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dispute Status Update</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: #f39c12; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }.content { background: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; }.status-box { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #f39c12; margin: 15px 0; }.button { display: inline-block; background: #f39c12; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }</style></head><body><div class="header"><h1>📋 Dispute Status Update</h1><p>Let\'s check on your dispute progress</p></div><div class="content"><h2>Hello {{userName}},</h2><p>It\'s been {{daysSinceSubmission}} days since you submitted your dispute for <strong>{{disputeType}}</strong> to {{creditBureau}}.</p><div class="status-box"><h3>Current Status: {{currentStatus}}</h3><p><strong>Submitted:</strong> {{submissionDate}}</p><p><strong>Expected Response:</strong> {{expectedResponseDate}}</p><p><strong>Tracking Number:</strong> {{trackingNumber}}</p></div><h3>What to Expect Next:</h3><ul><li>Credit bureaus have 30 days to investigate your dispute</li><li>You should receive a written response with their findings</li><li>If successful, the item will be removed or corrected</li><li>Updated credit reports will be sent to you</li></ul><div style="text-align: center;"><a href="{{disputeUrl}}" class="button">View Dispute Details</a></div><p><strong>Need Help?</strong><br>If you have questions about your dispute or need assistance, our support team is here to help.</p><p>Keep up the great work!<br>The CreditAI Pro Team</p></div></body></html>',
    textContent: 'Dispute Status Update\n\nHello {{userName}},\n\nIt\'s been {{daysSinceSubmission}} days since you submitted your dispute for {{disputeType}} to {{creditBureau}}.\n\nCurrent Status: {{currentStatus}}\n- Submitted: {{submissionDate}}\n- Expected Response: {{expectedResponseDate}}\n- Tracking Number: {{trackingNumber}}\n\nWhat to Expect Next:\n- Credit bureaus have 30 days to investigate your dispute\n- You should receive a written response with their findings\n- If successful, the item will be removed or corrected\n- Updated credit reports will be sent to you\n\nView Dispute Details: {{disputeUrl}}\n\nNeed Help?\nIf you have questions about your dispute or need assistance, our support team is here to help.\n\nKeep up the great work!\nThe CreditAI Pro Team',
    variables: ['userName', 'daysSinceSubmission', 'disputeType', 'creditBureau', 'currentStatus', 'submissionDate', 'expectedResponseDate', 'trackingNumber', 'disputeUrl'],
    tags: ['follow-up', 'dispute', 'status', 'update'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  },

  // REMINDER EMAILS
  {
    id: 'reminder-upload-reports',
    name: 'Reminder: Upload Credit Reports',
    subject: 'Don\'t Forget to Upload Your Credit Reports - {{daysRemaining}} Days Left',
    category: 'reminder',
    description: 'Reminder email to upload credit reports for analysis',
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Upload Reminder</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: #9b59b6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }.content { background: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; }.reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 15px 0; }.button { display: inline-block; background: #9b59b6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }</style></head><body><div class="header"><h1>⏰ Upload Reminder</h1><p>Complete your credit analysis setup</p></div><div class="content"><h2>Hello {{userName}},</h2><p>This is a friendly reminder that you have <strong>{{daysRemaining}} days</strong> left to upload your credit reports for AI-powered analysis.</p><div class="reminder-box"><h3>📋 What You Need to Do:</h3><ul><li>Download your credit reports from all three bureaus</li><li>Upload them to your CreditAI Pro dashboard</li><li>Let our AI analyze and identify dispute opportunities</li><li>Start generating personalized dispute letters</li></ul></div><div style="text-align: center;"><a href="{{uploadUrl}}" class="button">Upload Credit Reports Now</a></div><p><strong>Why This Matters:</strong><br>Without your credit reports, we can\'t provide you with the personalized dispute letters and strategies that will help improve your credit score.</p><p>Questions? Contact our support team for assistance.</p><p>Best regards,<br>The CreditAI Pro Team</p></div></body></html>',
    textContent: 'Upload Reminder\n\nHello {{userName}},\n\nThis is a friendly reminder that you have {{daysRemaining}} days left to upload your credit reports for AI-powered analysis.\n\nWhat You Need to Do:\n- Download your credit reports from all three bureaus\n- Upload them to your CreditAI Pro dashboard\n- Let our AI analyze and identify dispute opportunities\n- Start generating personalized dispute letters\n\nUpload Credit Reports Now: {{uploadUrl}}\n\nWhy This Matters:\nWithout your credit reports, we can\'t provide you with the personalized dispute letters and strategies that will help improve your credit score.\n\nQuestions? Contact our support team for assistance.\n\nBest regards,\nThe CreditAI Pro Team',
    variables: ['userName', 'daysRemaining', 'uploadUrl'],
    tags: ['reminder', 'upload', 'credit-reports', 'analysis'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  },

  // SUPPORT EMAILS
  {
    id: 'support-ticket-created',
    name: 'Support Ticket Created',
    subject: 'Support Ticket Created - {{ticketNumber}} | {{subject}}',
    category: 'support',
    description: 'Confirmation email when a support ticket is created',
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Support Ticket Created</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: #34495e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }.content { background: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; }.ticket-info { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #34495e; margin: 15px 0; }.priority-high { color: #e74c3c; font-weight: bold; }.priority-medium { color: #f39c12; font-weight: bold; }.priority-low { color: #27ae60; font-weight: bold; }.button { display: inline-block; background: #34495e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }</style></head><body><div class="header"><h1>🎫 Support Ticket Created</h1><p>We\'ve received your support request</p></div><div class="content"><h2>Hello {{userName}},</h2><p>Thank you for contacting CreditAI Pro support. We\'ve created a ticket for your request and will get back to you soon.</p><div class="ticket-info"><h3>Ticket Details:</h3><p><strong>Ticket Number:</strong> {{ticketNumber}}</p><p><strong>Subject:</strong> {{subject}}</p><p><strong>Priority:</strong> <span class="priority-{{priority}}">{{priority}}</span></p><p><strong>Created:</strong> {{createdDate}}</p><p><strong>Status:</strong> {{status}}</p><p><strong>Expected Response:</strong> {{responseTime}}</p></div><div style="text-align: center;"><a href="{{ticketUrl}}" class="button">View Ticket Status</a></div><p><strong>What Happens Next?</strong><br>Our support team will review your ticket and respond within {{responseTime}}. You\'ll receive email updates as we work on your request.</p><p>Need immediate assistance? Call us at {{supportPhone}}.</p><p>Thank you for your patience,<br>The CreditAI Pro Support Team</p></div></body></html>',
    textContent: 'Support Ticket Created\n\nHello {{userName}},\n\nThank you for contacting CreditAI Pro support. We\'ve created a ticket for your request and will get back to you soon.\n\nTicket Details:\n- Ticket Number: {{ticketNumber}}\n- Subject: {{subject}}\n- Priority: {{priority}}\n- Created: {{createdDate}}\n- Status: {{status}}\n- Expected Response: {{responseTime}}\n\nView Ticket Status: {{ticketUrl}}\n\nWhat Happens Next?\nOur support team will review your ticket and respond within {{responseTime}}. You\'ll receive email updates as we work on your request.\n\nNeed immediate assistance? Call us at {{supportPhone}}.\n\nThank you for your patience,\nThe CreditAI Pro Support Team',
    variables: ['userName', 'ticketNumber', 'subject', 'priority', 'createdDate', 'status', 'responseTime', 'ticketUrl', 'supportPhone'],
    tags: ['support', 'ticket', 'created', 'confirmation'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  },

  // MARKETING EMAILS
  {
    id: 'feature-announcement',
    name: 'Feature Announcement',
    subject: '🎉 New Feature: {{featureName}} - Now Available!',
    category: 'marketing',
    description: 'Announcement email for new features and updates',
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>New Feature Announcement</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: linear-gradient(135deg, #e67e22 0%, #f39c12 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }.content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }.feature-box { background: white; padding: 25px; border-radius: 8px; border: 2px solid #e67e22; margin: 20px 0; }.benefit { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #e67e22; }.button { display: inline-block; background: #e67e22; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }</style></head><body><div class="header"><h1>🎉 New Feature Available!</h1><p>Enhance your credit repair experience</p></div><div class="content"><h2>Hello {{userName}},</h2><p>We\'re excited to announce a powerful new feature that will take your credit repair journey to the next level!</p><div class="feature-box"><h3>🚀 {{featureName}}</h3><p>{{featureDescription}}</p><h4>Key Benefits:</h4><div class="benefit"><strong>✅ {{benefit1}}</strong></div><div class="benefit"><strong>✅ {{benefit2}}</strong></div><div class="benefit"><strong>✅ {{benefit3}}</strong></div><div class="benefit"><strong>✅ {{benefit4}}</strong></div></div><div style="text-align: center;"><a href="{{featureUrl}}" class="button">Try It Now - Free!</a></div><p><strong>How to Get Started:</strong><br>1. Log into your CreditAI Pro dashboard<br>2. Look for the new feature in your main menu<br>3. Follow the simple setup guide<br>4. Start experiencing the benefits immediately!</p><p>This feature is available to all CreditAI Pro users at no additional cost. We\'re constantly working to improve your experience and help you achieve better credit scores faster.</p><p>Questions? Our support team is here to help you get the most out of this new feature.</p><p>Happy credit repairing!<br>The CreditAI Pro Team</p></div></body></html>',
    textContent: 'New Feature Available!\n\nHello {{userName}},\n\nWe\'re excited to announce a powerful new feature that will take your credit repair journey to the next level!\n\n🚀 {{featureName}}\n{{featureDescription}}\n\nKey Benefits:\n✅ {{benefit1}}\n✅ {{benefit2}}\n✅ {{benefit3}}\n✅ {{benefit4}}\n\nTry It Now - Free: {{featureUrl}}\n\nHow to Get Started:\n1. Log into your CreditAI Pro dashboard\n2. Look for the new feature in your main menu\n3. Follow the simple setup guide\n4. Start experiencing the benefits immediately!\n\nThis feature is available to all CreditAI Pro users at no additional cost. We\'re constantly working to improve your experience and help you achieve better credit scores faster.\n\nQuestions? Our support team is here to help you get the most out of this new feature.\n\nHappy credit repairing!\nThe CreditAI Pro Team',
    variables: ['userName', 'featureName', 'featureDescription', 'benefit1', 'benefit2', 'benefit3', 'benefit4', 'featureUrl'],
    tags: ['marketing', 'feature', 'announcement', 'new'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  },

  // COMPLIANCE EMAILS
  {
    id: 'compliance-notice',
    name: 'Compliance Notice',
    subject: 'Important: {{complianceType}} - Action Required by {{deadline}}',
    category: 'compliance',
    description: 'Compliance and legal notice email',
    htmlContent: '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Compliance Notice</title><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }.header { background: #8e44ad; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }.content { background: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; }.notice-box { background: #fff3cd; border: 2px solid #f39c12; padding: 20px; border-radius: 5px; margin: 15px 0; }.legal-notice { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #8e44ad; margin: 15px 0; font-size: 12px; color: #666; }.button { display: inline-block; background: #8e44ad; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }</style></head><body><div class="header"><h1>⚖️ Compliance Notice</h1><p>Important legal update</p></div><div class="content"><h2>Hello {{userName}},</h2><p>We need to inform you about important changes that affect your CreditAI Pro service.</p><div class="notice-box"><h3>📋 {{complianceType}}</h3><p><strong>Effective Date:</strong> {{effectiveDate}}</p><p><strong>Action Required By:</strong> {{deadline}}</p><h4>What This Means for You:</h4><ul><li>{{impact1}}</li><li>{{impact2}}</li><li>{{impact3}}</li></ul><p><strong>Required Action:</strong> {{actionRequired}}</p></div><div style="text-align: center;"><a href="{{actionUrl}}" class="button">Take Required Action</a></div><div class="legal-notice"><p><strong>Legal Notice:</strong> {{legalNotice}}</p><p>For questions about this compliance update, contact our legal team at {{complianceEmail}} or {{compliancePhone}}.</p></div><p>Thank you for your attention to this important matter.<br>The CreditAI Pro Legal Team</p></div></body></html>',
    textContent: 'Compliance Notice\n\nHello {{userName}},\n\nWe need to inform you about important changes that affect your CreditAI Pro service.\n\n{{complianceType}}\n- Effective Date: {{effectiveDate}}\n- Action Required By: {{deadline}}\n\nWhat This Means for You:\n- {{impact1}}\n- {{impact2}}\n- {{impact3}}\n\nRequired Action: {{actionRequired}}\n\nTake Required Action: {{actionUrl}}\n\nLegal Notice: {{legalNotice}}\n\nFor questions about this compliance update, contact our legal team at {{complianceEmail}} or {{compliancePhone}}.\n\nThank you for your attention to this important matter.\nThe CreditAI Pro Legal Team',
    variables: ['userName', 'complianceType', 'effectiveDate', 'deadline', 'impact1', 'impact2', 'impact3', 'actionRequired', 'actionUrl', 'legalNotice', 'complianceEmail', 'compliancePhone'],
    tags: ['compliance', 'legal', 'notice', 'required'],
    isActive: true,
    createdAt: '2024-01-01',
    usageCount: 0
  }
]