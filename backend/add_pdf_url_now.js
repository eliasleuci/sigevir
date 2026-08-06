import db from './src/models/index.js';

async function addPdfUrlNow() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL.');

    console.log('Agregando columna pdf_url a retenciones...');
    await db.sequelize.query('ALTER TABLE retenciones ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(255);');
    
    console.log('Asegurando DEFAULT NOW() para created_at, updated_at, fecha_hora...');
    await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;');
    await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;');
    await db.sequelize.query('ALTER TABLE retenciones ALTER COLUMN fecha_hora SET DEFAULT CURRENT_TIMESTAMP;');

    console.log('Enviando NOTIFY pgrst a Supabase PostgREST...');
    await db.sequelize.query("NOTIFY pgrst, 'reload schema';");

    console.log('🎉 Columna pdf_url agregada y schema actualizado.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error agregando pdf_url:', error);
    process.exit(1);
  }
}

addPdfUrlNow();
