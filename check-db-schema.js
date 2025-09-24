const { neon } = require('@neondatabase/serverless');

async function checkDatabaseSchema() {
  try {
    const databaseUrl = process.env.NEON_DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ No database URL found');
      return;
    }

    const sql = neon(databaseUrl);
    
    console.log('🔍 Checking database schema...');
    
    // Check credit_reports table structure
    const reportsStructure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'credit_reports' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 CREDIT_REPORTS table structure:');
    reportsStructure.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check credit_accounts table structure
    const accountsStructure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'credit_accounts' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 CREDIT_ACCOUNTS table structure:');
    accountsStructure.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check credit_negative_items table structure
    const negativeStructure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'credit_negative_items' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 CREDIT_NEGATIVE_ITEMS table structure:');
    negativeStructure.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check foreign key constraints
    const foreignKeys = await sql`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY' 
        AND tc.table_name IN ('credit_accounts', 'credit_negative_items')
    `;
    
    console.log('\n🔗 Foreign Key Constraints:');
    foreignKeys.forEach(fk => {
      console.log(`  ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error);
  }
}

checkDatabaseSchema();
