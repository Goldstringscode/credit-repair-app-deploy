-- Subscription Management Database Schema (Safe Version)
-- This version checks for existing columns and adds them if missing

-- Check if subscriptions table exists, if not create it
DO $$
BEGIN
    -- Create subscriptions table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        CREATE TABLE subscriptions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id VARCHAR(255) NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255) NOT NULL,
            plan_id VARCHAR(50) NOT NULL,
            plan_name VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'active',
            current_period_start DATE NOT NULL,
            current_period_end DATE NOT NULL,
            trial_end DATE,
            cancel_at_period_end BOOLEAN DEFAULT FALSE,
            amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            currency VARCHAR(3) DEFAULT 'usd',
            next_billing_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_payment_date DATE,
            last_payment_amount DECIMAL(10,2),
            payment_method VARCHAR(255) NOT NULL,
            billing_cycle VARCHAR(20) NOT NULL DEFAULT 'month',
            proration_enabled BOOLEAN DEFAULT TRUE,
            dunning_enabled BOOLEAN DEFAULT TRUE,
            notes TEXT,
            is_executive_account BOOLEAN DEFAULT FALSE,
            stripe_subscription_id VARCHAR(255),
            stripe_customer_id VARCHAR(255),
            metadata JSONB DEFAULT '{}'::jsonb
        );
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add customer_email if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'customer_email') THEN
        ALTER TABLE subscriptions ADD COLUMN customer_email VARCHAR(255);
    END IF;
    
    -- Add customer_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'customer_name') THEN
        ALTER TABLE subscriptions ADD COLUMN customer_name VARCHAR(255);
    END IF;
    
    -- Add customer_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'customer_id') THEN
        ALTER TABLE subscriptions ADD COLUMN customer_id VARCHAR(255);
    END IF;
    
    -- Add plan_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'plan_id') THEN
        ALTER TABLE subscriptions ADD COLUMN plan_id VARCHAR(50);
    END IF;
    
    -- Add plan_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'plan_name') THEN
        ALTER TABLE subscriptions ADD COLUMN plan_name VARCHAR(255);
    END IF;
    
    -- Add status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'status') THEN
        ALTER TABLE subscriptions ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;
    
    -- Add current_period_start if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'current_period_start') THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_start DATE;
    END IF;
    
    -- Add current_period_end if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'current_period_end') THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_end DATE;
    END IF;
    
    -- Add trial_end if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'trial_end') THEN
        ALTER TABLE subscriptions ADD COLUMN trial_end DATE;
    END IF;
    
    -- Add cancel_at_period_end if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end') THEN
        ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add amount if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'amount') THEN
        ALTER TABLE subscriptions ADD COLUMN amount DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add currency if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'currency') THEN
        ALTER TABLE subscriptions ADD COLUMN currency VARCHAR(3) DEFAULT 'usd';
    END IF;
    
    -- Add next_billing_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'next_billing_date') THEN
        ALTER TABLE subscriptions ADD COLUMN next_billing_date DATE;
    END IF;
    
    -- Add created_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'created_at') THEN
        ALTER TABLE subscriptions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'updated_at') THEN
        ALTER TABLE subscriptions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add last_payment_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'last_payment_date') THEN
        ALTER TABLE subscriptions ADD COLUMN last_payment_date DATE;
    END IF;
    
    -- Add last_payment_amount if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'last_payment_amount') THEN
        ALTER TABLE subscriptions ADD COLUMN last_payment_amount DECIMAL(10,2);
    END IF;
    
    -- Add payment_method if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'payment_method') THEN
        ALTER TABLE subscriptions ADD COLUMN payment_method VARCHAR(255);
    END IF;
    
    -- Add billing_cycle if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'billing_cycle') THEN
        ALTER TABLE subscriptions ADD COLUMN billing_cycle VARCHAR(20) DEFAULT 'month';
    END IF;
    
    -- Add proration_enabled if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'proration_enabled') THEN
        ALTER TABLE subscriptions ADD COLUMN proration_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add dunning_enabled if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'dunning_enabled') THEN
        ALTER TABLE subscriptions ADD COLUMN dunning_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- Add notes if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'notes') THEN
        ALTER TABLE subscriptions ADD COLUMN notes TEXT;
    END IF;
    
    -- Add is_executive_account if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'is_executive_account') THEN
        ALTER TABLE subscriptions ADD COLUMN is_executive_account BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add stripe_subscription_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id VARCHAR(255);
    END IF;
    
    -- Add stripe_customer_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_customer_id VARCHAR(255);
    END IF;
    
    -- Add metadata if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'metadata') THEN
        ALTER TABLE subscriptions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_email ON subscriptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_executive_account ON subscriptions(is_executive_account);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at 
            BEFORE UPDATE ON subscriptions 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create subscription_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    notes TEXT
);

