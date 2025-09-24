# ShipEngine Webhook Configuration Guide

## Overview
This guide will help you configure ShipEngine webhooks to receive real-time tracking updates for your certified mail system.

## Prerequisites
- ShipEngine account with API access
- Production domain with HTTPS
- Webhook endpoint deployed and accessible

## Webhook Endpoint
Your webhook endpoint is: `https://yourdomain.com/api/webhooks/shipengine`

## Step 1: Access ShipEngine Dashboard
1. Log in to your ShipEngine account
2. Navigate to **Settings** → **Webhooks**
3. Click **Add Webhook**

## Step 2: Configure Webhook
Fill in the following details:

### Basic Configuration
- **Webhook URL**: `https://yourdomain.com/api/webhooks/shipengine`
- **Name**: `Credit Repair App - Certified Mail Tracking`
- **Description**: `Real-time tracking updates for certified mail system`

### Events to Subscribe To
Select the following events:
- ✅ `label.created` - When shipping label is created
- ✅ `tracking.status.updated` - When package status changes
- ✅ `tracking.delivered` - When package is delivered
- ✅ `tracking.exception` - When delivery issues occur
- ✅ `tracking.return_to_sender` - When package is returned

### Security
- **Secret Key**: Generate a strong secret key (32+ characters)
- **Signature Verification**: Enable (recommended)

## Step 3: Environment Variables
Add the webhook secret to your `.env.local`:

```bash
# ShipEngine Webhook Configuration
SHIPENGINE_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 4: Test Webhook
1. Save the webhook configuration
2. ShipEngine will send a test webhook to verify the endpoint
3. Check your application logs for the test webhook
4. Verify the webhook is working by sending a test package

## Step 5: Monitor Webhooks
- Check webhook delivery status in ShipEngine dashboard
- Monitor application logs for webhook processing
- Set up alerts for failed webhook deliveries

## Troubleshooting

### Common Issues
1. **Webhook not receiving events**
   - Verify URL is accessible from internet
   - Check HTTPS certificate is valid
   - Ensure webhook secret is correct

2. **Webhook receiving but not processing**
   - Check application logs for errors
   - Verify database connection
   - Ensure all required environment variables are set

3. **Duplicate events**
   - Implement idempotency in webhook handler
   - Check for duplicate webhook configurations

### Testing Webhook Locally
For local development, use ngrok or similar tool:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3001

# Use the ngrok URL in ShipEngine webhook configuration
# Example: https://abc123.ngrok.io/api/webhooks/shipengine
```

## Production Checklist
- [ ] Webhook URL is HTTPS
- [ ] Webhook secret is configured
- [ ] All required events are subscribed
- [ ] Webhook endpoint is tested
- [ ] Monitoring is set up
- [ ] Error handling is implemented
- [ ] Database is accessible from webhook handler

## Security Best Practices
1. **Validate Webhook Signatures**: Always verify webhook signatures
2. **Use HTTPS**: Never use HTTP for webhooks in production
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Logging**: Log all webhook events for debugging
5. **Error Handling**: Implement proper error handling and retries

## Webhook Event Examples

### Label Created
```json
{
  "event_type": "label.created",
  "label_id": "se-123456789",
  "tracking_number": "1Z999AA1234567890",
  "label_download_url": "https://api.shipengine.com/v1/labels/se-123456789",
  "created_at": "2025-01-24T10:30:00Z"
}
```

### Tracking Status Updated
```json
{
  "event_type": "tracking.status.updated",
  "tracking_number": "1Z999AA1234567890",
  "status": "in_transit",
  "location": {
    "city": "Phoenix",
    "state": "AZ",
    "country": "US"
  },
  "description": "Package is in transit to destination",
  "timestamp": "2025-01-24T14:30:00Z"
}
```

### Package Delivered
```json
{
  "event_type": "tracking.delivered",
  "tracking_number": "1Z999AA1234567890",
  "delivered_at": "2025-01-25T09:15:00Z",
  "location": {
    "city": "Atlanta",
    "state": "GA",
    "country": "US"
  },
  "signed_by": "John Doe"
}
```

## Next Steps
After configuring webhooks:
1. Enable real ShipEngine API calls
2. Set up email notifications
3. Test end-to-end functionality
4. Deploy to production
