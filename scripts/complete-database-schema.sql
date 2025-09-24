-- Complete Credit Repair AI Database Schema
-- Run this entire script in your Neon SQL Editor

-- Drop existing tables if they exist (be careful in production)
DROP TABLE IF EXISTS credit_inquiries CASCADE;
DROP TABLE IF EXISTS negative_items CASCADE;
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS credit_reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_reports table with all required columns
CREATE TABLE credit_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    bureau VARCHAR(50) NOT NULL,
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
CREATE TABLE credit_accounts (
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
CREATE TABLE negative_items (
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
CREATE TABLE credit_inquiries (
    id SERIAL PRIMARY KEY,
    credit_report_id INTEGER REFERENCES credit_reports(id) ON DELETE CASCADE,
    inquiry_type VARCHAR(50),
    creditor_name VARCHAR(255),
    inquiry_date DATE,
    purpose VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample user
INSERT INTO users (email, name) VALUES 
('demo@example.com', 'Demo User');

-- Insert sample credit report
INSERT INTO credit_reports (
    user_id, 
    file_name, 
    file_size, 
    file_type, 
    bureau, 
    status, 
    credit_score,
    ai_analysis
) VALUES (
    1, 
    'sample_report.pdf', 
    1024000, 
    'application/pdf', 
    'experian', 
    'completed', 
    650,
    '{"summary": "Sample analysis", "recommendations": ["Pay down credit cards", "Dispute inaccurate items"]}'
);

-- Insert sample credit accounts
INSERT INTO credit_accounts (
    credit_report_id,
    account_name,
    account_number,
    account_number_last_4,
    account_type,
    balance,
    credit_limit,
    payment_status,
    payment_history,
    date_opened,
    status
) VALUES 
(1, 'Chase Freedom', 'XXXX-XXXX-XXXX-1234', '1234', 'Credit Card', 2500.00, 5000.00, 'Current', 'On time', '2020-01-15', 'Open'),
(1, 'Capital One Venture', 'XXXX-XXXX-XXXX-5678', '5678', 'Credit Card', 1200.00, 3000.00, 'Current', 'On time', '2019-06-20', 'Open');

-- Insert sample negative items
INSERT INTO negative_items (
    credit_report_id,
    item_type,
    creditor_name,
    account_number,
    amount,
    date_reported,
    status,
    description
) VALUES 
(1, 'Late Payment', 'ABC Bank', 'XXXX-1111', 150.00, '2023-03-15', 'Verified', '30 days late payment'),
(1, 'Collection', 'XYZ Collections', 'COLL-2222', 500.00, '2023-01-10', 'Unverified', 'Medical collection account');

-- Insert sample inquiries
INSERT INTO credit_inquiries (
    credit_report_id,
    inquiry_type,
    creditor_name,
    inquiry_date,
    purpose
) VALUES 
(1, 'Hard', 'Auto Loan Company', '2023-05-20', 'Auto loan application'),
(1, 'Soft', 'Credit Monitoring Service', '2023-06-01', 'Account review');

-- Create indexes for better performance
CREATE INDEX idx_credit_reports_user_id ON credit_reports(user_id);
CREATE INDEX idx_credit_reports_bureau ON credit_reports(bureau);
CREATE INDEX idx_credit_accounts_report_id ON credit_accounts(credit_report_id);
CREATE INDEX idx_negative_items_report_id ON negative_items(credit_report_id);
CREATE INDEX idx_credit_inquiries_report_id ON credit_inquiries(credit_report_id);

-- Verify the setup
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as report_count FROM credit_reports;
SELECT COUNT(*) as account_count FROM credit_accounts;
SELECT COUNT(*) as negative_item_count FROM negative_items;
SELECT COUNT(*) as inquiry_count FROM credit_inquiries;
