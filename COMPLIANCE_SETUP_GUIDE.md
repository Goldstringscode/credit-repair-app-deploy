# Compliance System Setup Guide

## 🎯 Required Environment Variables

To make the compliance system fully functional, you need to set up the following environment variables in your Vercel project:

### **Required Supabase Environment Variables:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### **How to Get These Values:**

1. **Go to your Supabase Dashboard:** https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings → API**
4. **Copy the following values:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### **Setting Environment Variables in Vercel:**

1. **Go to your Vercel Dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add each variable:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project-id.supabase.co`
   - Environment: Production, Preview, Development

   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `your_anon_key_here`
   - Environment: Production, Preview, Development

   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `your_service_role_key_here`
   - Environment: Production, Preview, Development

## 🗄️ Database Setup

### **Option 1: Automatic Setup (Recommended)**

Run this SQL script in your Supabase SQL Editor:

```sql
-- Compliance Database Schema
-- Run this in your Supabase SQL Editor

-- Compliance Requests Table
CREATE TABLE IF NOT EXISTS compliance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    framework VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(10) NOT NULL DEFAULT 'normal',
    description TEXT,
    reason TEXT,
    requested_data JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    response_data JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Audit Log
CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    admin_id UUID,
    action VARCHAR(100) NOT NULL,
    framework VARCHAR(20) NOT NULL,
    request_id UUID REFERENCES compliance_requests(id),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FCRA Disputes
CREATE TABLE IF NOT EXISTS fcra_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    credit_bureau VARCHAR(50) NOT NULL,
    account_name VARCHAR(200),
    account_number VARCHAR(100),
    dispute_reason TEXT NOT NULL,
    supporting_documents JSONB,
    status VARCHAR(20) DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    bureau_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CCPA Consumer Requests
CREATE TABLE IF NOT EXISTS ccpa_consumer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending',
    business_purpose TEXT,
    third_parties JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HIPAA Health Data
CREATE TABLE IF NOT EXISTS hipaa_health_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    sensitivity_level VARCHAR(20) NOT NULL,
    access_level VARCHAR(20) NOT NULL,
    encrypted BOOLEAN DEFAULT true,
    last_accessed TIMESTAMP WITH TIME ZONE,
    accessed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PCI Security Events
CREATE TABLE IF NOT EXISTS pci_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    affected_systems JSONB,
    remediation_actions JSONB,
    status VARCHAR(20) DEFAULT 'open',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Retention Records
CREATE TABLE IF NOT EXISTS data_retention_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    retention_policy_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    exempt_reason TEXT,
    created_by UUID
);

-- Compliance Notifications
CREATE TABLE IF NOT EXISTS compliance_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    admin_id UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_compliance_requests_user_id ON compliance_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_requests_framework ON compliance_requests(framework);
CREATE INDEX IF NOT EXISTS idx_compliance_requests_status ON compliance_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON compliance_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON compliance_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON compliance_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON compliance_notifications(is_read);
```

### **Option 2: Manual Setup**

1. **Go to your Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste the SQL script above**
4. **Click "Run"**

## 🚀 Deployment Steps

1. **Set Environment Variables in Vercel:**
   - Add all required Supabase environment variables
   - Redeploy your project

2. **Run Database Setup:**
   - Execute the SQL script in Supabase
   - Verify tables are created

3. **Test the Compliance System:**
   - Go to Admin Dashboard → Compliance
   - Try clicking the compliance buttons
   - Check for success/error messages

## 🔧 Troubleshooting

### **Common Issues:**

1. **"Database not configured" error:**
   - Check that all Supabase environment variables are set
   - Verify the values are correct
   - Redeploy the project

2. **"Table doesn't exist" error:**
   - Run the database setup SQL script
   - Check that tables were created in Supabase

3. **"Failed to submit request" error:**
   - Check Supabase logs for detailed error messages
   - Verify database permissions
   - Check that all required tables exist

### **Verification Steps:**

1. **Check Environment Variables:**
   ```bash
   # In your Vercel project settings, verify these exist:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Check Database Tables:**
   - Go to Supabase Dashboard → Table Editor
   - Verify these tables exist:
     - compliance_requests
     - compliance_audit_log
     - fcra_disputes
     - ccpa_consumer_requests
     - hipaa_health_data
     - pci_security_events
     - data_retention_records
     - compliance_notifications

3. **Test API Endpoints:**
   - Try accessing: `https://your-app.vercel.app/api/compliance`
   - Should return compliance data or error message

## ✅ Success Indicators

When everything is working correctly:

1. **Compliance Dashboard loads without errors**
2. **All compliance buttons work and show success messages**
3. **Data is stored in the database**
4. **No "Database not configured" errors**

## 📞 Support

If you encounter issues:

1. **Check the browser console for detailed error messages**
2. **Check Vercel function logs for API errors**
3. **Verify all environment variables are set correctly**
4. **Ensure database tables are created**

The compliance system will work perfectly once the environment variables and database are properly configured!
