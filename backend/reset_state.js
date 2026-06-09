import db from './src/models/index.js';

async function resetState() {
  try {
    await db.sequelize.authenticate();
    const retencionId = 'f2062d8b-9939-4bd9-a278-b98d3f98690a';
    
    // 1. Update retencion state back to RETENIDO
    await db.Retencion.update(
      { estado_actual: 'RETENIDO', deposito_id: null },
      { where: { id: retencionId } }
    );
    
    // 2. Delete the deposito record
    await db.Deposito.destroy({ where: { retencion_id: retencionId }, force: true });
    
    // 3. Delete the log entry using raw SQL
    await db.sequelize.query("DELETE FROM status_logs WHERE retencion_id = 'f2062d8b-9939-4bd9-a278-b98d3f98690a' AND estado = 'EN_DEPOSITO'");
    
    console.log('Vehicle state reset to RETENIDO successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

resetState();
