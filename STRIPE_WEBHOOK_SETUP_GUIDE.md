# 🔗 STEP 2: Stripe Webhook Setup Guide

## **Overview**
Set up Stripe webhooks to handle payment events for the certified mail system.

## **🎯 What We're Setting Up**
- **Webhook Endpoint**: `https://your-domain.com/api/webhooks/stripe-mail`
- **Events**: Payment success, failure, and dispute events
- **Purpose**: Automatically update mail status when payments are processed

## **📋 Step-by-Step Instructions**

### **1. Access Stripe Dashboard**
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Log in with your Stripe account
3. Make sure you're in **Test mode** (for development) or **Live mode** (for production)

### **2. Navigate to Webhooks**
1. In the left sidebar, click **"Developers"**
2. Click **"Webhooks"**
3. Click **"Add endpoint"**

### **3. Configure Webhook Endpoint**
```
Endpoint URL: https://your-production-domain.com/api/webhooks/stripe-mail
Description: Certified Mail Payment Events
```

### **4. Select Events to Listen For**
Select these specific events:
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `payment_intent.canceled`
- ✅ `charge.dispute.created`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### **5. Get Webhook Secret**
1. After creating the webhook, click on it
2. In the **"Signing secret"** section, click **"Reveal"**
3. Copy the webhook secret (starts with `whsec_`)

### **6. Update Environment Variables**
Add the webhook secret to your `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

## **🧪 Testing the Webhook**

### **Test with Stripe CLI (Recommended)**
```bash
# Install Stripe CLI
# Windows: Download from https://github.com/stripe/stripe-cli/releases
# Or use: winget install stripe.stripe-cli

# Login to Stripe
stripe login

# Forward events to your local development server
stripe listen --forward-to localhost:3000/api/webhooks/stripe-mail

# In another terminal, trigger a test event
stripe trigger payment_intent.succeeded
```

### **Test with ngrok (Alternative)**
```bash
# Install ngrok
# Download from https://ngrok.com/download

# Expose your local server
ngrok http 3000

# Use the ngrok URL in Stripe webhook configuration
# Example: https://abc123.ngrok.io/api/webhooks/stripe-mail
```

## **🔍 Webhook Event Handling**

Our webhook handler (`app/api/webhooks/stripe-mail/route.ts`) processes these events:

### **Payment Succeeded**
- Updates mail status to "paid"
- Triggers mail sending process
- Sends confirmation email

### **Payment Failed**
- Updates mail status to "payment_failed"
- Sends failure notification
- Logs error for analysis

### **Payment Canceled**
- Updates mail status to "canceled"
- Sends cancellation notification
- Cleans up pending processes

### **Charge Dispute**
- Updates mail status to "disputed"
- Notifies administrators
- Gathers evidence for dispute response

## **📊 Webhook Monitoring**

### **Stripe Dashboard**
1. Go to **Developers > Webhooks**
2. Click on your webhook endpoint
3. View **"Recent deliveries"** tab
4. Check for successful/failed deliveries

### **Application Logs**
Check your application logs for webhook processing:
```bash
# Look for these log messages:
✅ Payment succeeded for tracking ID: [tracking_id]
❌ Payment failed for tracking ID: [tracking_id]
⚠️  No tracking ID found in payment intent metadata
```

## **🚨 Troubleshooting**

### **Common Issues**

#### **1. Webhook Not Receiving Events**
- Check if webhook URL is accessible
- Verify webhook is enabled in Stripe dashboard
- Check firewall/network settings

#### **2. Signature Verification Failed**
- Ensure webhook secret is correct
- Check if webhook secret is properly set in environment variables
- Verify webhook secret matches Stripe dashboard

#### **3. 500 Internal Server Error**
- Check application logs for specific error
- Verify database connection
- Ensure all required environment variables are set

#### **4. Events Not Processing**
- Check if webhook handler is properly implemented
- Verify event types are correctly configured
- Check application logs for processing errors

### **Debug Commands**
```bash
# Test webhook endpoint directly
curl -X POST https://your-domain.com/api/webhooks/stripe-mail \
  -H "Content-Type: application/json" \
  -d '{"type": "payment_intent.succeeded", "data": {"object": {"id": "pi_test"}}}'

# Check webhook logs
tail -f logs/webhook.log
```

## **✅ Verification Checklist**

- [ ] Webhook endpoint created in Stripe dashboard
- [ ] Correct events selected (payment_intent.*, charge.dispute.*)
- [ ] Webhook secret copied and added to environment variables
- [ ] Webhook URL is accessible from internet
- [ ] Test events are being received and processed
- [ ] Payment status updates are working correctly
- [ ] Error handling is working for failed payments

## **🎯 Next Steps**

After completing Stripe webhook setup:
1. **Step 3**: Set up ShipEngine webhooks
2. **Step 4**: Configure email service
3. **Step 5**: Deploy to production
4. **Step 6**: Test end-to-end functionality

## **📞 Support**

If you encounter issues:
1. Check Stripe webhook logs in dashboard
2. Review application logs for errors
3. Test webhook endpoint manually
4. Verify all environment variables are set correctly
