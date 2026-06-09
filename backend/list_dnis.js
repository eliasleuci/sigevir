import db from './src/models/index.js';

async function listDnis() {
  try {
    await db.sequelize.authenticate();
    const retenciones = await db.Retencion.findAll({
      attributes: ['dominio', 'titular_dni']
    });
    console.log(retenciones.map(r => r.toJSON()));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

listDnis();
