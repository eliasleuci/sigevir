import db from './src/models/index.js';

async function check() {
  try {
    const results = await db.sequelize.query(`
      SELECT * FROM retenciones WHERE dominio = 'ABC123';
    `, { type: db.sequelize.QueryTypes.SELECT });
    
    console.log('ABC123:', results);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

check();
