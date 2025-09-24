# 🚚 STEP 3: ShipEngine Webhook Setup Guide

## **Overview**
Set up ShipEngine webhooks to handle shipping and tracking events for the certified mail system.

## **🎯 What We're Setting Up**
- **Webhook Endpoint**: `https://your-domain.com/api/webhooks/shipengine`
- **Events**: Label creation, tracking updates, delivery confirmations
- **Purpose**: Real-time tracking updates and delivery notifications

## **📋 Step-by-Step Instructions**

### **1. Access ShipEngine Dashboard**
1. Go to [https://app.shipengine.com](https://app.shipengine.com)
2. Log in with your ShipEngine account
3. Navigate to **Settings > Webhooks**

### **2. Create New Webhook**
1. Click **"Add Webhook"**
2. Enter webhook details:
   ```
   Name: Certified Mail Tracking Webhooks
   URL: https://your-production-domain.com/api/webhooks/shipengine
   Description: Real-time tracking updates for certified mail system
   ```

### **3. Select Events to Listen For**
Enable these events:
- ✅ `label.created` - When shipping label is created
- ✅ `tracking.status.updated` - When package status changes
- ✅ `tracking.delivered` - When package is delivered
- ✅ `tracking.exception` - When delivery issues occur
- ✅ `tracking.return_to_sender` - When package is returned

### **4. Configure Webhook Settings**
- **Retry Policy**: 3 attempts with exponential backoff
- **Timeout**: 30 seconds
- **Signature Verification**: Enabled (recommended)

### **5. Get Webhook Secret**
1. After creating the webhook, copy the **"Webhook Secret"**
2. This secret is used to verify webhook authenticity

### **6. Update Environment Variables**
Add the webhook secret to your `.env.local`:
```bash
SHIPENGINE_WEBHOOK_SECRET=your_actual_webhook_secret_here
```

## **🧪 Testing the Webhook**

### **Test with ShipEngine Test Events**
1. In ShipEngine dashboard, go to **Webhooks**
2. Click on your webhook
3. Click **"Send Test Event"**
4. Select event type to test
5. Check your application logs for processing

### **Test with cURL**
```bash
# Test webhook endpoint directly
curl -X POST https://your-domain.com/api/webhooks/shipengine \
  -H "Content-Type: application/json" \
  -H "X-ShipEngine-Signature: your_signature_here" \
  -d '{
    "event_type": "tracking.status.updated",
    "tracking_number": "TEST123456789",
    "status": "in_transit",
    "location": {"city": "Phoenix", "state": "AZ"},
    "description": "Package is in transit to destination",
    "timestamp": "2025-09-24T21:37:49.610Z"
  }'
```

## **🔍 Webhook Event Handling**

Our webhook handler (`app/api/webhooks/shipengine/route.ts`) processes these events:

### **Label Created**
- Updates mail record with label information
- Sets processing status to "label_created"
- Stores label URL and tracking number

### **Tracking Status Updated**
- Updates package status in database
- Creates tracking event record
- Sends notification to user
- Updates estimated delivery time

### **Package Delivered**
- Updates status to "delivered"
- Records delivery timestamp
- Sends delivery confirmation
- Triggers completion workflow

### **Delivery Exception**
- Updates status to "exception"
- Records exception details
- Sends alert notification
- Logs for investigation

### **Return to Sender**
- Updates status to "returned"
- Records return reason
- Sends return notification
- Initiates refund process

## **📊 Webhook Monitoring**

### **ShipEngine Dashboard**
1. Go to **Settings > Webhooks**
2. Click on your webhook endpoint
3. View **"Recent Deliveries"** tab
4. Check delivery status and response codes

### **Application Logs**
Check your application logs for webhook processing:
```bash
# Look for these log messages:
🔔 ShipEngine webhook received
✅ Tracking update processed for: [tracking_number]
❌ Error updating tracking status: [error_details]
📝 Mail event created: [event_type] for [tracking_number]
```

## **🚨 Troubleshooting**

### **Common Issues**

#### **1. Webhook Not Receiving Events**
- Check if webhook URL is accessible
- Verify webhook is enabled in ShipEngine dashboard
- Check firewall/network settings
- Ensure webhook URL uses HTTPS

#### **2. Signature Verification Failed**
- Ensure webhook secret is correct
- Check if webhook secret is properly set in environment variables
- Verify signature header format

#### **3. 500 Internal Server Error**
- Check application logs for specific error
- Verify database connection
- Ensure all required environment variables are set
- Check if database schema is up to date

#### **4. Events Not Processing**
- Check if webhook handler is properly implemented
- Verify event types are correctly configured
- Check application logs for processing errors
- Ensure tracking number exists in database

### **Debug Commands**
```bash
# Test webhook endpoint directly
curl -X POST https://your-domain.com/api/webhooks/shipengine \
  -H "Content-Type: application/json" \
  -d '{"event_type": "tracking.status.updated", "tracking_number": "TEST123"}'

# Check webhook logs
tail -f logs/shipengine-webhook.log

# Test database connection
node scripts/test-database-connection.js
```

## **🔐 Security Considerations**

### **Webhook Signature Verification**
Our webhook handler verifies ShipEngine signatures:
```typescript
const signature = request.headers.get('x-shipengine-signature');
const expectedSignature = crypto
  .createHmac('sha256', process.env.SHIPENGINE_WEBHOOK_SECRET)
  .update(JSON.stringify(body))
  .digest('hex');
```

### **Rate Limiting**
- ShipEngine has built-in rate limiting
- Our handler includes retry logic
- Failed webhooks are logged for analysis

### **Data Validation**
- All webhook data is validated before processing
- Invalid events are logged and rejected
- Database operations are wrapped in transactions

## **✅ Verification Checklist**

- [ ] Webhook endpoint created in ShipEngine dashboard
- [ ] Correct events selected (label.*, tracking.*)
- [ ] Webhook secret copied and added to environment variables
- [ ] Webhook URL is accessible from internet (HTTPS required)
- [ ] Test events are being received and processed
- [ ] Tracking updates are working correctly
- [ ] Database is being updated with tracking events
- [ ] User notifications are being sent
- [ ] Error handling is working for failed webhooks

## **📈 Performance Monitoring**

### **Key Metrics to Track**
- Webhook delivery success rate
- Average processing time
- Database update success rate
- User notification delivery rate
- Error frequency and types

### **Monitoring Setup**
```bash
# Add to your monitoring dashboard
- Webhook response time: < 2 seconds
- Success rate: > 99%
- Database update time: < 500ms
- Notification delivery: > 95%
```

## **🎯 Next Steps**

After completing ShipEngine webhook setup:
1. **Step 4**: Configure email service
2. **Step 5**: Deploy to production
3. **Step 6**: Test end-to-end functionality
4. **Step 7**: Monitor and optimize performance

## **📞 Support**

If you encounter issues:
1. Check ShipEngine webhook logs in dashboard
2. Review application logs for errors
3. Test webhook endpoint manually
4. Verify all environment variables are set correctly
5. Check database connectivity and schema
