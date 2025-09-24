# Certified Mail System - Phase 1 Deployment Guide

## 🚀 **PHASE 1 COMPLETE: CORE INFRASTRUCTURE**

### **✅ What's Been Implemented**

#### **1. Database Schema**
- **File**: `scripts/certified-mail-schema.sql`
- **Tables Created**:
  - `certified_mail_tracking` - Main tracking table
  - `certified_mail_events` - Event history
  - `certified_mail_templates` - Letter templates
  - `usps_service_rates` - USPS pricing
  - `user_mail_preferences` - User settings

#### **2. USPS API Integration**
- **File**: `lib/usps-api.ts`
- **Features**:
  - Address validation
  - Real-time tracking
  - Service rate calculation
  - Label generation
  - Mock responses for development

#### **3. Certified Mail Service**
- **File**: `lib/certified-mail-service.ts`
- **Features**:
  - Mail request creation
  - Payment processing integration
  - Status tracking
  - Template management
  - Cost calculation

#### **4. Stripe Payment Integration**
- **File**: `lib/stripe-mail-payments.ts`
- **Features**:
  - Payment intent creation
  - Webhook handling
  - Refund processing
  - Customer management
  - Dispute handling

#### **5. API Routes**
- **Create Mail**: `POST /api/certified-mail/create`
- **Process Payment**: `POST /api/certified-mail/process-payment`
- **Get Status**: `GET /api/certified-mail/status/[trackingId]`
- **Get Templates**: `GET /api/certified-mail/templates`
- **Get Rates**: `GET /api/certified-mail/rates`
- **Validate Address**: `POST /api/certified-mail/validate-address`
- **Stripe Webhook**: `POST /api/webhooks/stripe-mail`

#### **6. Testing Suite**
- **File**: `scripts/test-certified-mail-phase1.js`
- **Tests All Components**:
  - Address validation
  - Service rates
  - Mail templates
  - Mail creation
  - Status tracking
  - Stripe webhooks

---

## 🛠️ **DEPLOYMENT STEPS**

### **Step 1: Database Setup**

1. **Run the Database Schema**:
   ```sql
   -- Execute in your Supabase SQL Editor
   -- Copy and paste contents of scripts/certified-mail-schema.sql
   ```

2. **Verify Tables Created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'certified_mail%';
   ```

### **Step 2: Environment Configuration**

1. **Update your `.env.local` file**:
   ```env
   # Add these new variables
   USPS_API_KEY=your_usps_api_key_here
   USPS_USER_ID=your_usps_user_id_here
   USPS_BASE_URL=https://secure.shippingapis.com/ShippingAPI.dll
   USPS_WEBHOOK_SECRET=your_usps_webhook_secret_here
   
   # Ensure Stripe is configured
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

2. **Get USPS API Credentials**:
   - Visit: https://www.usps.com/business/web-tools-apis/
   - Register for Web Tools API
   - Get your API Key and User ID

### **Step 3: Install Dependencies**

```bash
npm install
# All required dependencies are already in package.json
```

### **Step 4: Test the System**

1. **Run the Test Suite**:
   ```bash
   npm run test:certified-mail
   ```

2. **Expected Output**:
   ```
   🚀 Starting Certified Mail System - Phase 1 Tests
   ============================================================
   
   🧪 Testing Address Validation...
   ✅ Address validation working
   
   🧪 Testing Service Rates...
   ✅ Service rates working
   
   🧪 Testing Mail Templates...
   ✅ Mail templates working
   
   🧪 Testing Create Mail Request...
   ✅ Create mail request working
   
   🧪 Testing Mail Status...
   ✅ Mail status working
   
   🧪 Testing Stripe Webhook Endpoint...
   ✅ Stripe webhook endpoint working
   
   📊 Test Results Summary
   ============================================================
   ✅ addressValidation: PASSED
   ✅ serviceRates: PASSED
   ✅ mailTemplates: PASSED
   ✅ createMailRequest: PASSED
   ✅ mailStatus: PASSED
   ✅ stripeWebhook: PASSED
   
   🎯 Overall: 6/6 tests passed
   🎉 All Phase 1 tests passed! Ready for production deployment.
   ```

