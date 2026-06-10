import db from './src/models/index.js';

async function check() {
  try {
    const [rls] = await db.sequelize.query(`
      SELECT relrowsecurity FROM pg_class WHERE relname = 'fotos_retenciones';
    `);
    console.log('RLS Enabled:', rls);

    const [cols] = await db.sequelize.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'fotos_retenciones';
    `);
    console.log('Columns:', cols);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

check();
