# 📱 Twilio SMS Setup Guide

## Step-by-Step Twilio Configuration

### 1. Create Twilio Account

1. **Go to Twilio Website**
   - Visit: https://www.twilio.com
   - Click "Sign up for free"

2. **Sign Up Process**
   - Enter your email address
   - Create a password
   - Verify your email address
   - Enter your phone number for verification

3. **Complete Account Setup**
   - Fill in your personal information
   - Choose your country/region
   - Accept terms and conditions

### 2. Get Your Twilio Credentials

1. **Access Twilio Console**
   - Log into your Twilio account
   - Go to the Console Dashboard: https://console.twilio.com

2. **Find Your Account SID**
   - On the Console Dashboard, you'll see "Account SID"
   - Copy this value (starts with "AC...")

3. **Find Your Auth Token**
   - On the Console Dashboard, click "Show" next to "Auth Token"
   - Copy this value (long string of letters and numbers)

4. **Get a Phone Number**
   - Go to "Phone Numbers" → "Manage" → "Buy a number"
   - Choose a phone number (US numbers are free for trial accounts)
   - Purchase the number

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Optional SMS Settings
SMS_FROM_NUMBER=+1234567890
SMS_RATE_LIMIT=100
SMS_DAILY_LIMIT=1000
```

### 4. Test Your Configuration

1. **Start Your Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to SMS Dashboard**
   - Go to: http://localhost:3000/dashboard/sms
   - Click on "Send SMS" tab

3. **Test SMS Sending**
   - Enter your phone number (with country code)
   - Type a test message
   - Click "Send SMS"

### 5. Verify SMS Delivery

- Check your phone for the test message
- If successful, you'll see a success message in the dashboard
- Check the "Logs" tab to see delivery status

## 🔧 Troubleshooting

### Common Issues

**1. "Invalid Account SID" Error**
- Double-check your Account SID starts with "AC"
- Ensure no extra spaces or characters

**2. "Invalid Auth Token" Error**
- Verify your Auth Token is correct
- Make sure it's the full token, not truncated

**3. "Invalid Phone Number" Error**
- Ensure phone number includes country code (+1 for US)
- Format: +1234567890 (no spaces or dashes)

**4. "SMS Not Received"**
- Check your phone's spam/junk folder
- Verify the phone number is correct
- Ensure you have a valid Twilio phone number

**5. "Insufficient Funds" Error**
- Check your Twilio account balance
- Add funds to your account if needed

### Testing Commands

**Test SMS API directly:**
```bash
curl -X POST http://localhost:3000/api/sms \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_sms",
    "to": "+1234567890",
    "message": "Test message from CreditAI Pro"
  }'
```

**Test with PowerShell:**
```powershell
$body = '{"action": "send_sms", "to": "+1234567890", "message": "Test message"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/sms" -Method POST -Body $body -ContentType "application/json"
```

## 💰 Twilio Pricing

### Trial Account
- **Free Credits**: $15 (enough for ~1,500 SMS messages)
- **Phone Number**: Free (US numbers)
- **SMS Cost**: ~$0.0075 per message

### Production Account
- **SMS Cost**: $0.0075 per message (US)
- **Phone Number**: $1.00/month
- **No setup fees**

## 🔒 Security Best Practices

1. **Never commit credentials to Git**
   - Keep `.env.local` in `.gitignore`
   - Use environment variables in production

2. **Use different credentials for development/production**
   - Separate Twilio accounts if needed
   - Use Twilio's test credentials for development

3. **Monitor usage and costs**
   - Set up billing alerts
   - Monitor SMS logs regularly

## 📊 Monitoring Your SMS

### Twilio Console
- View message logs
- Monitor delivery status
- Check account usage

### SMS Dashboard
- Real-time delivery status
- Cost tracking
- Error monitoring
- Performance analytics

## 🚀 Production Deployment

### Environment Variables for Production
```env
TWILIO_ACCOUNT_SID=your_production_account_sid
TWILIO_AUTH_TOKEN=your_production_auth_token
TWILIO_PHONE_NUMBER=your_production_phone_number
```

### Recommended Settings
- Enable webhook notifications
- Set up delivery status callbacks
- Configure rate limiting
- Monitor usage and costs

## 📞 Support

### Twilio Support
- Documentation: https://www.twilio.com/docs
- Support: https://support.twilio.com
- Community: https://stackoverflow.com/questions/tagged/twilio

### CreditAI Pro SMS Support
- Check the SMS dashboard logs
- Use the testing suite for debugging
- Review error messages in the console

## ✅ Quick Setup Checklist

- [ ] Created Twilio account
- [ ] Got Account SID and Auth Token
- [ ] Purchased a phone number
- [ ] Added credentials to `.env.local`
- [ ] Restarted development server
- [ ] Tested SMS sending
- [ ] Verified message delivery
- [ ] Checked SMS dashboard logs

## 🎯 Next Steps

1. **Test all SMS templates** using the testing suite
2. **Configure automated triggers** for your use cases
3. **Set up monitoring** and alerts
4. **Customize templates** for your brand
5. **Deploy to production** with proper credentials

Your SMS system is now ready to send automated notifications for both credit repair and MLM systems! 🎉
