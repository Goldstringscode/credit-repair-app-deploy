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

-- Success message
SELECT 'Compliance database setup completed successfully! All tables created and sample data inserted.' as status;
