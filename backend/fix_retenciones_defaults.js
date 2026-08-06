import db from './src/models/index.js';

async function fixRetencionesDefaults() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conectado a la base de datos PostgreSQL.');

    console.log('Estableciendo DEFAULT CURRENT_TIMESTAMP para created_at, updated_at, fecha_hora...');
    await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;');
    await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;');
    await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN fecha_hora SET DEFAULT CURRENT_TIMESTAMP;');
    
    // También por si acaso en vehiculos y demas tablas
    const otherTables = ['vehiculos', 'vehicle_status_log', 'fotos_retenciones', 'historial_movimientos', 'resoluciones_judiciales', 'depositos', 'usuarios', 'instituciones', 'notificaciones'];
    for (const t of otherTables) {
      try {
        await db.sequelize.query(`ALTER TABLE "${t}" ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;`);
      } catch(e) {}
      try {
        await db.sequelize.query(`ALTER TABLE "${t}" ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;`);
      } catch(e) {}
    }

    console.log('Notificando a Supabase PostgREST para recargar el esquema...');
    await db.sequelize.query("NOTIFY pgrst, 'reload schema';");

    console.log('🎉 Defaults para created_at, updated_at y fecha_hora fijados exitosamente en PostgreSQL.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ajustando defaults:', error);
    process.exit(1);
  }
}

fixRetencionesDefaults();
