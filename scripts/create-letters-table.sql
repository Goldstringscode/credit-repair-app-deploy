-- Create letters table for storing AI-generated dispute letters
-- This table will store all generated letters with metadata

CREATE TABLE IF NOT EXISTS letters (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    dispute_id VARCHAR(255),
    letter_type VARCHAR(100) NOT NULL, -- 'standard', 'enhanced', 'premium', 'attorney'
    recipient VARCHAR(255) NOT NULL, -- Credit bureau name
    recipient_address TEXT,
    letter_content TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_date DATE,
    tracking_number VARCHAR(100),
    delivery_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    
    -- AI-generated metadata
    quality_score DECIMAL(3,2),
    legal_compliance JSONB, -- Array of compliance items
    customization_level VARCHAR(50), -- 'Standard', 'Medium', 'High'
    dispute_strategy JSONB, -- Full dispute strategy object
    success_probability DECIMAL(3,2),
    expected_timeline VARCHAR(100),
    uniqueness_score DECIMAL(3,2),
    personalization_level VARCHAR(50),
    writing_style VARCHAR(100),
    
    -- Additional context
    personal_info JSONB,
    dispute_items JSONB,
    additional_context JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create disputes table for tracking dispute history
CREATE TABLE IF NOT EXISTS disputes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    credit_report_id INTEGER REFERENCES credit_reports(id) ON DELETE SET NULL,
    dispute_type VARCHAR(100) NOT NULL,
    account_name VARCHAR(255),
    account_number VARCHAR(100),
    dispute_reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'submitted', 'investigating', 'resolved', 'rejected'
    bureau VARCHAR(50) NOT NULL,
    submitted_date DATE,
    expected_resolution_date DATE,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON letters(user_id);
CREATE INDEX IF NOT EXISTS idx_letters_dispute_id ON letters(dispute_id);
CREATE INDEX IF NOT EXISTS idx_letters_letter_type ON letters(letter_type);
CREATE INDEX IF NOT EXISTS idx_letters_generated_at ON letters(generated_at);
CREATE INDEX IF NOT EXISTS idx_letters_quality_score ON letters(quality_score);
CREATE INDEX IF NOT EXISTS idx_letters_uniqueness_score ON letters(uniqueness_score);

CREATE INDEX IF NOT EXISTS idx_disputes_user_id ON disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_bureau ON disputes(bureau);
CREATE INDEX IF NOT EXISTS idx_disputes_type ON disputes(dispute_type);

-- Create user_usage table for tracking feature usage
CREATE TABLE IF NOT EXISTS user_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    feature VARCHAR(100) NOT NULL, -- 'letter_generation', 'dispute_creation', 'credit_monitoring'
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    month_year VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, feature, month_year)
);

-- Insert sample data for testing
INSERT INTO user_usage (user_id, feature, usage_count, month_year) 
VALUES ('user-123', 'letter_generation', 0, '2024-01')
ON CONFLICT (user_id, feature, month_year) DO NOTHING;

-- Verify the schema
SELECT 'Letters table schema created successfully!' as status;

-- Show table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('letters', 'disputes', 'user_usage')
ORDER BY table_name, ordinal_position;
