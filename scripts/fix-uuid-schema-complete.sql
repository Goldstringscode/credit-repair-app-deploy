-- Complete UUID Schema Fix - Fix All Tables
-- This script fixes the entire database schema to use UUIDs consistently
-- WARNING: This will delete all existing data in these tables

-- First, drop all existing tables to start fresh
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS credit_negative_items CASCADE;
DROP TABLE IF EXISTS credit_inquiries CASCADE;
DROP TABLE IF EXISTS credit_scores CASCADE;
DROP TABLE IF EXISTS credit_reports CASCADE;

-- Recreate credit_reports table with UUID primary key
-- This matches exactly what the application code expects
CREATE TABLE credit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100), -- Changed from UUID to VARCHAR to match 'user-123'
    bureau VARCHAR(100), -- This was missing!
    report_date DATE DEFAULT CURRENT_DATE,
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(100),
    credit_score INTEGER,
    ai_analysis TEXT, -- JSON string
    processing_status VARCHAR(100) DEFAULT 'completed',
    raw_text TEXT,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create credit_scores table for storing credit scores separately
CREATE TABLE credit_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL,
    bureau VARCHAR(100) NOT NULL,
    score INTEGER NOT NULL,
    score_model VARCHAR(100),
    date_generated VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Recreate credit_accounts table with UUID foreign key
-- This matches exactly what the application code expects
CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL,
    account_type VARCHAR(100),
    creditor_name VARCHAR(255), -- Changed from 'creditor' to match app
    account_number_last_4 VARCHAR(4), -- Changed to match app
    balance DECIMAL(15,2),
    credit_limit DECIMAL(15,2),
    payment_status VARCHAR(100),
    opened_date VARCHAR(100), -- Changed from 'date_opened' to match app
    last_activity VARCHAR(100), -- This was missing!
    months_reviewed INTEGER,
    bureau VARCHAR(100),
    confidence DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_report_id) REFERENCES credit_reports(id) ON DELETE CASCADE
);

-- Recreate credit_negative_items table with UUID foreign key
-- This matches exactly what the application code expects
CREATE TABLE credit_negative_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL,
    item_type VARCHAR(100), -- Changed from 'type' to match app
    creditor_name VARCHAR(255), -- Changed from 'creditor' to match app
    account_number_last_4 VARCHAR(4), -- Changed to match app
    status VARCHAR(100),
    balance DECIMAL(15,2),
    original_amount DECIMAL(15,2),
    date_reported VARCHAR(100),
    notes TEXT, -- Changed from 'dispute_recommendation' to match app
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

-- Create indexes for better performance
CREATE INDEX idx_credit_scores_report_id ON credit_scores(credit_report_id);
CREATE INDEX idx_credit_accounts_report_id ON credit_accounts(credit_report_id);
CREATE INDEX idx_credit_negative_items_report_id ON credit_negative_items(credit_report_id);
CREATE INDEX idx_credit_inquiries_report_id ON credit_inquiries(credit_report_id);

-- Verify the new schema
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('credit_reports', 'credit_scores', 'credit_accounts', 'credit_negative_items', 'credit_inquiries')
  AND column_name IN ('id', 'credit_report_id', 'bureau', 'creditor_name', 'account_number_last_4', 'last_activity')
ORDER BY table_name, column_name;

-- Verify foreign key constraints
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('credit_scores', 'credit_accounts', 'credit_negative_items', 'credit_inquiries');

-- Success message
SELECT 'Complete UUID schema fix applied successfully! All tables recreated with proper UUID types and matching application columns.' as status;
