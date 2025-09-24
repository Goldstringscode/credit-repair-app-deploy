import { DatabaseService } from './types'
import { database as mockDatabase } from './database'
import { postgresDatabase } from './database-postgres'

/**
 * Database configuration that switches between mock and production
 */
export function getDatabaseService(): DatabaseService {
  const useProductionDB = process.env.USE_PRODUCTION_DB === 'true'
  const dbType = process.env.DB_TYPE || 'mock'

  console.log(`🗄️ Database: Using ${useProductionDB ? 'production' : 'development'} database (${dbType})`)

  if (useProductionDB || dbType === 'postgres') {
    return postgresDatabase
  }

  return mockDatabase
}

export const database = getDatabaseService()
