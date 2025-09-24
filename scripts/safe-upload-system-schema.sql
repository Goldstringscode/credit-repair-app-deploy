-- Safe Upload System Database Schema
-- This script safely creates tables without causing column errors

-- Drop existing tables if they exist (be careful in production)
-- Uncomment the next lines if you want to start fresh
-- DROP TABLE IF EXISTS credit_inquiries CASCADE;
-- DROP TABLE IF EXISTS negative_items CASCADE;
-- DROP TABLE IF EXISTS credit_accounts CASCADE;
-- DROP TABLE IF EXISTS credit_reports CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table with better ID handling
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_reports table with all required columns
CREATE TABLE IF NOT EXISTS credit_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER DEFAULT 1,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    bureau VARCHAR(50) DEFAULT 'unknown',
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'processing',
    raw_text TEXT,
    processed_data JSONB,
    ai_analysis JSONB,
    credit_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_accounts table with all required columns
CREATE TABLE IF NOT EXISTS credit_accounts (
    id SERIAL PRIMARY KEY,
    credit_report_id INTEGER REFERENCES credit_reports(id) ON DELETE CASCADE,
    account_name VARCHAR(255),
    account_number VARCHAR(255),
    account_number_last_4 VARCHAR(4),
    account_type VARCHAR(100),
    balance DECIMAL(12,2),
    credit_limit DECIMAL(12,2),
    payment_status VARCHAR(100),
    payment_history TEXT,
    date_opened DATE,
    last_activity DATE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create negative_items table
CREATE TABLE IF NOT EXISTS negative_items (
    id SERIAL PRIMARY KEY,
    credit_report_id INTEGER REFERENCES credit_reports(id) ON DELETE CASCADE,
    item_type VARCHAR(100),
    creditor_name VARCHAR(255),
    account_number VARCHAR(255),
    amount DECIMAL(12,2),
    date_reported DATE,
    status VARCHAR(100),
    description TEXT,
    dispute_status VARCHAR(50) DEFAULT 'not_disputed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_inquiries table
CREATE TABLE IF NOT EXISTS credit_inquiries (
    id SERIAL PRIMARY KEY,
    credit_report_id INTEGER REFERENCES credit_reports(id) ON DELETE CASCADE,
    inquiry_type VARCHAR(50),
    creditor_name VARCHAR(255),
    inquiry_date DATE,
    purpose VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample user if table is empty (with better error handling)
DO $$
BEGIN
    -- Only insert if no users exist
    IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
        INSERT INTO users (email, name) VALUES ('demo@example.com', 'Demo User');
        RAISE NOTICE 'Inserted demo user';
    ELSE
        RAISE NOTICE 'Users table already has data, skipping demo user insertion';
    END IF;
END $$;

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_reports_user_id ON credit_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_reports_bureau ON credit_reports(bureau);
CREATE INDEX IF NOT EXISTS idx_credit_reports_status ON credit_reports(status);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_report_id ON credit_accounts(credit_report_id);
CREATE INDEX IF NOT EXISTS idx_negative_items_report_id ON negative_items(credit_report_id);
CREATE INDEX IF NOT EXISTS idx_credit_inquiries_report_id ON credit_inquiries(credit_report_id);

-- Verify the schema
SELECT 'Schema Creation Complete!' as status;

-- Show table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('credit_reports', 'credit_accounts', 'negative_items', 'credit_inquiries', 'users')
ORDER BY table_name, ordinal_position;

-- Show table counts
SELECT 'Table Counts:' as info;
SELECT 'credit_reports' as table_name, COUNT(*) as count FROM credit_reports
UNION ALL
SELECT 'credit_accounts' as table_name, COUNT(*) as count FROM credit_accounts
UNION ALL
SELECT 'negative_items' as table_name, COUNT(*) as count FROM negative_items
UNION ALL
SELECT 'credit_inquiries' as table_name, COUNT(*) as count FROM credit_inquiries
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users;

-- Show existing users to verify
SELECT 'Existing Users:' as info;
SELECT id, email, name, created_at FROM users ORDER BY id;

SELECT 'Safe Upload System Schema Complete!' as status;
