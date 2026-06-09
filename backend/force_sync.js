import db from './src/models/index.js';

async function syncDB() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    console.log('Running sync with alter: true...');
    await db.sequelize.sync({ alter: true });
    console.log('Sync complete!');
  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    process.exit(0);
  }
}

syncDB();
