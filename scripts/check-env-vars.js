/**
 * Check Environment Variables
 * This script checks what environment variables are available
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Variables Check');
console.log('================================');

const envVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
};

Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${key}: Missing`);
  }
});

console.log('\n📋 Summary:');
console.log(`- Supabase URL: ${envVars['NEXT_PUBLIC_SUPABASE_URL'] ? '✅ Set' : '❌ Missing'}`);
console.log(`- Anon Key: ${envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ? '✅ Set' : '❌ Missing'}`);
console.log(`- Service Key: ${envVars['SUPABASE_SERVICE_ROLE_KEY'] ? '✅ Set' : '❌ Missing'}`);

if (!envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']) {
  console.log('\n⚠️  Missing NEXT_PUBLIC_SUPABASE_ANON_KEY!');
  console.log('This is required for client-side operations.');
  console.log('Get it from your Supabase project dashboard > Settings > API');
}
