import db from './src/models/index.js';

async function reloadSchema() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    console.log('Sending NOTIFY pgrst to reload schema...');
    await db.sequelize.query("NOTIFY pgrst, 'reload schema';");
    console.log('Reload notification sent.');
  } catch (error) {
    console.error('Error during NOTIFY:', error);
  } finally {
    process.exit(0);
  }
}

reloadSchema();
