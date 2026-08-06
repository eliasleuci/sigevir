import db from './src/models/index.js';

async function createTrigger() {
  try {
    await db.sequelize.authenticate();
    
    // Create the trigger function
    await db.sequelize.query(`
      CREATE OR REPLACE FUNCTION set_default_timestamps()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.created_at IS NULL THEN
          NEW.created_at = now();
        END IF;
        IF NEW.updated_at IS NULL THEN
          NEW.updated_at = now();
        END IF;
        IF NEW.fecha_hora IS NULL THEN
          NEW.fecha_hora = now();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Attach trigger to retenciones
    await db.sequelize.query(`
      DROP TRIGGER IF EXISTS ensure_timestamps ON retenciones;
    `);
    await db.sequelize.query(`
      CREATE TRIGGER ensure_timestamps
      BEFORE INSERT ON retenciones
      FOR EACH ROW
      EXECUTE FUNCTION set_default_timestamps();
    `);
    
    // Drop NOT NULL constraints just in case PostgREST still complains before the trigger runs
    await db.sequelize.query("ALTER TABLE retenciones ALTER COLUMN created_at DROP NOT NULL;");
    await db.sequelize.query("ALTER TABLE retenciones ALTER COLUMN updated_at DROP NOT NULL;");
    await db.sequelize.query("ALTER TABLE retenciones ALTER COLUMN fecha_hora DROP NOT NULL;");

    console.log('✅ Trigger created and NOT NULL constraints dropped');
    
    await db.sequelize.query("NOTIFY pgrst, 'reload schema';");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createTrigger();
