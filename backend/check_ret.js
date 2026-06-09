import db from './src/models/index.js';

async function checkRet() {
  try {
    await db.sequelize.authenticate();
    const retenciones = await db.Retencion.findAll();
    console.log('Retenciones in DB:', JSON.stringify(retenciones, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkRet();
