import db from './src/models/index.js';

async function forceDefaults() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.query("ALTER TABLE retenciones ALTER COLUMN created_at SET DEFAULT now();");
    await db.sequelize.query("ALTER TABLE retenciones ALTER COLUMN updated_at SET DEFAULT now();");
    await db.sequelize.query("ALTER TABLE retenciones ALTER COLUMN fecha_hora SET DEFAULT now();");
    console.log('✅ Defaults for created_at, updated_at, fecha_hora forced to now()');
    
    const [cols] = await db.sequelize.query(
      "SELECT column_name, column_default FROM information_schema.columns WHERE table_name='retenciones' AND column_name='created_at'"
    );
    console.log('created_at details after:', cols);
    
    await db.sequelize.query("NOTIFY pgrst, 'reload schema';");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

forceDefaults();
