#!/usr/bin/env node

// Test subscription manager directly
const { subscriptionManager } = require('../lib/subscription-manager');

const testSubscriptionCreation = async () => {
  console.log('🧪 Testing subscription creation directly...');
  
  try {
    const subscription = await subscriptionManager.createSubscription(
      'test_customer_123',
      'basic',
      {
        trialPeriodDays: 7,
        quantity: 1,
        metadata: { test: true }
      }
    );

    console.log('✅ Subscription created successfully:');
    console.log(JSON.stringify(subscription, null, 2));
    
    return subscription;
  } catch (error) {
    console.error('❌ Subscription creation failed:', error.message);
    console.error('Stack trace:', error.stack);
    return null;
  }
};

const testGetPlans = async () => {
  console.log('🧪 Testing get plans...');
  
  try {
    const plans = await subscriptionManager.getPlans();
    console.log('✅ Plans retrieved successfully:');
    console.log(JSON.stringify(plans, null, 2));
    
    return plans;
  } catch (error) {
    console.error('❌ Get plans failed:', error.message);
    console.error('Stack trace:', error.stack);
    return null;
  }
};

const main = async () => {
  console.log('🔍 Direct Subscription Manager Test');
  console.log('─'.repeat(50));
  
  await testGetPlans();
  console.log('\n' + '─'.repeat(50));
  await testSubscriptionCreation();
};

main().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
