import db from './src/models/index.js';

async function cleanup() {
  try {
    await db.sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Use TRUNCATE CASCADE to bypass all model hooks and foreign key constraints
    console.log('Truncando tabla de retenciones y todas sus dependencias (CASCADE)...');
    await db.sequelize.query('TRUNCATE TABLE retenciones CASCADE;');

    console.log('✨ Base de datos limpiada correctamente. Todas las retenciones y dependencias han sido eliminadas.');
    process.exit(0);
  } catch (error) {
    console.error('Error limpiando la base de datos:', error);
    process.exit(1);
  }
}

cleanup();
