import db from './src/models/index.js';

async function fixAllDefaults() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conexión establecida.');

    const tables = [
      'retenciones',
      'vehiculos',
      'vehicle_status_log',
      'fotos_retenciones',
      'historial_movimientos',
      'resoluciones_judiciales',
      'depositos',
      'usuarios',
      'instituciones',
      'notificaciones'
    ];

    for (const t of tables) {
      try {
        await db.sequelize.query(`ALTER TABLE "${t}" ALTER COLUMN created_at SET DEFAULT NOW();`);
      } catch (e) {
        console.log(`info (${t} created_at): ${e.message}`);
      }
      try {
        await db.sequelize.query(`ALTER TABLE "${t}" ALTER COLUMN updated_at SET DEFAULT NOW();`);
      } catch (e) {
        console.log(`info (${t} updated_at): ${e.message}`);
      }
    }

    // Asegurar defaults especificos para retenciones
    try {
      await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN fecha_hora SET DEFAULT NOW();');
      await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN estado_actual SET DEFAULT \'RETENIDO\';');
    } catch (e) {
      console.log(`info (retenciones specific): ${e.message}`);
    }

    console.log('Enviando NOTIFY pgrst a Supabase...');
    await db.sequelize.query("NOTIFY pgrst, 'reload schema';");

    console.log('🎉 Todos los campos DEFAULT NOW() configurados con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error configurando defaults:', error);
    process.exit(1);
  }
}

fixAllDefaults();
