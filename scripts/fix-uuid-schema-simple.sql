-- Simple UUID Schema Fix - Drop and Recreate Tables
-- This approach completely recreates the tables with the correct UUID schema
-- WARNING: This will delete all existing data in these tables

-- Drop existing tables (this will also drop foreign key constraints)
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS credit_negative_items CASCADE;
DROP TABLE IF EXISTS credit_inquiries CASCADE;

-- Recreate credit_accounts table with UUID foreign key
CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    account_number VARCHAR(100),
    account_type VARCHAR(100),
    balance DECIMAL(15,2),
    credit_limit DECIMAL(15,2),
    payment_status VARCHAR(100),
    months_reviewed INTEGER,
    date_opened VARCHAR(100),
    last_activity VARCHAR(100),
    bureau VARCHAR(100),
    confidence DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Recreate credit_negative_items table with UUID foreign key
CREATE TABLE credit_negative_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL,
    type VARCHAR(100) NOT NULL,
    creditor VARCHAR(255),
    description TEXT,
    amount DECIMAL(15,2),
    date_reported VARCHAR(100),
    status VARCHAR(100),
    bureau VARCHAR(100),
    confidence DECIMAL(3,2),
    dispute_recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Recreate credit_inquiries table with UUID foreign key
CREATE TABLE credit_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL,
    creditor VARCHAR(255),
    inquiry_date VARCHAR(100),
    bureau VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Verify the new schema
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('credit_accounts', 'credit_negative_items', 'credit_inquiries')
  AND column_name = 'credit_report_id'
ORDER BY table_name;

-- Success message
SELECT 'Tables recreated with UUID schema successfully! All data has been cleared.' as status;
