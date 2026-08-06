import db from './src/models/index.js';

async function seedSoloRetencion() {
  try {
    await db.sequelize.authenticate();

    const institucion_id = '3e23f6e0-eeeb-477a-99a5-ecb93e49a074';
    const agente_id = '40e03d39-aa66-4c47-b421-4ae2639a7b5b';
    const dominio = `RET${Math.floor(Math.random() * 900 + 100)}`;

    const retencion = await db.Retencion.create({
      nro_expediente: `RET-2026-${Math.floor(Math.random() * 90000 + 10000)}`,
      dominio,
      tipo_vehiculo: 'AUTO',
      marca: 'FORD',
      modelo: 'FOCUS GHIA',
      color: 'BLANCO',
      nro_motor: 'MOT-FD-55321',
      nro_cuadro: 'CUA-FD-77890',
      titular_nombre: 'MARTINEZ, LUCAS GABRIEL',
      titular_dni: '35789456',
      titular_domicilio: 'San Martín 456, Córdoba',
      motivo_retencion: 'Infracciones múltiples: falta de documentación y VTV vencida',
      observaciones: 'Vehículo en buen estado. Propietario presente al momento de la retención.',
      calle_direccion: 'Bv. San Juan 1800',
      localidad: 'Córdoba Capital',
      provincia: 'Córdoba',
      estado_actual: 'RETENIDO',
      institucion_id,
      agente_id,
    });

    await db.VehicleStatusLog.create({
      retencion_id: retencion.id,
      usuario_id: agente_id,
      estado: 'RETENIDO',
      observaciones: 'Retención inicial. Documentación vencida.',
      timestamp: new Date()
    });

    console.log('');
    console.log('✅ Retención creada exitosamente!');
    console.log('');
    console.log(`  🔍 Dominio: ${dominio}`);
    console.log(`  📄 Expediente: ${retencion.nro_expediente}`);
    console.log(`  🚗 Vehículo: Ford Focus Ghia Blanco`);
    console.log(`  👤 Titular: Martínez, Lucas Gabriel`);
    console.log(`  📍 Lugar: Bv. San Juan 1800, Córdoba`);
    console.log(`  📌 Estado: RETENIDO (listo para avanzar por los módulos)`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedSoloRetencion();
