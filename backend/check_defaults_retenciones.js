import db from './src/models/index.js';

async function checkRetencionColumns() {
  try {
    await db.sequelize.authenticate();
    const [cols] = await db.sequelize.query(
      "SELECT column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name='retenciones'"
    );
    console.log('Columns detail for retenciones:');
    console.log(cols);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkRetencionColumns();
