-- Certified Mail System Database Schema
-- Phase 1: Core Infrastructure
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Certified Mail Tracking Table
CREATE TABLE IF NOT EXISTS certified_mail_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Will reference auth.users(id) when integrated
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    usps_tracking_id VARCHAR(50), -- Real USPS tracking number
    
    -- Recipient Information
    recipient_name VARCHAR(255) NOT NULL,
    recipient_company VARCHAR(255),
    recipient_address_line1 VARCHAR(255) NOT NULL,
    recipient_address_line2 VARCHAR(255),
    recipient_city VARCHAR(100) NOT NULL,
    recipient_state VARCHAR(50) NOT NULL,
    recipient_zip_code VARCHAR(20) NOT NULL,
    recipient_country VARCHAR(100) DEFAULT 'US',
    
    -- Sender Information
    sender_name VARCHAR(255) NOT NULL,
    sender_company VARCHAR(255),
    sender_address_line1 VARCHAR(255) NOT NULL,
    sender_address_line2 VARCHAR(255),
    sender_city VARCHAR(100) NOT NULL,
    sender_state VARCHAR(50) NOT NULL,
    sender_zip_code VARCHAR(20) NOT NULL,
    sender_country VARCHAR(100) DEFAULT 'US',
    
    -- Mail Content
    letter_subject VARCHAR(500),
    letter_content TEXT NOT NULL,
    letter_type VARCHAR(100) NOT NULL, -- 'dispute', 'cease_desist', 'pay_for_delete', etc.
    letter_template_id VARCHAR(100),
    
    -- Mail Services
    mail_service VARCHAR(50) NOT NULL, -- 'certified', 'certified_return_receipt', 'registered', etc.
    mail_class VARCHAR(50) NOT NULL, -- 'first_class', 'priority', 'express'
    additional_services JSONB DEFAULT '[]', -- Array of additional services
    
    -- Financial Information
    base_cost DECIMAL(10,2) NOT NULL,
    additional_services_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_payment_intent_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    
    -- Status and Tracking
    status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'sent', 'in_transit', 'delivered', 'failed', 'returned'
    processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'validating', 'printing', 'shipping', 'completed'
    
    -- Dates
    sent_date TIMESTAMP WITH TIME ZONE,
    delivered_date TIMESTAMP WITH TIME ZONE,
    estimated_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    is_premium BOOLEAN DEFAULT FALSE,
    attorney_reviewed BOOLEAN DEFAULT FALSE,
    priority_level VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    delivery_instructions TEXT,
    return_receipt_requested BOOLEAN DEFAULT FALSE,
    signature_confirmation BOOLEAN DEFAULT FALSE,
    
    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Compliance and Audit
    compliance_notes TEXT,
    audit_trail JSONB DEFAULT '[]',
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('processing', 'sent', 'in_transit', 'delivered', 'failed', 'returned')),
    CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    CONSTRAINT valid_processing_status CHECK (processing_status IN ('pending', 'validating', 'printing', 'shipping', 'completed')),
    CONSTRAINT valid_priority CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
    CONSTRAINT positive_cost CHECK (total_cost >= 0)
);

-- Mail Events Table (for detailed tracking)
CREATE TABLE IF NOT EXISTS certified_mail_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id UUID NOT NULL REFERENCES certified_mail_tracking(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'created', 'paid', 'sent', 'in_transit', 'delivered', 'failed', etc.
    event_description TEXT NOT NULL,
    location VARCHAR(255),
    location_details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'system', 'usps', 'stripe', 'manual'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_event_type CHECK (event_type IN (
        'created', 'payment_initiated', 'payment_completed', 'payment_failed',
        'validating', 'validated', 'validation_failed',
        'printing', 'printed', 'print_failed',
        'shipping', 'shipped', 'ship_failed',
        'in_transit', 'out_for_delivery', 'delivered', 'delivery_failed',
        'returned', 'failed', 'cancelled'
    )),
    CONSTRAINT valid_source CHECK (source IN ('system', 'usps', 'stripe', 'manual', 'webhook'))
);

