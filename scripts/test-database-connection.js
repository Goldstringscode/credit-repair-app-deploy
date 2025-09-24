/**
 * Test Database Connection
 * Verify that the certified mail database tables exist and are accessible
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  console.log('============================================================\n');

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('✅ Supabase client initialized');

    // Test 1: Check if certified_mail_tracking table exists
    console.log('\n🧪 Testing certified_mail_tracking table...');
    const { data: trackingData, error: trackingError } = await supabase
      .from('certified_mail_tracking')
      .select('*')
      .limit(1);

    if (trackingError) {
      console.log('❌ certified_mail_tracking table error:', trackingError.message);
    } else {
      console.log('✅ certified_mail_tracking table accessible');
    }

    // Test 2: Check if mail_events table exists
    console.log('\n🧪 Testing mail_events table...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('mail_events')
      .select('*')
      .limit(1);

    if (eventsError) {
      console.log('❌ mail_events table error:', eventsError.message);
    } else {
      console.log('✅ mail_events table accessible');
    }

    // Test 3: Check if usps_service_rates table exists
    console.log('\n🧪 Testing usps_service_rates table...');
    const { data: ratesData, error: ratesError } = await supabase
      .from('usps_service_rates')
      .select('*')
      .limit(1);

    if (ratesError) {
      console.log('❌ usps_service_rates table error:', ratesError.message);
    } else {
      console.log('✅ usps_service_rates table accessible');
      console.log('   Available rates:', ratesData?.length || 0);
    }

    // Test 4: Check if mail_templates table exists
    console.log('\n🧪 Testing mail_templates table...');
    const { data: templatesData, error: templatesError } = await supabase
      .from('mail_templates')
      .select('*')
      .limit(1);

    if (templatesError) {
      console.log('❌ mail_templates table error:', templatesError.message);
    } else {
      console.log('✅ mail_templates table accessible');
      console.log('   Available templates:', templatesData?.length || 0);
    }

    // Test 5: Check if mail_payment_transactions table exists
    console.log('\n🧪 Testing mail_payment_transactions table...');
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('mail_payment_transactions')
      .select('*')
      .limit(1);

    if (paymentsError) {
      console.log('❌ mail_payment_transactions table error:', paymentsError.message);
    } else {
      console.log('✅ mail_payment_transactions table accessible');
    }

    // Summary
    console.log('\n📊 Database Connection Summary');
    console.log('============================================================');
    
    const allTables = [
      { name: 'certified_mail_tracking', error: trackingError },
      { name: 'mail_events', error: eventsError },
      { name: 'usps_service_rates', error: ratesError },
      { name: 'mail_templates', error: templatesError },
      { name: 'mail_payment_transactions', error: paymentsError }
    ];

    const workingTables = allTables.filter(table => !table.error).length;
    const totalTables = allTables.length;

    console.log(`✅ Working tables: ${workingTables}/${totalTables}`);
    
    if (workingTables === totalTables) {
      console.log('\n🎉 All database tables are accessible!');
      console.log('The certified mail system should work correctly.');
    } else {
      console.log('\n⚠️  Some tables are missing or inaccessible.');
      console.log('Please check the database schema deployment.');
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check your .env.local file has correct Supabase credentials');
    console.log('2. Verify the database schema was deployed successfully');
    console.log('3. Check your Supabase project is active');
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
