import db from './src/models/index.js';

async function check() {
  try {
    const retenciones = await db.Retencion.findAll({
      include: [{ model: db.FotoRetencion, as: 'fotos' }],
      order: [['fecha_hora', 'DESC']],
      limit: 3
    });

    for (const r of retenciones) {
      console.log(`Retencion ${r.id} (${r.dominio}): ${r.fotos.length} fotos`);
      if (r.fotos.length > 0) {
        console.log(r.fotos.map(f => f.url_s3).join('\n'));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

check();
