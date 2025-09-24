# Email System Setup Guide

This guide will help you configure the email system for the Credit Repair App to send real emails.

## Quick Setup (Gmail - Recommended for Development)

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password
- Go to Google Account > Security > 2-Step Verification > App passwords
- Generate a new app password for "Mail"
- Copy the 16-character password

### 3. Set Environment Variables
Create a `.env.local` file in your project root:

```bash
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password

# Email Settings
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Credit Repair App
APP_URL=http://localhost:3000
```

### 4. Test the Configuration
Restart your development server and test the invite functionality.

## Production Email Services

### Option 1: SendGrid (Recommended for Production)

1. **Sign up for SendGrid**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Create a free account (100 emails/day free)

2. **Get API Key**
   - Go to Settings > API Keys
   - Create a new API key with "Full Access"
   - Copy the API key

3. **Set Environment Variables**
   ```bash
   SENDGRID_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Credit Repair App
   ```

### Option 2: Mailgun

1. **Sign up for Mailgun**
   - Go to [mailgun.com](https://mailgun.com)
   - Create a free account (10,000 emails/month free)

2. **Get Credentials**
   - Go to Domains > Your Domain > API Keys
   - Copy the Private API key and domain

3. **Set Environment Variables**
   ```bash
   MAILGUN_API_KEY=your-mailgun-api-key
   MAILGUN_DOMAIN=your-mailgun-domain
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Credit Repair App
   ```

### Option 3: Amazon SES

1. **Set up AWS SES**
   - Go to AWS Console > Simple Email Service
   - Verify your domain or email address
   - Create IAM user with SES permissions

2. **Set Environment Variables**
   ```bash
   AWS_SES_ACCESS_KEY_ID=your-access-key
   AWS_SES_SECRET_ACCESS_KEY=your-secret-key
   AWS_SES_REGION=us-east-1
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Credit Repair App
   ```

## Email Templates

The system includes templates for:

### MLM System
- **Invitation Emails**: When inviting new team members
- **Welcome Emails**: When new members join
- **Team Updates**: Rank upgrades, new members, commissions
- **Rank Upgrades**: When members advance in rank

### Credit Repair System
- **Welcome Emails**: When users sign up for credit repair
- **Progress Updates**: Regular updates on credit repair progress
- **Completion Emails**: When credit repair process is complete

### Admin System
- **Notifications**: System notifications for admins
- **Alerts**: Critical system alerts

## Testing Email Configuration

### 1. Test MLM Invite
```bash
# Test the invite API
curl -X POST http://localhost:3000/api/mlm/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 2. Check Console Logs
Look for these logs in your console:
```
📧 Using email service: gmail
📧 SMTP Host: smtp.gmail.com:587
📧 Sending MLM Invitation Email:
✅ Email sent successfully: <message-id>
```

### 3. Verify Email Delivery
- Check the recipient's inbox
- Check spam folder if not received
- For Gmail, check the "Sent" folder in your account

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Make sure you're using an App Password, not your regular password
   - Ensure 2-Factor Authentication is enabled

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify SMTP host and port settings

3. **Emails going to spam**
   - Set up SPF, DKIM, and DMARC records for your domain
   - Use a professional "From" email address

4. **Rate limiting**
   - Gmail: 500 emails/day for free accounts
   - SendGrid: 100 emails/day for free accounts
   - Mailgun: 10,000 emails/month for free accounts

### Debug Mode

To enable detailed email logging, set:
```bash
NODE_ENV=development
```

This will show preview URLs for test emails and detailed SMTP logs.

## Security Best Practices

1. **Never commit credentials to version control**
   - Use `.env.local` file (already in `.gitignore`)
   - Use environment variables in production

2. **Use App Passwords**
   - Never use your main account password
   - Generate specific app passwords for each service

3. **Rotate credentials regularly**
   - Change app passwords monthly
   - Monitor email usage for unusual activity

4. **Use HTTPS in production**
   - Always use secure SMTP connections
   - Set `SMTP_SECURE=true` for production

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your environment variables are set correctly
3. Test with a simple email first
4. Check the email service provider's documentation

