import db from './src/models/index.js';

async function check() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const [results, metadata] = await db.sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'retenciones';
    `);
    
    console.log('Columns in retenciones:', results.map(r => r.column_name));
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    process.exit(0);
  }
}

check();
