-- Final database fix to match the upload API exactly
-- Run this script in your Neon SQL Editor

-- Drop all tables and recreate them to match the API expectations
DROP TABLE IF EXISTS credit_inquiries CASCADE;
DROP TABLE IF EXISTS negative_items CASCADE;
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS credit_reports CASCADE;

-- Create credit_reports table with exact columns the API expects
CREATE TABLE credit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    bureau VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    processing_status VARCHAR(50) DEFAULT 'pending',
    credit_score INTEGER,
    ai_analysis JSONB,
    raw_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_accounts table with exact columns the API expects
CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    creditor_name VARCHAR(255) NOT NULL,
    account_number_last_4 VARCHAR(4),
    account_type VARCHAR(100) NOT NULL,
    account_status VARCHAR(50) NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0,
    credit_limit DECIMAL(12,2),
    payment_history TEXT,
    date_opened DATE,
    last_payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Create negative_items table with exact columns the API expects
CREATE TABLE negative_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL,
    item_type VARCHAR(100) NOT NULL,
    creditor_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date_reported DATE,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Create credit_inquiries table with exact columns the API expects
CREATE TABLE credit_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL,
    creditor_name VARCHAR(255) NOT NULL,
    inquiry_date DATE NOT NULL,
    inquiry_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_credit_reports_user_id ON credit_reports(user_id);
CREATE INDEX idx_credit_reports_bureau ON credit_reports(bureau);
CREATE INDEX idx_credit_accounts_report_id ON credit_accounts(credit_report_id);
CREATE INDEX idx_negative_items_report_id ON negative_items(credit_report_id);
CREATE INDEX idx_credit_inquiries_report_id ON credit_inquiries(credit_report_id);

-- Verify tables were created successfully
SELECT 'Database schema fixed successfully!' as status;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('credit_reports', 'credit_accounts', 'credit_inquiries', 'negative_items')
ORDER BY table_name, ordinal_position;
