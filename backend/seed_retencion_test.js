import db from './src/models/index.js';

async function seedTestRetencion() {
  try {
    await db.sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Desactivar temporalmente las validaciones de claves foráneas para la sesión
    await db.sequelize.query("SET session_replication_role = 'replica';");

    // 1. Obtener o crear una Institucion
    let institucion = await db.Institucion.findOne();
    if (!institucion) {
      institucion = await db.Institucion.create({
        nombre: 'Institución de Prueba',
        tipo: 'POLICIA',
        provincia: 'Tierra del Fuego',
        localidad: 'Ushuaia',
        estado: 'ACTIVA'
      });
      console.log('Institución creada.');
    } else {
        console.log('Usando institución existente:', institucion.nombre);
    }

    // 2. Obtener o crear un Usuario (Agente)
    let agente = await db.Usuario.findOne({ where: { rol: 'agente_campo' } });
    if (!agente) {
      agente = await db.Usuario.findOne();
    }
    if (!agente) {
      agente = await db.Usuario.create({
        nombre_completo: 'Agente Prueba',
        email: 'agente.test@example.com',
        password_hash: 'hashedpassword',
        rol: 'agente_campo',
        institucion_id: institucion.id,
        activo: true
      });
      console.log('Agente creado.');
    } else {
        console.log('Usando agente existente:', agente.email);
    }

    // 3. Crear o buscar un Depósito
    let deposito = await db.Deposito.findOne();
    if (!deposito) {
        deposito = await db.Deposito.create({
            nombre: 'Depósito Judicial Test',
            ubicacion: 'Calle Falsa 123',
            capacidad_total: 100,
            capacidad_disponible: 99,
            institucion_id: institucion.id
        });
    }

    // 4. Crear la Retencion
    const retencionData = {
        numero_expediente: `EXP-TEST-${Math.floor(Math.random() * 10000)}`,
        dominio: `ABC${Math.floor(Math.random() * 900)}`,
        tipo_vehiculo: 'AUTOMOVIL',
        marca: 'Ford',
        modelo: 'Fiesta',
        color: 'Azul',
        nro_motor: 'MOT123456',
        nro_cuadro: 'CHAS123456',
        titular_nombre: 'Juan Perez Test',
        titular_dni: '20123456',
        titular_domicilio: 'Avenida Siempreviva 742',
        institucion_id: institucion.id,
        agente_id: agente.id,
        fecha_hora: new Date(),
        provincia: 'Tierra del Fuego',
        localidad: 'Ushuaia',
        calle_direccion: 'San Martin y Fadul',
        latitud: -54.8019,
        longitud: -68.3030,
        motivo_retencion: 'Falta de documentación, Alcoholemia positiva',
        versus: 'Control Rutinario',
        num_cooperacion: 'COOP-123',
        num_sumario: 'SUM-456',
        num_sac: 'SAC-789',
        titular_contacto: '2901445566',
        deposito_id: deposito.id,
        estado_actual: 'RETENIDO'
    };

    const retencion = await db.Retencion.create(retencionData);
    console.log('Retención creada con éxito, ID:', retencion.id, 'Expediente:', retencion.numero_expediente);

    // 5. Crear Resolución Judicial
    let juez = await db.Usuario.findOne({ where: { rol: 'fiscal_juez' } });
    if (!juez) {
        juez = await db.Usuario.create({
            nombre_completo: 'Juez Prueba',
            email: 'juez.test@example.com',
            password_hash: 'hashedpassword',
            rol: 'fiscal_juez',
            institucion_id: institucion.id,
            activo: true
        });
    }

    await db.ResolucionJudicial.create({
        retencion_id: retencion.id,
        usuario_judicial_id: juez.id,
        numero_resolucion: `RES-${Math.floor(Math.random() * 1000)}`,
        tipo: 'LIBERACION',
        fecha_emision: new Date(),
        observaciones: 'Se espera descargo del infractor.'
    });

    // 6. Crear Historial Movimiento
    await db.HistorialMovimiento.create({
        retencion_id: retencion.id,
        usuario_id: agente.id,
        tipo_movimiento: 'INGRESO',
        fecha_hora: new Date(),
        origen: 'Lugar de retención',
        destino: deposito.nombre,
        observaciones: 'Ingresado al depósito de prueba'
    });

    // 7. Crear Vehicle Status Log
    await db.VehicleStatusLog.create({
        retencion_id: retencion.id,
        usuario_id: agente.id,
        estado_anterior: 'NONE',
        estado_nuevo: 'RETENIDO',
        fecha_cambio: new Date(),
        motivo_cambio: 'Creación de retención',
        detalles_adicionales: { nota: "Generado automáticamente" }
    });

    // Restaurar los triggers/FKs
    await db.sequelize.query("SET session_replication_role = 'origin';");

    console.log('✨ Datos relacionados (Resolución, Historial, Status Log) creados correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error creando la retención de prueba:', error);
    try {
        await db.sequelize.query("SET session_replication_role = 'origin';");
    } catch(e) {}
    process.exit(1);
  }
}

seedTestRetencion();
