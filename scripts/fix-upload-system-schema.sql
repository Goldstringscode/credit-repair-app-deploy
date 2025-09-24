-- Fix Upload System Database Schema
-- This script ensures all required tables and columns exist for the upload system

-- Check and create missing tables
DO $$ 
BEGIN
    -- Create credit_reports table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'credit_reports') THEN
        CREATE TABLE credit_reports (
            id SERIAL PRIMARY KEY,
            user_id INTEGER DEFAULT 1,
            bureau VARCHAR(50) NOT NULL,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            file_name VARCHAR(255) NOT NULL,
            file_size INTEGER,
            file_type VARCHAR(50),
            credit_score INTEGER,
            ai_analysis JSONB,
            status VARCHAR(50) DEFAULT 'processing',
            raw_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Created credit_reports table';
    END IF;

    -- Create credit_accounts table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'credit_accounts') THEN
        CREATE TABLE credit_accounts (
            id SERIAL PRIMARY KEY,
            credit_report_id INTEGER REFERENCES credit_reports(id) ON DELETE CASCADE,
            account_name VARCHAR(255),
            account_number_last_4 VARCHAR(4),
            balance DECIMAL(12,2),
            credit_limit DECIMAL(12,2),
            payment_status VARCHAR(100),
            date_opened DATE,
            last_activity DATE,
            account_type VARCHAR(100),
            status VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Created credit_accounts table';
    END IF;

    -- Create negative_items table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'negative_items') THEN
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Created negative_items table';
    END IF;

    -- Create credit_inquiries table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'credit_inquiries') THEN
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
        RAISE NOTICE 'Created credit_inquiries table';
    END IF;

    -- Create users table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert default user if table is empty
        IF NOT EXISTS (SELECT FROM users LIMIT 1) THEN
            INSERT INTO users (email, name) VALUES ('demo@example.com', 'Demo User');
        END IF;
        RAISE NOTICE 'Created users table with default user';
    END IF;

END $$;

-- Add missing columns to existing tables (safely)
DO $$
BEGIN
    -- Add missing columns to credit_reports
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'credit_reports' AND column_name = 'bureau') THEN
        ALTER TABLE credit_reports ADD COLUMN bureau VARCHAR(50) NOT NULL DEFAULT 'unknown';
        RAISE NOTICE 'Added bureau column to credit_reports';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'credit_reports' AND column_name = 'upload_date') THEN
        ALTER TABLE credit_reports ADD COLUMN upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added upload_date column to credit_reports';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'credit_reports' AND column_name = 'raw_text') THEN
        ALTER TABLE credit_reports ADD COLUMN raw_text TEXT;
        RAISE NOTICE 'Added raw_text column to credit_reports';
    END IF;

    -- Add missing columns to credit_accounts
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'credit_accounts' AND column_name = 'account_name') THEN
        ALTER TABLE credit_accounts ADD COLUMN account_name VARCHAR(255);
        RAISE NOTICE 'Added account_name column to credit_accounts';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'credit_accounts' AND column_name = 'account_type') THEN
        ALTER TABLE credit_accounts ADD COLUMN account_type VARCHAR(100);
        RAISE NOTICE 'Added account_type column to credit_accounts';
    END IF;

    -- Add missing columns to negative_items
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'negative_items' AND column_name = 'description') THEN
        ALTER TABLE negative_items ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to negative_items';
    END IF;

END $$;

-- Create indexes for better performance (safely)
DO $$
BEGIN
    -- Index on credit_reports
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_credit_reports_user_id') THEN
        CREATE INDEX idx_credit_reports_user_id ON credit_reports(user_id);
        RAISE NOTICE 'Created index on credit_reports.user_id';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_credit_reports_bureau') THEN
        CREATE INDEX idx_credit_reports_bureau ON credit_reports(bureau);
        RAISE NOTICE 'Created index on credit_reports.bureau';
    END IF;

    -- Only create status index if the column exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'credit_reports' AND column_name = 'status') THEN
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_credit_reports_status') THEN
            CREATE INDEX idx_credit_reports_status ON credit_reports(status);
            RAISE NOTICE 'Created index on credit_reports.status';
        END IF;
    END IF;

    -- Index on credit_accounts
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_credit_accounts_report_id') THEN
        CREATE INDEX idx_credit_accounts_report_id ON credit_accounts(credit_report_id);
        RAISE NOTICE 'Created index on credit_accounts.credit_report_id';
    END IF;

    -- Index on negative_items
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_negative_items_report_id') THEN
        CREATE INDEX idx_negative_items_report_id ON negative_items(credit_report_id);
        RAISE NOTICE 'Created index on negative_items.credit_report_id';
    END IF;

    -- Index on credit_inquiries
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_credit_inquiries_report_id') THEN
        CREATE INDEX idx_credit_inquiries_report_id ON credit_inquiries(credit_report_id);
        RAISE NOTICE 'Created index on credit_inquiries.credit_report_id';
    END IF;

END $$;

-- Verify schema
SELECT 'Schema Verification Complete' as status;

-- Show current table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('credit_reports', 'credit_accounts', 'negative_items', 'credit_inquiries', 'users')
ORDER BY table_name, ordinal_position;

-- Show table counts (safely)
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

-- Show any missing columns that might need attention
SELECT 'Missing Columns Check:' as info;
SELECT 
    t.table_name,
    c.column_name,
    c.data_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_name IN ('credit_reports', 'credit_accounts', 'negative_items', 'credit_inquiries')
AND c.column_name IS NULL
ORDER BY t.table_name;

SELECT 'Upload System Schema Fix Complete!' as status;
