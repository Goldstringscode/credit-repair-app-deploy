-- Credit Reports Database Setup Script
-- Run this in your Supabase SQL Editor

-- Negative Items Table
CREATE TABLE IF NOT EXISTS negative_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    current_balance DECIMAL(10,2) NOT NULL,
    date_opened DATE NOT NULL,
    date_reported DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Open', 'Closed', 'Charged Off', 'In Collections')),
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('Late Payment', 'Collection', 'Charge Off', 'Bankruptcy', 'Lien', 'Judgment', 'Other')),
    dispute_reason TEXT NOT NULL,
    notes TEXT,
    is_disputed BOOLEAN DEFAULT FALSE,
    dispute_date TIMESTAMP WITH TIME ZONE,
    resolution_status VARCHAR(20) CHECK (resolution_status IN ('Pending', 'Resolved', 'Rejected', 'In Progress')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Scores Table
CREATE TABLE IF NOT EXISTS credit_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    bureau VARCHAR(20) NOT NULL CHECK (bureau IN ('Experian', 'Equifax', 'TransUnion')),
    score INTEGER NOT NULL CHECK (score >= 300 AND score <= 850),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_negative_items_user_id ON negative_items(user_id);
CREATE INDEX IF NOT EXISTS idx_negative_items_creditor ON negative_items(creditor);
CREATE INDEX IF NOT EXISTS idx_negative_items_status ON negative_items(status);
CREATE INDEX IF NOT EXISTS idx_negative_items_item_type ON negative_items(item_type);
CREATE INDEX IF NOT EXISTS idx_negative_items_is_disputed ON negative_items(is_disputed);

CREATE INDEX IF NOT EXISTS idx_credit_scores_user_id ON credit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_bureau ON credit_scores(bureau);
CREATE INDEX IF NOT EXISTS idx_credit_scores_date ON credit_scores(date);

-- RLS (Row Level Security) Policies
ALTER TABLE negative_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;

-- Policy for negative_items - users can only see their own data
CREATE POLICY "Users can view their own negative items" ON negative_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own negative items" ON negative_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own negative items" ON negative_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own negative items" ON negative_items
    FOR DELETE USING (auth.uid() = user_id);

-- Policy for credit_scores - users can only see their own data
CREATE POLICY "Users can view their own credit scores" ON credit_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit scores" ON credit_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit scores" ON credit_scores
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit scores" ON credit_scores
    FOR DELETE USING (auth.uid() = user_id);

-- Sample data for testing (using a test user ID)
INSERT INTO negative_items (user_id, creditor, account_number, original_amount, current_balance, date_opened, date_reported, status, item_type, dispute_reason, notes, is_disputed, resolution_status) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Capital One', '****1234', 2500.00, 0.00, '2020-03-15', '2023-12-01', 'Closed', 'Late Payment', 'Inaccurate Information - Wrong amounts, dates, or account details', 'Account was never late, always paid on time', false, 'Pending'),
('123e4567-e89b-12d3-a456-426614174000', 'Chase Bank', '****5678', 1500.00, 1500.00, '2021-06-20', '2024-01-15', 'In Collections', 'Collection', 'Identity Theft - Account opened without authorization', 'This account was opened fraudulently', false, 'Pending'),
('123e4567-e89b-12d3-a456-426614174001', 'Discover', '****9012', 800.00, 0.00, '2019-11-10', '2023-10-30', 'Charged Off', 'Charge Off', 'Paid in Full - Account was paid but not updated', 'Account was settled and paid in full', false, 'Pending');

INSERT INTO credit_scores (user_id, bureau, score, date, notes) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Experian', 720, '2024-10-01', 'Good credit standing'),
('123e4567-e89b-12d3-a456-426614174000', 'Equifax', 715, '2024-10-01', 'Slight variation from Experian'),
('123e4567-e89b-12d3-a456-426614174000', 'TransUnion', 725, '2024-10-01', 'Highest score among bureaus'),
('123e4567-e89b-12d3-a456-426614174001', 'Experian', 680, '2024-10-01', 'Fair credit score'),
('123e4567-e89b-12d3-a456-426614174001', 'Equifax', 675, '2024-10-01', 'Consistent with Experian'),
('123e4567-e89b-12d3-a456-426614174001', 'TransUnion', 685, '2024-10-01', 'Slightly higher than other bureaus');

-- Success message
SELECT 'Credit reports database setup completed successfully! Tables created and sample data inserted.' as status;
