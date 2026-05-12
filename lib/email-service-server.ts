/**
 * lib/email-service-server.ts
 * Re-exports everything from lib/email-service.ts
 * Kept for backward compatibility with routes that import from this path.
 */
export * from './email-service'
export { emailService } from './email-service'
