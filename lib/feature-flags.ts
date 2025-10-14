/**
 * Feature Flags System
 * Allows safe rollout of new features without affecting production
 */

export interface FeatureFlags {
  // New features
  newDashboard: boolean
  advancedAnalytics: boolean
  betaFeatures: boolean
  
  // MLM features
  mlmV2: boolean
  enhancedCommission: boolean
  
  // Email features
  newEmailTemplates: boolean
  advancedEmailAnalytics: boolean
  
  // Billing features
  newBillingFlow: boolean
  subscriptionUpgrades: boolean
  
  // Development features
  debugMode: boolean
  testMode: boolean
}

/**
 * Get feature flags based on environment
 */
export function getFeatureFlags(): FeatureFlags {
  const isProduction = process.env.NODE_ENV === 'production'
  const isStaging = process.env.NODE_ENV === 'staging'
  
  // Base flags for all environments
  const baseFlags: FeatureFlags = {
    newDashboard: false,
    advancedAnalytics: false,
    betaFeatures: false,
    mlmV2: false,
    enhancedCommission: false,
    newEmailTemplates: false,
    advancedEmailAnalytics: false,
    newBillingFlow: false,
    subscriptionUpgrades: false,
    debugMode: !isProduction,
    testMode: !isProduction
  }
  
  // Development environment - all features enabled
  if (!isProduction && !isStaging) {
    return {
      ...baseFlags,
      newDashboard: true,
      advancedAnalytics: true,
      betaFeatures: true,
      mlmV2: true,
      enhancedCommission: true,
      newEmailTemplates: true,
      advancedEmailAnalytics: true,
      newBillingFlow: true,
      subscriptionUpgrades: true,
      debugMode: true,
      testMode: true
    }
  }
  
  // Staging environment - test new features
  if (isStaging) {
    return {
      ...baseFlags,
      newDashboard: true,
      advancedAnalytics: true,
      betaFeatures: true,
      mlmV2: true,
      newEmailTemplates: true,
      newBillingFlow: true,
      debugMode: true,
      testMode: true
    }
  }
  
  // Production environment - controlled rollout
  return {
    ...baseFlags,
    // Enable features gradually in production
    newDashboard: process.env.ENABLE_NEW_DASHBOARD === 'true',
    advancedAnalytics: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
    betaFeatures: process.env.ENABLE_BETA_FEATURES === 'true',
    mlmV2: process.env.ENABLE_MLM_V2 === 'true',
    enhancedCommission: process.env.ENABLE_ENHANCED_COMMISSION === 'true',
    newEmailTemplates: process.env.ENABLE_NEW_EMAIL_TEMPLATES === 'true',
    advancedEmailAnalytics: process.env.ENABLE_ADVANCED_EMAIL_ANALYTICS === 'true',
    newBillingFlow: process.env.ENABLE_NEW_BILLING_FLOW === 'true',
    subscriptionUpgrades: process.env.ENABLE_SUBSCRIPTION_UPGRADES === 'true',
    debugMode: false,
    testMode: false
  }
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags()
  return flags[feature]
}

/**
 * Get feature flags for client-side use
 */
export function getClientFeatureFlags(): Partial<FeatureFlags> {
  const flags = getFeatureFlags()
  
  // Only expose safe flags to client
  return {
    newDashboard: flags.newDashboard,
    advancedAnalytics: flags.advancedAnalytics,
    betaFeatures: flags.betaFeatures,
    mlmV2: flags.mlmV2,
    newEmailTemplates: flags.newEmailTemplates,
    newBillingFlow: flags.newBillingFlow,
    subscriptionUpgrades: flags.subscriptionUpgrades
  }
}

/**
 * Feature flag hook for React components
 */
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  // This would be used in client components
  // For now, return the server-side value
  return isFeatureEnabled(feature)
}

/**
 * Conditional rendering helper
 */
export function withFeatureFlag<T>(
  feature: keyof FeatureFlags,
  component: T,
  fallback?: T
): T | null {
  return isFeatureEnabled(feature) ? component : (fallback || null)
}
