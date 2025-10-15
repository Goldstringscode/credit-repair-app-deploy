-- Compliance Database Schema
-- This schema supports GDPR, FCRA, CCPA, HIPAA, PCI DSS, and data retention compliance

-- Compliance Requests Table
CREATE TABLE IF NOT EXISTS compliance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- 'gdpr_export', 'gdpr_deletion', 'fcra_dispute', 'ccpa_know', etc.
    framework VARCHAR(20) NOT NULL, -- 'GDPR', 'FCRA', 'CCPA', 'HIPAA', 'PCI'
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
    priority VARCHAR(10) NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    description TEXT,
    requested_data JSONB, -- Specific data requested
    reason TEXT, -- Reason for request
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE, -- SLA due date
    completed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID, -- Admin who processed the request
    response_data JSONB, -- Response data or files
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

-- Data Retention Policies
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    data_type VARCHAR(50) NOT NULL, -- 'user_data', 'payment_data', 'audit_logs', etc.
    retention_period_days INTEGER NOT NULL,
    auto_delete BOOLEAN DEFAULT false,
    exempt_conditions JSONB, -- Conditions that exempt data from deletion
    is_active BOOLEAN DEFAULT true,
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
    retention_policy_id UUID REFERENCES data_retention_policies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    exempt_reason TEXT,
    created_by UUID
);

-- Compliance Metrics
CREATE TABLE IF NOT EXISTS compliance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework VARCHAR(20) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    measurement_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Notifications
CREATE TABLE IF NOT EXISTS compliance_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    admin_id UUID,
    type VARCHAR(50) NOT NULL, -- 'sla_breach', 'compliance_alert', 'audit_required'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- GDPR Specific Data
CREATE TABLE IF NOT EXISTS gdpr_data_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    data_subject_id VARCHAR(100) NOT NULL,
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    consent_withdrawn_at TIMESTAMP WITH TIME ZONE,
    data_categories JSONB, -- Categories of data collected
    processing_purposes JSONB, -- Purposes for processing
    legal_basis VARCHAR(50), -- 'consent', 'contract', 'legal_obligation', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FCRA Dispute Records
CREATE TABLE IF NOT EXISTS fcra_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    credit_bureau VARCHAR(50) NOT NULL, -- 'experian', 'equifax', 'transunion'
    account_name VARCHAR(200),
    account_number VARCHAR(100),
    dispute_reason TEXT NOT NULL,
    supporting_documents JSONB, -- File references
    status VARCHAR(20) DEFAULT 'submitted', -- 'submitted', 'investigating', 'resolved', 'rejected'
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    bureau_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CCPA Consumer Rights
CREATE TABLE IF NOT EXISTS ccpa_consumer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    request_type VARCHAR(50) NOT NULL, -- 'know', 'delete', 'opt_out', 'non_discrimination'
    verification_status VARCHAR(20) DEFAULT 'pending',
    business_purpose TEXT,
    third_parties JSONB, -- Third parties data is shared with
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
    data_type VARCHAR(50) NOT NULL, -- 'medical_record', 'insurance_info', 'prescription_data'
    sensitivity_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
    access_level VARCHAR(20) NOT NULL, -- 'view', 'edit', 'delete'
    encrypted BOOLEAN DEFAULT true,
    last_accessed TIMESTAMP WITH TIME ZONE,
    accessed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PCI DSS Security Events
CREATE TABLE IF NOT EXISTS pci_security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- 'card_processed', 'security_scan', 'vulnerability_found'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    description TEXT NOT NULL,
    affected_systems JSONB,
    remediation_actions JSONB,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
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

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_compliance_requests_updated_at BEFORE UPDATE ON compliance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_retention_policies_updated_at BEFORE UPDATE ON data_retention_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_retention_records_updated_at BEFORE UPDATE ON data_retention_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gdpr_data_subjects_updated_at BEFORE UPDATE ON gdpr_data_subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fcra_disputes_updated_at BEFORE UPDATE ON fcra_disputes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ccpa_consumer_requests_updated_at BEFORE UPDATE ON ccpa_consumer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hipaa_health_data_updated_at BEFORE UPDATE ON hipaa_health_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pci_security_events_updated_at BEFORE UPDATE ON pci_security_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
