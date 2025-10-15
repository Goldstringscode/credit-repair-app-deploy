// Script to set up Vercel environment variables
// Run this with: node setup-vercel-env.js

const { execSync } = require('child_process');

const environmentVariables = {
  'NEXT_PUBLIC_SUPABASE_URL': 'https://gbvpubekxavjxylofpqf.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdidnB1YmVreGF2anh5bG9mcHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODE0MDUsImV4cCI6MjA2OTY1NzQwNX0.90ANHldAgk-_nPKkd4W44Uab1hUnpTeii5RovDVf_hM',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdidnB1YmVreGF2anh5bG9mcHFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTQwNSwiZXhwIjoyMDY5NjU3NDA1fQ.cK_iG9h749j4GyGqHFVB7DBI6loLu6nXN9ZcdrH0Pi0'
};

console.log('Setting up Vercel environment variables...');

try {
  // Set environment variables for production
  for (const [key, value] of Object.entries(environmentVariables)) {
    console.log(`Setting ${key}...`);
    execSync(`vercel env add ${key} production`, {
      input: value,
      stdio: 'pipe'
    });
  }

  console.log('✅ All environment variables set successfully!');
  console.log('Next steps:');
  console.log('1. Run the SQL script in your Supabase SQL Editor');
  console.log('2. Redeploy your Vercel project');
  console.log('3. Test the compliance system');

} catch (error) {
  console.error('Error setting environment variables:', error.message);
  console.log('\nManual setup instructions:');
  console.log('1. Go to your Vercel dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings → Environment Variables');
  console.log('4. Add each variable manually:');
  
  for (const [key, value] of Object.entries(environmentVariables)) {
    console.log(`   - ${key}: ${value}`);
  }
}