### **Step 5: Configure Stripe Webhooks**

1. **Add Webhook Endpoint in Stripe Dashboard**:
   - URL: `https://yourdomain.com/api/webhooks/stripe-mail`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `charge.dispute.created`

2. **Update Webhook Secret**:
   - Copy the webhook secret from Stripe
   - Update `STRIPE_WEBHOOK_SECRET` in your environment

---

## 🧪 **TESTING THE SYSTEM**

### **Manual Testing**

1. **Test Address Validation**:
   ```bash
   curl -X POST http://localhost:3000/api/certified-mail/validate-address \
     -H "Content-Type: application/json" \
     -d '{
       "address": {
         "address1": "123 Main St",
         "city": "New York",
         "state": "NY",
         "zip5": "10001"
       }
     }'
   ```

2. **Test Mail Creation**:
   ```bash
   curl -X POST http://localhost:3000/api/certified-mail/create \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "test-user-123",
       "recipient": {
         "name": "Test Recipient",
         "address": {
           "address1": "123 Main St",
           "city": "New York",
           "state": "NY",
           "zip5": "10001"
         }
       },
       "sender": {
         "name": "Test Sender",
         "address": {
           "address1": "456 Business Ave",
           "city": "Los Angeles",
           "state": "CA",
           "zip5": "90210"
         }
       },
       "letter": {
         "subject": "Test Letter",
         "content": "Test content",
         "type": "dispute"
       },
       "mailService": "certified_mail"
     }'
   ```

---

## 📊 **MONITORING & MAINTENANCE**

### **Health Checks**

1. **Database Connection**:
   - Check if all tables exist
   - Verify indexes are created
   - Test RLS policies

2. **API Endpoints**:
   - All endpoints return 200 status
   - Error handling works correctly
   - Rate limiting is active

3. **External Services**:
   - USPS API connectivity
   - Stripe API connectivity
   - Webhook delivery

### **Logs to Monitor**

1. **Application Logs**:
   - Mail creation attempts
   - Payment processing
   - USPS API calls
   - Error messages

2. **Stripe Logs**:
   - Webhook events
   - Payment failures
   - Disputes

3. **Database Logs**:
   - Query performance
   - Connection issues
   - RLS policy violations

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

1. **Database Connection Failed**:
   - Check Supabase credentials
   - Verify database URL
   - Check RLS policies

2. **USPS API Errors**:
   - Verify API credentials
   - Check rate limits
   - Validate address format

3. **Stripe Payment Failed**:
   - Check API keys
   - Verify webhook configuration
   - Check payment method

4. **Mail Creation Failed**:
   - Validate all required fields
   - Check address format
   - Verify service availability

### **Error Codes**

- `400` - Bad Request (missing/invalid data)
- `401` - Unauthorized (invalid API keys)
- `404` - Not Found (tracking ID not found)
- `500` - Internal Server Error (system error)

---

## 🎯 **NEXT STEPS: PHASE 2**

Phase 1 provides the core infrastructure. Phase 2 will add:

1. **Enhanced Letter Generation**
   - AI-powered customization
   - Template library expansion
   - Legal compliance validation

2. **Advanced Features**
   - Bulk sending
   - Scheduled sending
   - Mobile optimization

3. **User Interface**
   - Dashboard integration
   - Real-time tracking
   - Notification system

4. **Analytics & Reporting**
   - Success rates
   - Cost analysis
   - Performance metrics

---

## 📞 **SUPPORT**

If you encounter any issues during deployment:

1. **Check the test results** first
2. **Review the logs** for error messages
3. **Verify environment variables** are set correctly
4. **Test individual components** using the API endpoints

The system is designed to be robust and handle errors gracefully, with comprehensive logging for debugging.

---

**🎉 Phase 1 is complete and ready for production deployment!**

