// Setup script for compliance database tables
// This script will create all necessary tables for the compliance system

const { createClient } = require('@supabase/supabase-js')

// You'll need to provide these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupComplianceDatabase() {
  console.log('Setting up compliance database tables...')
  
  try {
    // Create compliance_requests table
    console.log('Creating compliance_requests table...')
    const { error: complianceRequestsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })
    
    if (complianceRequestsError) {
      console.error('Error creating compliance_requests table:', complianceRequestsError)
    } else {
      console.log('✅ compliance_requests table created')
    }

    // Create compliance_audit_log table
    console.log('Creating compliance_audit_log table...')
    const { error: auditLogError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })
    
    if (auditLogError) {
      console.error('Error creating compliance_audit_log table:', auditLogError)
    } else {
      console.log('✅ compliance_audit_log table created')
    }

    // Create fcra_disputes table
    console.log('Creating fcra_disputes table...')
    const { error: fcraDisputesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })
    
    if (fcraDisputesError) {
      console.error('Error creating fcra_disputes table:', fcraDisputesError)
    } else {
      console.log('✅ fcra_disputes table created')
    }

    // Create ccpa_consumer_requests table
    console.log('Creating ccpa_consumer_requests table...')
    const { error: ccpaRequestsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })
    
    if (ccpaRequestsError) {
      console.error('Error creating ccpa_consumer_requests table:', ccpaRequestsError)
    } else {
      console.log('✅ ccpa_consumer_requests table created')
    }

    // Create hipaa_health_data table
    console.log('Creating hipaa_health_data table...')
    const { error: hipaaDataError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })
    
    if (hipaaDataError) {
      console.error('Error creating hipaa_health_data table:', hipaaDataError)
    } else {
      console.log('✅ hipaa_health_data table created')
    }

    // Create pci_security_events table
    console.log('Creating pci_security_events table...')
    const { error: pciEventsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })
    
    if (pciEventsError) {
      console.error('Error creating pci_security_events table:', pciEventsError)
    } else {
      console.log('✅ pci_security_events table created')
    }

    // Create data_retention_records table
    console.log('Creating data_retention_records table...')
    const { error: retentionRecordsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })
    
    if (retentionRecordsError) {
      console.error('Error creating data_retention_records table:', retentionRecordsError)
    } else {
      console.log('✅ data_retention_records table created')
    }

    // Create compliance_notifications table
    console.log('Creating compliance_notifications table...')
    const { error: notificationsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })
    
    if (notificationsError) {
      console.error('Error creating compliance_notifications table:', notificationsError)
    } else {
      console.log('✅ compliance_notifications table created')
    }

    console.log('🎉 Compliance database setup completed!')
    console.log('All tables have been created successfully.')
    
  } catch (error) {
    console.error('Error setting up compliance database:', error)
  }
}

// Run the setup
setupComplianceDatabase()
