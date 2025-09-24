-- Simple migration to fix all database issues
-- Run this script in your Neon SQL Editor

-- Drop all tables and recreate them cleanly
DROP TABLE IF EXISTS credit_inquiries CASCADE;
DROP TABLE IF EXISTS negative_items CASCADE;
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS credit_reports CASCADE;

-- Create credit_reports table first (parent table)
CREATE TABLE credit_reports (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    bureau VARCHAR(50) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    credit_score INTEGER,
    ai_analysis JSONB,
    processed_data JSONB,
    raw_text TEXT
);

-- Create credit_accounts table with all required columns
CREATE TABLE credit_accounts (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255),
    account_number_last_4 VARCHAR(4),
    account_type VARCHAR(100) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    credit_limit DECIMAL(10,2),
    payment_status VARCHAR(50),
    payment_history TEXT,
    account_status VARCHAR(50),
    date_opened DATE,
    last_payment_date DATE,
    creditor_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Create credit_inquiries table
CREATE TABLE credit_inquiries (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL,
    creditor_name VARCHAR(255) NOT NULL,
    inquiry_date DATE NOT NULL,
    inquiry_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Create negative_items table
CREATE TABLE negative_items (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL,
    item_type VARCHAR(100) NOT NULL,
    creditor_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2),
    date_reported DATE,
    status VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Insert sample data for testing
INSERT INTO credit_reports (user_id, file_name, file_size, bureau, credit_score) VALUES
('user123', 'sample_report.pdf', 1024000, 'Experian', 720);

-- Verify tables were created successfully
SELECT 'Migration completed successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('credit_reports', 'credit_accounts', 'credit_inquiries', 'negative_items')
ORDER BY table_name;
