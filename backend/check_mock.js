import db from './src/models/index.js';

async function checkMock() {
  try {
    await db.sequelize.authenticate();
    const retencion = await db.Retencion.findOne({
      where: { numero_expediente: 'RET-2026-000001' },
      raw: true
    });
    console.log(JSON.stringify(retencion, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkMock();
