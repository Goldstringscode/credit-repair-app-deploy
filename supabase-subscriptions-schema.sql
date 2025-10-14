-- Subscription Management Database Schema
-- This schema supports the full subscription lifecycle including executive accounts

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
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

-- Create indexes for better performance
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

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create subscription_events table for audit trail
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'paused', 'resumed', 'cancelled', 'payment_failed', etc.
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255), -- admin user who performed the action
    notes TEXT
);

-- Create index for subscription events
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at);

-- Insert some sample data for testing
INSERT INTO subscriptions (
    customer_id, customer_name, customer_email, plan_id, plan_name, 
    status, current_period_start, current_period_end, amount, 
    payment_method, billing_cycle, is_executive_account, notes
) VALUES 
(
    'cus_001', 'John Doe', 'john@example.com', 'premium', 'Premium Plan',
    'active', '2024-01-15', '2024-02-15', 59.99,
    'Visa ****4242', 'month', false, 'Regular customer'
),
(
    'cus_002', 'Jane Smith', 'jane@example.com', 'basic', 'Basic Plan',
    'trialing', '2024-01-20', '2024-02-20', 29.99,
    'Mastercard ****5555', 'month', false, 'Trial customer'
),
(
    'cus_003', 'Bob Johnson', 'bob@example.com', 'enterprise', 'Enterprise Plan',
    'past_due', '2024-01-10', '2024-02-10', 99.99,
    'Visa ****1234', 'month', false, 'Payment failed - card expired'
),
(
    'cus_004', 'Alice Brown', 'alice@example.com', 'premium', 'Premium Plan',
    'cancelled', '2024-01-01', '2024-02-01', 59.99,
    'Visa ****7890', 'month', false, 'Customer requested cancellation'
),
(
    'cus_005', 'Charlie Wilson', 'charlie@example.com', 'basic', 'Basic Plan',
    'paused', '2024-01-05', '2024-02-05', 29.99,
    'American Express ****1234', 'month', false, 'Temporarily paused by customer request'
),
(
    'cus_exec_001', 'Sarah Marketing', 'sarah@influencer.com', 'premium', 'Premium Plan',
    'active', '2024-01-01', '2025-01-01', 0.00,
    'Executive Account (Free)', 'year', true, 'Executive Account - Marketing/Free Account | Influencer partnership'
),
(
    'cus_exec_002', 'Mike Journalist', 'mike@finance-news.com', 'enterprise', 'Enterprise Plan',
    'active', '2024-01-15', '2025-01-15', 0.00,
    'Executive Account (Free)', 'year', true, 'Executive Account - Marketing/Free Account | Media partnership'
)
ON CONFLICT DO NOTHING;

-- Create a view for subscription analytics
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

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL ON subscriptions TO your_app_user;
-- GRANT ALL ON subscription_events TO your_app_user;
-- GRANT SELECT ON subscription_analytics TO your_app_user;
