/**
 * Production Monitoring Script
 * Run this to monitor your live app health
 */

const https = require('https');
const fs = require('fs');

// Configuration
const PRODUCTION_URL = 'https://credit-repair-cm4rdxjbw-goldstrings-projects.vercel.app';
const STAGING_URL = 'https://staging-credit-repair.vercel.app'; // Set this up
const HEALTH_CHECK_ENDPOINTS = [
  '/api/health',
  '/api/status',
  '/api/test/basic'
];

// Monitoring functions
async function checkEndpoint(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      resolve({
        url,
        status: res.statusCode,
        responseTime,
        healthy: res.statusCode === 200,
        timestamp: new Date().toISOString()
      });
    }).on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        responseTime: null,
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });
  });
}

async function monitorProduction() {
  console.log('🔍 Monitoring Production Environment...\n');
  
  const results = [];
  
  for (const endpoint of HEALTH_CHECK_ENDPOINTS) {
    const result = await checkEndpoint(`${PRODUCTION_URL}${endpoint}`);
    results.push(result);
    
    const status = result.healthy ? '✅' : '❌';
    const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
    
    console.log(`${status} ${endpoint} - ${result.status} (${time})`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  // Check main page
  const mainPage = await checkEndpoint(PRODUCTION_URL);
  results.push(mainPage);
  
  const status = mainPage.healthy ? '✅' : '❌';
  const time = mainPage.responseTime ? `${mainPage.responseTime}ms` : 'N/A';
  console.log(`${status} Main Page - ${mainPage.status} (${time})`);
  
  // Summary
  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;
  
  console.log(`\n📊 Health Summary: ${healthyCount}/${totalCount} endpoints healthy`);
  
  if (healthyCount < totalCount) {
    console.log('⚠️  Some endpoints are unhealthy - consider investigating');
    return false;
  }
  
  console.log('✅ All endpoints are healthy');
  return true;
}

async function checkDatabase() {
  console.log('\n🗄️  Checking Database Connectivity...');
  
  try {
    const result = await checkEndpoint(`${PRODUCTION_URL}/api/test-supabase`);
    
    if (result.healthy) {
      console.log('✅ Database connection healthy');
      return true;
    } else {
      console.log('❌ Database connection issues');
      console.log(`   Status: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Database check failed:', error.message);
    return false;
  }
}

async function checkEnvironmentVariables() {
  console.log('\n🔧 Checking Environment Variables...');
  
  try {
    const result = await checkEndpoint(`${PRODUCTION_URL}/api/test/env-validation`);
    
    if (result.healthy) {
      console.log('✅ Environment variables configured correctly');
      return true;
    } else {
      console.log('❌ Environment variable issues');
      return false;
    }
  } catch (error) {
    console.log('❌ Environment check failed:', error.message);
    return false;
  }
}

async function generateReport() {
  console.log('📋 Generating Production Health Report...\n');
  
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    production: {
      healthy: false,
      endpoints: [],
      database: false,
      environment: false
    }
  };
  
  // Check all systems
  const endpointsHealthy = await monitorProduction();
  const databaseHealthy = await checkDatabase();
  const environmentHealthy = await checkEnvironmentVariables();
  
  report.production.healthy = endpointsHealthy && databaseHealthy && environmentHealthy;
  report.production.database = databaseHealthy;
  report.production.environment = environmentHealthy;
  
  // Save report
  const reportFile = `production-health-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Report saved to: ${reportFile}`);
  
  if (report.production.healthy) {
    console.log('🎉 Production environment is healthy!');
  } else {
    console.log('⚠️  Production environment has issues - review the report');
  }
  
  return report;
}

// Run monitoring
if (require.main === module) {
  generateReport().catch(console.error);
}

module.exports = {
  monitorProduction,
  checkDatabase,
  checkEnvironmentVariables,
  generateReport
};
