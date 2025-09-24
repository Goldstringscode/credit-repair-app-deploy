-- Complete Credit Report System Database Schema
-- This script creates all tables needed for the enhanced credit report analysis system

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS credit_inquiries CASCADE;
DROP TABLE IF EXISTS credit_negative_items CASCADE;
DROP TABLE IF EXISTS credit_accounts CASCADE;
DROP TABLE IF EXISTS credit_reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_reports table with enhanced fields
CREATE TABLE credit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL DEFAULT 'user-123',
    
    -- File information
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    
    -- Bureau and report information
    bureau VARCHAR(50) NOT NULL DEFAULT 'unknown',
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    report_number VARCHAR(100),
    
    -- Credit scores by bureau
    experian_score INTEGER CHECK (experian_score >= 300 AND experian_score <= 850),
    equifax_score INTEGER CHECK (equifax_score >= 300 AND equifax_score <= 850),
    transunion_score INTEGER CHECK (transunion_score >= 300 AND transunion_score <= 850),
    credit_score INTEGER CHECK (credit_score >= 300 AND credit_score <= 850), -- Primary score
    score_date DATE,
    
    -- Analysis data
    ai_analysis JSONB,
    raw_text TEXT,
    processing_status VARCHAR(50) DEFAULT 'pending',
    
    -- Analysis metadata
    confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    data_completeness DECIMAL(3,2) DEFAULT 0.3 CHECK (data_completeness >= 0 AND data_completeness <= 1),
    extraction_method VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_accounts table
CREATE TABLE credit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL REFERENCES credit_reports(id) ON DELETE CASCADE,
    
    -- Account identification
    account_type VARCHAR(100) NOT NULL,
    creditor_name VARCHAR(255) NOT NULL,
    account_number_last_4 VARCHAR(4),
    
    -- Account status and details
    account_status VARCHAR(50) DEFAULT 'Unknown',
    balance DECIMAL(12,2),
    credit_limit DECIMAL(12,2),
    original_amount DECIMAL(12,2),
    monthly_payment DECIMAL(10,2),
    
    -- Payment information
    payment_status VARCHAR(50) DEFAULT 'Unknown',
    payment_history TEXT,
    
    -- Dates
    opened_date DATE,
    closed_date DATE,
    last_activity DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_negative_items table
CREATE TABLE credit_negative_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL REFERENCES credit_reports(id) ON DELETE CASCADE,
    
    -- Item identification
    item_type VARCHAR(100) NOT NULL,
    creditor_name VARCHAR(255) NOT NULL,
    account_number_last_4 VARCHAR(4),
    
    -- Item details
    status VARCHAR(50) NOT NULL,
    balance DECIMAL(12,2),
    original_amount DECIMAL(12,2),
    
    -- Important dates
    date_opened DATE,
    date_of_first_delinquency DATE,
    date_reported DATE,
    estimated_removal_date DATE,
    
    -- Additional information
    dispute_status VARCHAR(50) DEFAULT 'Not Disputed',
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_inquiries table
CREATE TABLE credit_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_report_id UUID NOT NULL REFERENCES credit_reports(id) ON DELETE CASCADE,
    
    -- Inquiry details
    creditor_name VARCHAR(255) NOT NULL,
    inquiry_date DATE NOT NULL,
    inquiry_type VARCHAR(20) DEFAULT 'unknown' CHECK (inquiry_type IN ('hard', 'soft', 'unknown')),
    
    -- Additional information
    purpose VARCHAR(100),
    dispute_status VARCHAR(50) DEFAULT 'Not Disputed',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_credit_reports_user_id ON credit_reports(user_id);
CREATE INDEX idx_credit_reports_bureau ON credit_reports(bureau);
CREATE INDEX idx_credit_reports_created_at ON credit_reports(created_at);

CREATE INDEX idx_credit_accounts_report_id ON credit_accounts(credit_report_id);
CREATE INDEX idx_credit_accounts_creditor ON credit_accounts(creditor_name);

CREATE INDEX idx_negative_items_report_id ON credit_negative_items(credit_report_id);
CREATE INDEX idx_negative_items_type ON credit_negative_items(item_type);

CREATE INDEX idx_inquiries_report_id ON credit_inquiries(credit_report_id);
CREATE INDEX idx_inquiries_date ON credit_inquiries(inquiry_date);

-- Create a view for easy dashboard queries
CREATE OR REPLACE VIEW credit_report_summary AS
SELECT 
    cr.id,
    cr.user_id,
    cr.file_name,
    cr.bureau,
    cr.report_date,
    cr.experian_score,
    cr.equifax_score,
    cr.transunion_score,
    cr.credit_score,
    cr.confidence_score,
    cr.data_completeness,
    cr.created_at,
    
    -- Account statistics
    COUNT(DISTINCT ca.id) as total_accounts,
    COALESCE(SUM(ca.balance), 0) as total_balance,
    COALESCE(SUM(ca.credit_limit), 0) as total_credit_limit,
    
    -- Negative items count
    COUNT(DISTINCT cni.id) as negative_items_count,
    
    -- Inquiries count
    COUNT(DISTINCT ci.id) as inquiries_count,
    
    -- Credit utilization calculation
    CASE 
        WHEN SUM(ca.credit_limit) > 0 THEN 
            ROUND((SUM(ca.balance) / SUM(ca.credit_limit) * 100)::numeric, 2)
        ELSE NULL 
    END as credit_utilization_percentage

FROM credit_reports cr
LEFT JOIN credit_accounts ca ON cr.id = ca.credit_report_id
LEFT JOIN credit_negative_items cni ON cr.id = cni.credit_report_id
LEFT JOIN credit_inquiries ci ON cr.id = ci.credit_report_id
GROUP BY cr.id, cr.user_id, cr.file_name, cr.bureau, cr.report_date, 
         cr.experian_score, cr.equifax_score, cr.transunion_score, 
         cr.credit_score, cr.confidence_score, cr.data_completeness, cr.created_at;

-- Insert sample user for testing
INSERT INTO users (id, email, name) VALUES 
('user-123', 'test@example.com', 'Test User')
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Credit Report System Database Schema Created Successfully!' as status;
