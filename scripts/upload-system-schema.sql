-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS negative_items CASCADE;
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS credit_scores CASCADE;
DROP TABLE IF EXISTS credit_reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table first (no foreign key dependencies)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
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
    subscription_status VARCHAR(50) DEFAULT 'free',
    subscription_plan VARCHAR(50),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_reports table (references users)
CREATE TABLE credit_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    bureau VARCHAR(50), -- 'experian', 'equifax', 'transunion'
    report_date DATE,
    raw_text TEXT,
    processed_data JSONB,
    ai_analysis JSONB,
    status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_scores table (references credit_reports)
CREATE TABLE credit_scores (
    id SERIAL PRIMARY KEY,
    credit_report_id INTEGER NOT NULL REFERENCES credit_reports(id) ON DELETE CASCADE,
    bureau VARCHAR(50) NOT NULL, -- 'experian', 'equifax', 'transunion'
    score INTEGER,
    score_model VARCHAR(100), -- 'FICO 8', 'VantageScore 3.0', etc.
    score_date DATE,
    score_factors TEXT[], -- Array of factors affecting the score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_accounts table (references credit_reports)
CREATE TABLE credit_accounts (
    id SERIAL PRIMARY KEY,
    credit_report_id INTEGER NOT NULL REFERENCES credit_reports(id) ON DELETE CASCADE,
    account_name VARCHAR(255),
    account_number VARCHAR(100),
    account_type VARCHAR(100), -- 'Credit Card', 'Mortgage', 'Auto Loan', etc.
    creditor_name VARCHAR(255),
    account_status VARCHAR(100), -- 'Open', 'Closed', 'Paid', etc.
    payment_status VARCHAR(100), -- 'Current', 'Late 30', 'Late 60', etc.
    balance DECIMAL(12, 2),
    credit_limit DECIMAL(12, 2),
    high_balance DECIMAL(12, 2),
    monthly_payment DECIMAL(10, 2),
    date_opened DATE,
    date_closed DATE,
    last_payment_date DATE,
    date_of_last_activity DATE,
    utilization_rate DECIMAL(5, 2), -- Calculated percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create negative_items table (references credit_reports)
CREATE TABLE negative_items (
    id SERIAL PRIMARY KEY,
    credit_report_id INTEGER NOT NULL REFERENCES credit_reports(id) ON DELETE CASCADE,
    item_type VARCHAR(100), -- 'Late Payment', 'Collection', 'Charge Off', etc.
    creditor_name VARCHAR(255),
    account_number VARCHAR(100),
    amount DECIMAL(12, 2),
    date_reported DATE,
    date_of_first_delinquency DATE,
    status VARCHAR(100),
    description TEXT,
    dispute_status VARCHAR(50) DEFAULT 'not_disputed', -- 'not_disputed', 'disputed', 'resolved'
    dispute_date DATE,
    dispute_result VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_credit_reports_user_id ON credit_reports(user_id);
CREATE INDEX idx_credit_reports_bureau ON credit_reports(bureau);
CREATE INDEX idx_credit_reports_status ON credit_reports(status);
CREATE INDEX idx_credit_scores_report_id ON credit_scores(credit_report_id);
CREATE INDEX idx_credit_accounts_report_id ON credit_accounts(credit_report_id);
CREATE INDEX idx_negative_items_report_id ON negative_items(credit_report_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

-- Insert a test user for development
INSERT INTO users (
    email, 
    first_name, 
    last_name, 
    subscription_status,
    created_at
) VALUES (
    'test@example.com',
    'Test',
    'User',
    'premium',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_reports_updated_at BEFORE UPDATE ON credit_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the schema was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'credit_reports', 'credit_scores', 'credit_accounts', 'negative_items')
ORDER BY table_name, ordinal_position;
