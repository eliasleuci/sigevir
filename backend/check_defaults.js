import db from './src/models/index.js';

async function checkDefaults() {
  const [rows] = await db.sequelize.query(`
    SELECT column_name, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'perfiles' AND column_name IN ('activo', 'aprobado')
  `);
  console.log('Valores por defecto en PostgreSQL perfiles:', rows);
  process.exit(0);
}

checkDefaults().catch(e => { console.error(e); process.exit(1); });
