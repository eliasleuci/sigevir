import db from './src/models/index.js';

async function checkDB() {
  try {
    await db.sequelize.authenticate();
    
    // Check tables
    const [tables] = await db.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in public schema:");
    tables.forEach(t => console.log(t.table_name));

    // Check foreign keys for retenciones
    const [fks] = await db.sequelize.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='retenciones';
    `);
    console.log("Foreign keys on retenciones:");
    console.log(fks);

    // Let's also check if the user exists in users table if it exists
    const hasUsersTable = tables.some(t => t.table_name === 'users');
    if (hasUsersTable) {
      const [users] = await db.sequelize.query('SELECT id FROM users');
      console.log('IDs in users table:', users);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDB();
