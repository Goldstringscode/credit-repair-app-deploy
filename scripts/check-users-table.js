require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function checkUsersTable() {
  try {
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ No database URL found');
      return;
    }

    console.log('🔍 Checking users table structure...');
    const sql = neon(databaseUrl);

    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    console.log(`✅ Users table has ${columns.length} columns:`);
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsersTable();
