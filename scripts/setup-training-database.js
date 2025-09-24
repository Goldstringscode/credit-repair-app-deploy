require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function setupTrainingDatabase() {
  try {
    // Check if we have database URL
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ No database URL found. Please set NEON_DATABASE_URL or DATABASE_URL environment variable.');
      return;
    }

    console.log('🚀 Setting up Training System database tables...');
    const sql = neon(databaseUrl);

    // Read the training SQL script
    const sqlFilePath = path.join(__dirname, '../lib/database/schema/training.sql');
    console.log(`📁 Reading SQL file: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.log('❌ SQL file not found!');
      return;
    }

    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(`📄 SQL file size: ${sqlScript.length} characters`);
    
    // Better SQL parsing - split by semicolon but handle multi-line statements
    const statements = sqlScript
      .split('\n')
      .reduce((acc, line) => {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('--')) {
          return acc;
        }
        
        if (acc.length === 0) {
          acc.push(trimmedLine);
        } else {
          acc[acc.length - 1] += ' ' + trimmedLine;
        }
        
        // If line ends with semicolon, it's a complete statement
        if (trimmedLine.endsWith(';')) {
          const statement = acc[acc.length - 1];
          if (statement.trim() && statement !== ';') {
            acc[acc.length - 1] = statement.slice(0, -1).trim(); // Remove semicolon
          }
        }
        
        return acc;
      }, [])
      .filter(stmt => stmt.trim() && stmt !== '');

    console.log(`📝 Found ${statements.length} SQL statements to execute...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          console.log(`   SQL: ${statement.substring(0, 100)}...`);
          await sql.unsafe(statement);
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          // Some statements might fail if tables already exist, which is fine
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message.split('\n')[0]}`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            console.error(`   Full statement: ${statement}`);
          }
        }
      }
    }
    
    console.log('✅ Training System database setup completed!');
    
    // Verify the setup by checking if key tables exist
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'training_%'
        ORDER BY table_name
      `;
      
      console.log('📊 Training tables created:');
      if (tables.length === 0) {
        console.log('   ⚠️  No training tables found!');
      } else {
        tables.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      }
      
    } catch (error) {
      console.log('⚠️  Could not verify table creation:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error setting up training database:', error);
  }
}

// Run if called directly
if (require.main === module) {
  setupTrainingDatabase();
}

module.exports = { setupTrainingDatabase };
