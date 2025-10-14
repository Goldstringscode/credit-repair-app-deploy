/**
 * Emergency Rollback Script
 * Use this to quickly rollback to a previous deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const PRODUCTION_URL = 'https://credit-repair-cm4rdxjbw-goldstrings-projects.vercel.app';

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function executeCommand(command, description) {
  try {
    log(`Executing: ${description}`);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed successfully`);
    return result;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'error');
    throw error;
  }
}

async function getCurrentDeployment() {
  try {
    log('Getting current deployment information...');
    const result = executeCommand(
      `vercel ls --scope goldstrings-projects`,
      'Fetch current deployments'
    );
    
    const lines = result.split('\n');
    const currentDeployment = lines.find(line => 
      line.includes('credit-repair') && line.includes('Ready')
    );
    
    if (currentDeployment) {
      log(`Current deployment: ${currentDeployment}`);
      return currentDeployment;
    } else {
      log('Could not find current deployment', 'warning');
      return null;
    }
  } catch (error) {
    log('Failed to get current deployment', 'error');
    return null;
  }
}

async function getDeploymentHistory() {
  try {
    log('Getting deployment history...');
    const result = executeCommand(
      `vercel ls --scope goldstrings-projects --limit 10`,
      'Fetch deployment history'
    );
    
    const lines = result.split('\n').filter(line => 
      line.includes('credit-repair') && line.includes('Ready')
    );
    
    log(`Found ${lines.length} previous deployments`);
    return lines;
  } catch (error) {
    log('Failed to get deployment history', 'error');
    return [];
  }
}

async function rollbackToDeployment(deploymentUrl) {
  try {
    log(`Rolling back to: ${deploymentUrl}`);
    
    // Use Vercel's rollback command
    executeCommand(
      `vercel rollback ${deploymentUrl} --scope goldstrings-projects`,
      `Rollback to ${deploymentUrl}`
    );
    
    log('✅ Rollback completed successfully');
    
    // Wait a moment for deployment to propagate
    log('Waiting for deployment to propagate...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Test the rollback
    await testRollback();
    
  } catch (error) {
    log(`❌ Rollback failed: ${error.message}`, 'error');
    throw error;
  }
}

async function testRollback() {
  try {
    log('Testing rollback deployment...');
    
    // Test main page
    const https = require('https');
    const testUrl = PRODUCTION_URL;
    
    const result = await new Promise((resolve) => {
      https.get(testUrl, (res) => {
        resolve({
          status: res.statusCode,
          healthy: res.statusCode === 200
        });
      }).on('error', (error) => {
        resolve({
          status: 'ERROR',
          healthy: false,
          error: error.message
        });
      });
    });
    
    if (result.healthy) {
      log('✅ Rollback test successful - site is responding');
    } else {
      log(`❌ Rollback test failed - Status: ${result.status}`, 'error');
      if (result.error) {
        log(`Error: ${result.error}`, 'error');
      }
    }
    
  } catch (error) {
    log(`❌ Rollback test failed: ${error.message}`, 'error');
  }
}

async function createRollbackLog(deploymentUrl, reason) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: 'rollback',
    deploymentUrl,
    reason,
    success: true
  };
  
  const logFile = 'rollback-log.json';
  let logs = [];
  
  if (fs.existsSync(logFile)) {
    logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
  }
  
  logs.push(logEntry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  
  log(`Rollback logged to: ${logFile}`);
}

async function emergencyRollback(reason = 'Emergency rollback') {
  log('🚨 INITIATING EMERGENCY ROLLBACK 🚨');
  log(`Reason: ${reason}`);
  
  try {
    // Get deployment history
    const deployments = await getDeploymentHistory();
    
    if (deployments.length < 2) {
      log('❌ Not enough deployments to rollback', 'error');
      return;
    }
    
    // Get the previous deployment (skip current)
    const previousDeployment = deployments[1];
    const deploymentUrl = previousDeployment.split(/\s+/)[0];
    
    log(`Rolling back to previous deployment: ${deploymentUrl}`);
    
    // Confirm rollback
    log('⚠️  This will rollback your production deployment!');
    log('Press Ctrl+C to cancel, or wait 10 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Perform rollback
    await rollbackToDeployment(deploymentUrl);
    
    // Log the rollback
    await createRollbackLog(deploymentUrl, reason);
    
    log('🎉 Emergency rollback completed successfully!');
    log(`Your app is now running the previous version`);
    
  } catch (error) {
    log(`❌ Emergency rollback failed: ${error.message}`, 'error');
    log('Manual intervention may be required');
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const reason = args.join(' ') || 'Emergency rollback';
  
  emergencyRollback(reason).catch(console.error);
}

module.exports = {
  emergencyRollback,
  rollbackToDeployment,
  getDeploymentHistory,
  testRollback
};