-- Mail Templates Table (for reusable letter templates)
CREATE TABLE IF NOT EXISTS certified_mail_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'dispute', 'cease_desist', 'pay_for_delete', etc.
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}', -- Available variables for customization
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_by UUID, -- Will reference auth.users(id) when integrated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_category CHECK (category IN (
        'dispute', 'cease_desist', 'pay_for_delete', 'goodwill', 
        'verification', 'cease_communication', 'identity_theft', 'other'
    ))
);

-- USPS Service Rates Table (for dynamic pricing)
CREATE TABLE IF NOT EXISTS usps_service_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_code VARCHAR(50) UNIQUE NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(50) NOT NULL, -- 'certified', 'registered', 'priority', 'express'
    base_price DECIMAL(10,2) NOT NULL,
    additional_services JSONB DEFAULT '{}', -- Additional service pricing
    delivery_time_days INTEGER NOT NULL,
    tracking_included BOOLEAN DEFAULT TRUE,
    signature_required BOOLEAN DEFAULT FALSE,
    insurance_included DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_service_type CHECK (service_type IN (
        'certified', 'registered', 'priority', 'express', 'first_class'
    )),
    CONSTRAINT positive_price CHECK (base_price >= 0),
    CONSTRAINT positive_delivery_time CHECK (delivery_time_days > 0)
);

-- User Mail Preferences Table
CREATE TABLE IF NOT EXISTS user_mail_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Will reference auth.users(id) when integrated
    default_sender_name VARCHAR(255),
    default_sender_company VARCHAR(255),
    default_sender_address_line1 VARCHAR(255),
    default_sender_address_line2 VARCHAR(255),
    default_sender_city VARCHAR(100),
    default_sender_state VARCHAR(50),
    default_sender_zip_code VARCHAR(20),
    default_sender_country VARCHAR(100) DEFAULT 'US',
    default_mail_service VARCHAR(50) DEFAULT 'certified',
    auto_confirm_sending BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_certified_mail_tracking_user_id ON certified_mail_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_certified_mail_tracking_tracking_number ON certified_mail_tracking(tracking_number);
CREATE INDEX IF NOT EXISTS idx_certified_mail_tracking_status ON certified_mail_tracking(status);
CREATE INDEX IF NOT EXISTS idx_certified_mail_tracking_created_at ON certified_mail_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certified_mail_tracking_payment_status ON certified_mail_tracking(payment_status);

CREATE INDEX IF NOT EXISTS idx_certified_mail_events_tracking_id ON certified_mail_events(tracking_id);
CREATE INDEX IF NOT EXISTS idx_certified_mail_events_timestamp ON certified_mail_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_certified_mail_events_event_type ON certified_mail_events(event_type);

CREATE INDEX IF NOT EXISTS idx_certified_mail_templates_category ON certified_mail_templates(category);
CREATE INDEX IF NOT EXISTS idx_certified_mail_templates_active ON certified_mail_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_usps_service_rates_service_type ON usps_service_rates(service_type);
CREATE INDEX IF NOT EXISTS idx_usps_service_rates_active ON usps_service_rates(is_active);

