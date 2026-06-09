import db from './src/models/index.js';

async function truncateAndSync() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    console.log('Truncating retenciones...');
    await db.sequelize.query('TRUNCATE TABLE retenciones CASCADE;');
    console.log('Truncate complete.');

    console.log('Running sync with alter: true...');
    await db.sequelize.sync({ alter: true });
    console.log('Sync complete!');
  } catch (error) {
    console.error('Error during truncate/sync:', error);
  } finally {
    process.exit(0);
  }
}

truncateAndSync();
