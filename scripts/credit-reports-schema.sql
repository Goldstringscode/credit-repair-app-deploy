-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    ssn_last_four VARCHAR(4),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Reports table
CREATE TABLE IF NOT EXISTS credit_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bureau VARCHAR(50) NOT NULL, -- 'experian', 'equifax', 'transunion'
    report_date DATE NOT NULL,
    credit_score INTEGER,
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50),
    raw_text TEXT,
    processed_data JSONB,
    ai_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Accounts table
CREATE TABLE IF NOT EXISTS credit_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_report_id UUID REFERENCES credit_reports(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100),
    account_type VARCHAR(50), -- 'credit_card', 'mortgage', 'auto_loan', etc.
    creditor_name VARCHAR(255),
    account_status VARCHAR(50), -- 'open', 'closed', 'charged_off', etc.
    balance DECIMAL(12,2),
    credit_limit DECIMAL(12,2),
    payment_status VARCHAR(50),
    date_opened DATE,
    date_closed DATE,
    last_payment_date DATE,
    payment_history JSONB,
    negative_items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Negative Items table
CREATE TABLE IF NOT EXISTS negative_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_report_id UUID REFERENCES credit_reports(id) ON DELETE CASCADE,
    credit_account_id UUID REFERENCES credit_accounts(id) ON DELETE CASCADE,
    item_type VARCHAR(100) NOT NULL, -- 'late_payment', 'charge_off', 'collection', etc.
    description TEXT,
    date_reported DATE,
    amount DECIMAL(12,2),
    status VARCHAR(50), -- 'active', 'disputed', 'removed', 'verified'
    dispute_eligible BOOLEAN DEFAULT true,
    dispute_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispute Letters table
CREATE TABLE IF NOT EXISTS dispute_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    negative_item_id UUID REFERENCES negative_items(id) ON DELETE CASCADE,
    letter_type VARCHAR(100) NOT NULL,
    bureau VARCHAR(50) NOT NULL,
    letter_content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'response_received'
    sent_date DATE,
    response_date DATE,
    response_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_reports_user_id ON credit_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_reports_bureau ON credit_reports(bureau);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_report_id ON credit_accounts(credit_report_id);
CREATE INDEX IF NOT EXISTS idx_negative_items_report_id ON negative_items(credit_report_id);
CREATE INDEX IF NOT EXISTS idx_negative_items_account_id ON negative_items(credit_account_id);
CREATE INDEX IF NOT EXISTS idx_dispute_letters_user_id ON dispute_letters(user_id);

-- Insert sample data for testing
INSERT INTO users (id, email, first_name, last_name, phone, subscription_tier) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'John', 'Doe', '555-0123', 'premium'),
('550e8400-e29b-41d4-a716-446655440001', 'jane@example.com', 'Jane', 'Smith', '555-0124', 'free')
ON CONFLICT (email) DO NOTHING;

-- Insert sample credit report
INSERT INTO credit_reports (id, user_id, bureau, report_date, credit_score, file_name, raw_text, ai_analysis) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'experian', CURRENT_DATE, 720, 'sample_report.pdf', 
'Sample credit report text content...', 
'{"summary": "Good credit profile with room for improvement", "recommendations": ["Pay down credit card balances", "Dispute inaccurate late payments"], "score_factors": ["High credit utilization", "Recent late payment"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert sample credit account
INSERT INTO credit_accounts (id, credit_report_id, account_name, account_type, creditor_name, account_status, balance, credit_limit, payment_status) VALUES
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Chase Freedom', 'credit_card', 'Chase Bank', 'open', 2500.00, 5000.00, 'current')
ON CONFLICT (id) DO NOTHING;

-- Insert sample negative item
INSERT INTO negative_items (id, credit_report_id, credit_account_id, item_type, description, date_reported, amount, status) VALUES
('880e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'late_payment', '30 days late payment', '2024-01-15', 50.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- Verify the setup
SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Credit Reports', COUNT(*) FROM credit_reports
UNION ALL
SELECT 'Credit Accounts', COUNT(*) FROM credit_accounts
UNION ALL
SELECT 'Negative Items', COUNT(*) FROM negative_items
UNION ALL
SELECT 'Dispute Letters', COUNT(*) FROM dispute_letters;
