import db from './src/models/index.js';

async function cleanAll() {
  try {
    await db.sequelize.authenticate();
    const tables = [
      'vehicle_status_log',
      'historial_movimientos',
      'fotos_retenciones',
      'resoluciones_judiciales',
      'depositos',
      'notificaciones'
    ];
    for (const t of tables) {
      try {
        await db.sequelize.query(`DELETE FROM ${t} WHERE retencion_id NOT IN (SELECT id FROM retenciones)`);
        console.log(`Orphans cleaned in ${t}`);
      } catch (err) {
        // Table might not exist or not have retencion_id
        console.log(`Skipped ${t}: ${err.message}`);
      }
    }
    console.log('✅ ALL orphans cleaned');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
cleanAll();
