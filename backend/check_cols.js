import db from './src/models/index.js';

async function getCols() {
  try {
    await db.sequelize.authenticate();
    const [results, metadata] = await db.sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'depositos'"
    );
    console.log('Columns:', results.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

getCols();
