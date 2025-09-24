/**
 * Test Export Fix
 * This script tests if the CommunicationDatabaseService export is working
 */

try {
  const { CommunicationDatabaseService } = require('../lib/database/communication-service');
  console.log('✅ CommunicationDatabaseService export is working');
  console.log('Class type:', typeof CommunicationDatabaseService);
} catch (error) {
  console.error('❌ Export test failed:', error.message);
}