CREATE INDEX IF NOT EXISTS idx_user_mail_preferences_user_id ON user_mail_preferences(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_certified_mail_tracking_updated_at 
    BEFORE UPDATE ON certified_mail_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certified_mail_templates_updated_at 
    BEFORE UPDATE ON certified_mail_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_mail_preferences_updated_at 
    BEFORE UPDATE ON user_mail_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default USPS service rates
INSERT INTO usps_service_rates (service_code, service_name, service_type, base_price, delivery_time_days, tracking_included, signature_required, insurance_included, effective_date) VALUES
('certified_mail', 'Certified Mail', 'certified', 3.75, 3, true, false, 0, CURRENT_DATE),
('certified_mail_return_receipt', 'Certified Mail + Return Receipt', 'certified', 6.50, 3, true, true, 0, CURRENT_DATE),
('registered_mail', 'Registered Mail', 'registered', 15.75, 5, true, true, 50, CURRENT_DATE),
('priority_mail_express', 'Priority Mail Express', 'express', 28.95, 1, true, true, 100, CURRENT_DATE),
('priority_mail', 'Priority Mail', 'priority', 8.95, 2, true, false, 50, CURRENT_DATE),
('first_class_mail', 'First-Class Mail', 'first_class', 0.60, 5, false, false, 0, CURRENT_DATE)
ON CONFLICT (service_code) DO NOTHING;

-- Insert default mail templates
INSERT INTO certified_mail_templates (name, description, category, template_content, variables, is_premium) VALUES
('Basic Dispute Letter', 'Standard credit report dispute letter', 'dispute', 
'[Your Name]
[Your Address]
[City, State ZIP]

[Date]

[Credit Bureau Name]
Consumer Dispute Department
[Credit Bureau Address]

RE: Dispute of Credit Report Information

Dear Sir/Madam,

I am writing to dispute the following information on my credit report:

[Disputed Items]

The information is inaccurate because: [Reason for Dispute]

I request that you investigate this matter and remove or correct the inaccurate information within 30 days as required by the Fair Credit Reporting Act.

Sincerely,
[Your Name]',
'{"your_name": "string", "your_address": "string", "city_state_zip": "string", "credit_bureau_name": "string", "credit_bureau_address": "string", "disputed_items": "string", "reason_for_dispute": "string"}',
false),

('Cease and Desist Letter', 'Stop collection calls and harassment', 'cease_desist',
'[Your Name]
[Your Address]
[City, State ZIP]

[Date]

[Collection Agency Name]
[Collection Agency Address]

RE: Cease and Desist Communication

Dear Sir/Madam,

I am writing to demand that you cease and desist all communication with me regarding the alleged debt referenced above.

Under the Fair Debt Collection Practices Act (FDCPA), I have the right to request that you stop contacting me. This letter serves as formal notice that I do not wish to be contacted by your agency regarding this matter.

If you continue to contact me after receiving this letter, I will consider it a violation of the FDCPA and will take appropriate legal action.

Sincerely,
[Your Name]',
'{"your_name": "string", "your_address": "string", "city_state_zip": "string", "collection_agency_name": "string", "collection_agency_address": "string"}',
false),

('Pay for Delete Letter', 'Negotiate payment in exchange for removal', 'pay_for_delete',
'[Your Name]
[Your Address]
[City, State ZIP]

[Date]

[Creditor Name]
[Creditor Address]

RE: Settlement Offer - Pay for Delete Agreement

Dear Sir/Madam,

I am writing to propose a settlement for the account referenced above. I am willing to pay [Amount] in exchange for complete removal of this account from my credit report.

This offer is contingent upon:
1. Complete removal of the account from all three credit bureaus
2. Written confirmation of the removal
3. No further collection activity

If you accept this offer, please provide written confirmation of the terms before I remit payment.

Sincerely,
[Your Name]',
'{"your_name": "string", "your_address": "string", "city_state_zip": "string", "creditor_name": "string", "creditor_address": "string", "amount": "string"}',
false)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE certified_mail_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE certified_mail_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE certified_mail_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE usps_service_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mail_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (will be updated when user authentication is integrated)
-- For now, allow all operations (development mode)
CREATE POLICY "Allow all operations on certified_mail_tracking" ON certified_mail_tracking FOR ALL USING (true);
CREATE POLICY "Allow all operations on certified_mail_events" ON certified_mail_events FOR ALL USING (true);
CREATE POLICY "Allow all operations on certified_mail_templates" ON certified_mail_templates FOR ALL USING (true);
CREATE POLICY "Allow all operations on usps_service_rates" ON usps_service_rates FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_mail_preferences" ON user_mail_preferences FOR ALL USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Certified Mail System database schema created successfully!' as status;

