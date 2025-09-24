/**
 * Database Configuration for MLM Communication System
 */

export const databaseConfig = {
  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // Database connection settings
  connection: {
    maxConnections: 20,
    idleTimeout: 30000,
    connectionTimeout: 10000,
  },
  
  // Query settings
  queries: {
    defaultLimit: 50,
    maxLimit: 100,
    defaultOffset: 0,
  },
  
  // File upload settings
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'), // 10MB
    allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/*,application/pdf,text/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document').split(','),
    uploadPath: '/uploads/messages',
  },
  
  // Rate limiting
  rateLimit: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  },
  
  // Security settings
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-here',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key-here',
  },
  
  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN || '',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};

// Validation function
export function validateDatabaseConfig() {
  const errors: string[] = [];
  
  if (!databaseConfig.supabase.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  
  if (!databaseConfig.supabase.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Database configuration errors:\n${errors.join('\n')}`);
  }
  
  return true;
}
