import db from './src/models/index.js';

async function runMigration() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.query("ALTER TABLE depositos ADD COLUMN IF NOT EXISTS documentos_egreso JSONB DEFAULT '{}'::jsonb;");
    await db.sequelize.query("ALTER TABLE depositos ADD COLUMN IF NOT EXISTS quien_retira VARCHAR(255);");
    await db.sequelize.query("ALTER TABLE depositos ADD COLUMN IF NOT EXISTS dni_quien_retira VARCHAR(50);");
    console.log('Migration 006 applied successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

runMigration();
