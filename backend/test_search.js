import { Op } from 'sequelize';
import db from './src/models/index.js';

async function testQuery() {
  try {
    await db.sequelize.authenticate();
    
    const { count, rows } = await db.Retencion.findAndCountAll({
      where: {
        numero_expediente: {
          [Op.iLike]: '%RET-2026-000001%'
        }
      },
      include: [
        {
          model: db.Institucion,
          as: 'institucion',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha_hora', 'DESC']],
      limit: 10,
      offset: 0,
      distinct: true
    });

    console.log(`Count: ${count}`);
    console.log('Rows:', JSON.stringify(rows, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testQuery();
