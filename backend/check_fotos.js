import db from './src/models/index.js';

async function checkFotos() {
  try {
    await db.sequelize.authenticate();
    const fotos = await db.FotoRetencion.findAll();
    console.log('Total fotos in DB:', fotos.length);
    if (fotos.length > 0) {
      console.log('Sample foto:', fotos[0].toJSON());
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkFotos();
