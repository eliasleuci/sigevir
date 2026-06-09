import db from './src/models/index.js';

async function fixDefaults() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    console.log('Setting DEFAULT NOW() for created_at and updated_at in retenciones...');
    await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN created_at SET DEFAULT NOW();');
    await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN updated_at SET DEFAULT NOW();');
    
    // Y ya que estamos, también para fecha_hora por las dudas, aunque Sequelize lo crea con defaultValue: NOW
    // pero veamos si en postgres tiene DEFAULT:
    await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN fecha_hora SET DEFAULT NOW();');
    
    console.log('Sending NOTIFY pgrst to reload schema...');
    await db.sequelize.query("NOTIFY pgrst, 'reload schema';");

    console.log('Defaults fixed.');
  } catch (error) {
    console.error('Error during ALTER TABLE:', error);
  } finally {
    process.exit(0);
  }
}

fixDefaults();
