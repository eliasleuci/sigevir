import db from './src/models/index.js';

async function updateMockData() {
  try {
    await db.sequelize.authenticate();
    
    await db.Retencion.update({
      color: 'NEGRO',
      nro_motor: 'MOT-987654321',
      nro_cuadro: 'CHA-123456789',
      titular_nombre: 'Juan Pérez',
      titular_dni: '30.123.456',
      titular_domicilio: 'Av. Colón 1234, Córdoba'
    }, {
      where: { numero_expediente: 'RET-2026-000001' }
    });
    
    console.log('Record RET-2026-000001 updated with mock data!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

updateMockData();
