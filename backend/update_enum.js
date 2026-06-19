import db from './src/models/index.js';

async function check() {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    await db.sequelize.query(`ALTER TYPE "enum_notificaciones_tipo" ADD VALUE IF NOT EXISTS 'USUARIO_PENDIENTE';`);
    await db.sequelize.query(`ALTER TYPE "enum_notificaciones_tipo" ADD VALUE IF NOT EXISTS 'EGRESO_VEHICULO';`);
    console.log('Enum updated successfully.');
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    process.exit(0);
  }
}

check();
