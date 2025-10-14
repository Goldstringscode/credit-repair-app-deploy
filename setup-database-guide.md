# Database Setup Guide

## The Problem
You're getting this error:
```
ERROR: 42703: column "customer_email" does not exist
```

This happens when the database table structure doesn't match what the code expects.

## Solutions

### Option 1: Safe Setup (Recommended)
Use the safe schema that adds missing columns without dropping existing data:

1. **Run this SQL in your Supabase SQL Editor:**
   ```sql
   -- Copy and paste the contents of: supabase-subscriptions-schema-safe.sql
   ```

2. **This will:**
   - Check if the `subscriptions` table exists
   - Add any missing columns
   - Create indexes and triggers
   - Insert sample data only if the table is empty
   - Create the analytics view

### Option 2: Fresh Setup (If you don't have important data)
Use the fixed schema that drops and recreates everything:

1. **Run this SQL in your Supabase SQL Editor:**
   ```sql
   -- Copy and paste the contents of: supabase-subscriptions-schema-fixed.sql
   ```

2. **This will:**
   - Drop existing tables (⚠️ **WARNING: This deletes all data!**)
   - Create fresh tables with correct structure
   - Insert sample data
   - Create all indexes and views

## After Running the Schema

1. **Check your environment variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Test the subscription system:**
   - Go to `/admin/billing/subscriptions`
   - You should see sample data
   - Try creating a new subscription
   - Test pause/resume/cancel operations

## What the Schema Creates

### Tables:
- **`subscriptions`** - Main subscription data
- **`subscription_events`** - Audit trail for all changes

### Views:
- **`subscription_analytics`** - Real-time metrics

### Sample Data:
- 5 regular subscriptions (active, trialing, past_due, cancelled, paused)
- 2 executive accounts (free marketing accounts)

## Troubleshooting

### If you still get column errors:
1. Check that you ran the correct schema file
2. Verify the table structure in Supabase dashboard
3. Make sure all required columns exist

### If the app still uses mock data:
1. Check your environment variables are set correctly
2. Restart your development server
3. Check the browser console for any errors

## Next Steps

Once the database is set up:
1. The subscription system will automatically use the real database
2. All CRUD operations will persist to Supabase
3. Analytics will be calculated from real data
4. Executive accounts will work with proper database storage

The system is designed to fall back to mock data if the database isn't available, so it will work either way!
