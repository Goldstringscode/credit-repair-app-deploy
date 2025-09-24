-- Fix Monitoring Database Schema
-- This script adds any missing columns needed for the monitoring system

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_reports' AND column_name = 'status'
    ) THEN
        ALTER TABLE credit_reports ADD COLUMN status VARCHAR(50) DEFAULT 'processing';
    END IF;
END $$;

-- Add confidence_score column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_reports' AND column_name = 'confidence_score'
    ) THEN
        ALTER TABLE credit_reports ADD COLUMN confidence_score DECIMAL(3,2);
    END IF;
END $$;

-- Add data_completeness column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credit_reports' AND column_name = 'data_completeness'
    ) THEN
        ALTER TABLE credit_reports ADD COLUMN data_completeness DECIMAL(3,2);
    END IF;
END $$;

-- Verify the schema
SELECT 'Schema Fix Complete!' as status;

-- Show current table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'credit_reports'
ORDER BY ordinal_position;
