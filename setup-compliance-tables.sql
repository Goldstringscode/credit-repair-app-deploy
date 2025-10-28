-- Compliance Database Setup Script
-- Run this in your Supabase SQL Editor

-- Compliance Requests Table
CREATE TABLE IF NOT EXISTS compliance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    framework VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(10) NOT NULL DEFAULT 'normal',
    description TEXT,
    reason TEXT,
    requested_data JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    response_data JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Audit Log
CREATE TABLE IF NOT EXISTS compliance_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    admin_id UUID,
    action VARCHAR(100) NOT NULL,
    framework VARCHAR(20) NOT NULL,
    request_id UUID REFERENCES compliance_requests(id),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FCRA Disputes
CREATE TABLE IF NOT EXISTS fcra_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    credit_bureau VARCHAR(50) NOT NULL,
    account_name VARCHAR(200),
    account_number VARCHAR(100),
    dispute_reason TEXT NOT NULL,
    supporting_documents JSONB,
    status VARCHAR(20) DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    bureau_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CCPA Consumer Requests
CREATE TABLE IF NOT EXISTS ccpa_consumer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending',
    business_purpose TEXT,
    third_parties JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HIPAA Health Data
CREATE TABLE IF NOT EXISTS hipaa_health_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    sensitivity_level VARCHAR(20) NOT NULL,
    access_level VARCHAR(20) NOT NULL,
    encrypted BOOLEAN DEFAULT true,
    last_accessed TIMESTAMP WITH TIME ZONE,
    accessed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PCI Security Events
CREATE TABLE IF NOT EXISTS pci_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    affected_systems JSONB,
    remediation_actions JSONB,
    status VARCHAR(20) DEFAULT 'open',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Retention Records
CREATE TABLE IF NOT EXISTS data_retention_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    retention_policy_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    exempt_reason TEXT,
    created_by UUID
);

-- Compliance Notifications
CREATE TABLE IF NOT EXISTS compliance_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    admin_id UUID,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_compliance_requests_user_id ON compliance_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_requests_framework ON compliance_requests(framework);
CREATE INDEX IF NOT EXISTS idx_compliance_requests_status ON compliance_requests(status);
CREATE INDEX IF NOT EXISTS idx_compliance_requests_due_date ON compliance_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON compliance_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON compliance_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_retention_records_expires_at ON data_retention_records(expires_at);
CREATE INDEX IF NOT EXISTS idx_retention_records_user_id ON data_retention_records(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON compliance_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON compliance_notifications(is_read);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_compliance_requests_updated_at BEFORE UPDATE ON compliance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fcra_disputes_updated_at BEFORE UPDATE ON fcra_disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ccpa_consumer_requests_updated_at BEFORE UPDATE ON ccpa_consumer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hipaa_health_data_updated_at BEFORE UPDATE ON hipaa_health_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pci_security_events_updated_at BEFORE UPDATE ON pci_security_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO compliance_requests (user_id, request_type, framework, status, priority, description, reason) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'data_export', 'GDPR', 'completed', 'normal', 'User requests export of their personal data', 'Annual data export request'),
('123e4567-e89b-12d3-a456-426614174001', 'data_deletion', 'GDPR', 'pending', 'high', 'User requests deletion of their personal data', 'Account closure request'),
('123e4567-e89b-12d3-a456-426614174002', 'dispute', 'FCRA', 'submitted', 'normal', 'Credit dispute submission', 'Inaccurate account information'),
('123e4567-e89b-12d3-a456-426614174003', 'know', 'CCPA', 'pending', 'normal', 'Consumer requests to know what personal information is collected', 'Privacy rights request'),
('123e4567-e89b-12d3-a456-426614174004', 'access', 'HIPAA', 'completed', 'normal', 'Patient requests access to their health information', 'Medical records access');

INSERT INTO fcra_disputes (user_id, credit_bureau, account_name, dispute_reason, status) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'experian', 'Chase Credit Card', 'Inaccurate balance information', 'resolved'),
('123e4567-e89b-12d3-a456-426614174001', 'equifax', 'Capital One', 'Late payment incorrectly reported', 'submitted');

INSERT INTO ccpa_consumer_requests (user_id, request_type, business_purpose, third_parties, status) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'know', 'Service provision and analytics', '["analytics_providers", "marketing_partners"]', 'completed'),
('123e4567-e89b-12d3-a456-426614174001', 'delete', 'Service provision', '["analytics_providers"]', 'pending');

INSERT INTO hipaa_health_data (user_id, data_type, sensitivity_level, access_level, encrypted) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'medical_record', 'high', 'view', true),
('123e4567-e89b-12d3-a456-426614174001', 'insurance_info', 'medium', 'edit', true);

INSERT INTO pci_security_events (event_type, severity, description, affected_systems, status) VALUES
('security_scan', 'low', 'Routine security scan completed', '["payment_system", "database"]', 'resolved'),
('vulnerability_found', 'high', 'SQL injection vulnerability detected', '["payment_processor"]', 'open');

INSERT INTO data_retention_records (user_id, data_type, table_name, record_id, expires_at) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'user_data', 'users', '123e4567-e89b-12d3-a456-426614174000', NOW() + INTERVAL '7 years'),
('123e4567-e89b-12d3-a456-426614174001', 'payment_data', 'payments', '123e4567-e89b-12d3-a456-426614174001', NOW() + INTERVAL '3 years');

INSERT INTO compliance_notifications (user_id, type, title, message, priority) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'compliance_alert', 'GDPR Data Export Completed', 'Your data export request has been completed successfully.', 'normal'),
('123e4567-e89b-12d3-a456-426614174001', 'sla_breach', 'FCRA Dispute Overdue', 'FCRA dispute is approaching deadline.', 'high');

-- Insert audit log entries
INSERT INTO compliance_audit_log (user_id, action, framework, details) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'gdpr_data_export_requested', 'GDPR', '{"requestType": "data_export", "reason": "User requested data access"}'),
('123e4567-e89b-12d3-a456-426614174001', 'fcra_dispute_submitted', 'FCRA', '{"bureau": "experian", "accountName": "Chase Credit Card"}'),
('123e4567-e89b-12d3-a456-426614174002', 'ccpa_know_requested', 'CCPA', '{"requestType": "know", "businessPurpose": "Service provision"}');

-- Credit Reports Tables
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

-- Sample data for testing
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
SELECT 'Compliance database setup completed successfully! All tables created and sample data inserted.' as status;