-- Create indexes for subscription events
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at);

-- Insert sample data only if table is empty
INSERT INTO subscriptions (
    customer_id, customer_name, customer_email, plan_id, plan_name, 
    status, current_period_start, current_period_end, amount, 
    payment_method, billing_cycle, is_executive_account, notes
) 
SELECT * FROM (VALUES
    ('cus_001', 'John Doe', 'john@example.com', 'premium', 'Premium Plan',
     'active', '2024-01-15', '2024-02-15', 59.99,
     'Visa ****4242', 'month', false, 'Regular customer'),
    ('cus_002', 'Jane Smith', 'jane@example.com', 'basic', 'Basic Plan',
     'trialing', '2024-01-20', '2024-02-20', 29.99,
     'Mastercard ****5555', 'month', false, 'Trial customer'),
    ('cus_003', 'Bob Johnson', 'bob@example.com', 'enterprise', 'Enterprise Plan',
     'past_due', '2024-01-10', '2024-02-10', 99.99,
     'Visa ****1234', 'month', false, 'Payment failed - card expired'),
    ('cus_004', 'Alice Brown', 'alice@example.com', 'premium', 'Premium Plan',
     'cancelled', '2024-01-01', '2024-02-01', 59.99,
     'Visa ****7890', 'month', false, 'Customer requested cancellation'),
    ('cus_005', 'Charlie Wilson', 'charlie@example.com', 'basic', 'Basic Plan',
     'paused', '2024-01-05', '2024-02-05', 29.99,
     'American Express ****1234', 'month', false, 'Temporarily paused by customer request'),
    ('cus_exec_001', 'Sarah Marketing', 'sarah@influencer.com', 'premium', 'Premium Plan',
     'active', '2024-01-01', '2025-01-01', 0.00,
     'Executive Account (Free)', 'year', true, 'Executive Account - Marketing/Free Account | Influencer partnership'),
    ('cus_exec_002', 'Mike Journalist', 'mike@finance-news.com', 'enterprise', 'Enterprise Plan',
     'active', '2024-01-15', '2025-01-15', 0.00,
     'Executive Account (Free)', 'year', true, 'Executive Account - Marketing/Free Account | Media partnership')
) AS sample_data(customer_id, customer_name, customer_email, plan_id, plan_name, status, current_period_start, current_period_end, amount, payment_method, billing_cycle, is_executive_account, notes)
WHERE NOT EXISTS (SELECT 1 FROM subscriptions LIMIT 1);

-- Create analytics view
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
    COUNT(CASE WHEN status = 'trialing' THEN 1 END) as trialing_subscriptions,
    COUNT(CASE WHEN status = 'past_due' THEN 1 END) as past_due_subscriptions,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
    COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_subscriptions,
    COUNT(CASE WHEN is_executive_account = true THEN 1 END) as executive_accounts,
    SUM(CASE WHEN status = 'active' AND billing_cycle = 'month' THEN amount ELSE 0 END) as monthly_recurring_revenue,
    SUM(CASE WHEN status = 'active' AND billing_cycle = 'year' THEN amount ELSE 0 END) as yearly_recurring_revenue,
    AVG(CASE WHEN status = 'active' AND amount > 0 THEN amount END) as average_revenue_per_user
FROM subscriptions;
