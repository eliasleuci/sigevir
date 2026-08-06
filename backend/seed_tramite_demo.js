import db from './src/models/index.js';

async function seedTramiteDemo() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conectado a la BD. Creando Retención lista para Trámite y Egreso...');

    const institucion_id = '3e23f6e0-eeeb-477a-99a5-ecb93e49a074';
    const agente_id = '40e03d39-aa66-4c47-b421-4ae2639a7b5b';

    const demoDomain = `TRAM${Math.floor(Math.random() * 1000)}`;

    // 1. Crear Retención en estado RESOLUCION_PENDIENTE
    // (Este es el estado que necesita el módulo "Trámites de Retiro" para mostrarla)
    const retencion = await db.Retencion.create({
      nro_expediente: `TRAM-2026-${Math.floor(Math.random() * 10000)}`,
      dominio: demoDomain,
      tipo_vehiculo: 'AUTO',
      marca: 'VOLKSWAGEN',
      modelo: 'GOL TREND',
      color: 'GRIS',
      nro_motor: 'MOT-VW-78451',
      nro_cuadro: 'CUA-VW-98213',
      titular_nombre: 'GOMEZ, ROBERTO CARLOS',
      titular_dni: '28456123',
      titular_domicilio: 'Rivadavia 789, Córdoba Capital',
      motivo_retencion: 'Conductor en estado de ebriedad, alcoholemia 1.2gr/l',
      observaciones: 'Propietario notificado. Solicitó trámite de recupero urgente.',
      calle_direccion: 'Av. Vélez Sarsfield 2100',
      localidad: 'Córdoba Capital',
      provincia: 'Córdoba',
      estado_actual: 'RESOLUCION_PENDIENTE',  // Estado para Tramite de Retiro
      institucion_id,
      agente_id,
    });
    console.log(`✅ Retención creada: ${retencion.nro_expediente} - Dominio: ${demoDomain}`);

    // 2. Status Logs - línea de tiempo completa hasta RESOLUCION_PENDIENTE
    await db.VehicleStatusLog.create({
      retencion_id: retencion.id, usuario_id: agente_id, estado: 'RETENIDO',
      observaciones: 'Retención inicial: conductor alcoholizado en vía pública.',
      timestamp: new Date(Date.now() - 86400000 * 3)
    });
    await db.VehicleStatusLog.create({
      retencion_id: retencion.id, usuario_id: agente_id, estado: 'EN_DEPOSITO',
      observaciones: 'Ingresado al depósito municipal.',
      timestamp: new Date(Date.now() - 86400000 * 2)
    });
    await db.VehicleStatusLog.create({
      retencion_id: retencion.id, usuario_id: agente_id, estado: 'RESOLUCION_PENDIENTE',
      observaciones: 'Juzgado emitió resolución. Pendiente de trámite de retiro por parte del titular.',
      timestamp: new Date(Date.now() - 86400000 * 1)
    });
    console.log('✅ Timeline / Status Logs creados (3 estados)');

    // 3. Depósito con ubicación física
    await db.Deposito.create({
      retencion_id: retencion.id,
      institucion_id,
      responsable_id: agente_id,
      sector: 'Sector B',
      fila: 'Fila 1',
      numero_espacio: 'Espacio 04',
      fecha_hora_ingreso: new Date(Date.now() - 86400000 * 2)
    });
    console.log('✅ Depósito físico registrado: Sector B, Fila 1, Espacio 04');

    // 4. Resolución Judicial emitida (da paso al trámite de retiro)
    await db.ResolucionJudicial.create({
      retencion_id: retencion.id,
      usuario_judicial_id: agente_id,
      tipo: 'LIBERACION',
      juzgado_interviniente: 'Juzgado Correccional N° 5',
      nro_resolucion: 'RES-JC5-2026-812',
      estado_resolucion: 'APROBADA',
      monto_multa: 85000.00,
      observaciones: 'Se autoriza el retiro previa acreditación de pago de multa y presentación de libreta de conducir vigente.',
      fecha_emision: new Date(Date.now() - 86400000 * 1),
      fecha_resolucion: new Date(Date.now() - 86400000 * 1)
    });
    console.log('✅ Resolución Judicial creada: APROBADA - lista para trámite de retiro');

    // 5. Historial de movimientos
    await db.HistorialMovimiento.create({
      retencion_id: retencion.id, usuario_id: agente_id,
      tipo_movimiento: 'INGRESO_DEPOSITO',
      ubicacion_origen: 'Av. Vélez Sarsfield 2100',
      ubicacion_destino: 'Depósito Municipal (Sector B)',
      responsable_traslado: 'Grúa Municipal 07',
      observaciones: 'Traslado sin resistencia del conductor.',
      fecha_movimiento: new Date(Date.now() - 86400000 * 2)
    });
    console.log('✅ Historial de movimientos registrado');

    console.log('\n🎉 ¡Retención lista para demostrar el flujo completo de Tramite + Egreso!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  🔍 Buscar en Buscador: "${demoDomain}"`);
    console.log(`  📋 Módulo "Trámites de Retiro": ya aparece en la lista`);
    console.log(`  📤 Módulo "Egreso": disponible DESPUÉS de iniciar el trámite`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('  FLUJO PARA DEMOSTRAR:');
    console.log('  1. Ir a "Trámites de Retiro" → Buscar el vehículo → Iniciar Trámite');
    console.log('  2. El estado cambia a EN_TRAMITE');
    console.log('  3. Ir a "Registro de Egresos" → Confirmar egreso del vehículo');
    console.log('  4. El estado cambia a EGRESADO');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message || error);
    process.exit(1);
  }
}

seedTramiteDemo();
