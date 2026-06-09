import db from './src/models/index.js';

async function check() {
  try {
    const results = await db.sequelize.query(`
      SELECT id, nombre FROM instituciones LIMIT 1;
    `, { type: db.sequelize.QueryTypes.SELECT });
    
    console.log('Instituciones:', results);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

check();
