const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Database URL not configured. Please set NEON_DATABASE_URL or DATABASE_URL');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setupMLMDatabase() {
  try {
    console.log('🚀 Setting up MLM communication database...');
    console.log('Database URL configured:', !!databaseUrl);
    
    // Test connection
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Read and execute the SQL setup file
    const sqlFile = path.join(__dirname, 'mlm-communication-database-setup.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await sql.unsafe(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.warn(`⚠️  Statement ${i + 1} failed (may already exist):`, error.message);
        }
      }
    }
    
    console.log('🎉 MLM communication database setup completed successfully!');
    
    // Test the setup by running a simple query
    const channels = await sql`SELECT COUNT(*) as count FROM mlm_channels`;
    const messages = await sql`SELECT COUNT(*) as count FROM mlm_messages`;
    
    console.log('📊 Database status:');
    console.log(`   - Channels: ${channels[0].count}`);
    console.log(`   - Messages: ${messages[0].count}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupMLMDatabase();
