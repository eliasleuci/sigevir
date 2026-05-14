import { Op } from 'sequelize';
import db from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const { Retencion, Vehiculo, Institucion, Usuario, VehicleStatusLog, FotoRetencion, HistorialMovimiento } = db;

const SIGEVIR_DOMAIN = process.env.SIGEVIR_PUBLIC_DOMAIN || 'https://sigevir.dominio.com';

class RetencionService {
  /**
   * Crea una nueva retención de vehículo.
   * 1. Busca o crea el vehículo por dominio.
   * 2. Inserta la retención (numero_expediente lo genera el trigger de BD).
   * 3. Registra estado inicial en VehicleStatusLog.
   * 4. Registra movimiento inicial en HistorialMovimiento.
   * 5. Genera qr_url basada en numero_expediente.
   *
   * @param {Object}  data       - Datos del body ya validados por Joi
   * @param {Object}  agente     - req.user (token decodificado)
   * @returns {Promise<Object>}  Retención creada con expediente, QR, etc.
   */
  async crearRetencion(data, agente) {
    const transaction = await db.sequelize.transaction();

    try {
      // ── 1. Buscar o crear Vehículo ──────────────────────────────
      const dominioNorm = data.dominio.toUpperCase().trim();

      const [vehiculo, vehiculoCreado] = await Vehiculo.findOrCreate({
        where: { dominio: dominioNorm },
        defaults: {
          dominio: dominioNorm,
          marca: data.marca,
          modelo: data.modelo,
          anio: data.anio,
          color: data.color,
          tipo_vehiculo: data.tipo_vehiculo,
          numero_motor: data.numero_motor || null,
          numero_cuadro: data.numero_cuadro || null,
          danios_visibles: data.danios_visibles || null
        },
        transaction
      });

      // Si el vehículo ya existía, actualizar datos que pudieron cambiar
      if (!vehiculoCreado) {
        await vehiculo.update({
          marca: data.marca,
          modelo: data.modelo,
          anio: data.anio,
          color: data.color,
          tipo_vehiculo: data.tipo_vehiculo,
          numero_motor: data.numero_motor || vehiculo.numero_motor,
          numero_cuadro: data.numero_cuadro || vehiculo.numero_cuadro,
          danios_visibles: data.danios_visibles || vehiculo.danios_visibles
        }, { transaction });
      }

      // ── 2. Insertar Retención ───────────────────────────────────
      //    numero_expediente es generado automáticamente por el trigger
      //    de la BD. Lo omitimos aquí y lo leemos después del create/reload.
      const retencion = await Retencion.create({
        vehiculo_id: vehiculo.id,
        institucion_id: agente.institucion_id,
        agente_id: agente.userId,
        provincia: data.provincia,
        localidad: data.localidad,
        calle_direccion: data.calle_direccion,
        motivo_retencion: data.motivo_retencion,
        versus: data.versus || null,
        num_cooperacion: data.num_cooperacion || null,
        num_sumario: data.num_sumario || null,
        num_sac: data.num_sac || null,
        estado_actual: 'RETENIDO'
      }, { transaction });

      // Recargar para obtener numero_expediente generado por trigger
      await retencion.reload({ transaction });

      // ── 3. Generar qr_url y guardarla ───────────────────────────
      const qrUrl = `${SIGEVIR_DOMAIN}/r/${retencion.numero_expediente}`;
      await retencion.update({ qr_url: qrUrl }, { transaction });

      // ── 4. Registro en VehicleStatusLog (estado inicial) ────────
      await VehicleStatusLog.create({
        retencion_id: retencion.id,
        estado: 'RETENIDO',
        usuario_id: agente.userId,
        observaciones: `Retención creada. Motivo: ${data.motivo_retencion}`
      }, { transaction });

      // ── 5. Registro en HistorialMovimiento (auditoría) ──────────
      await HistorialMovimiento.create({
        retencion_id: retencion.id,
        usuario_id: agente.userId,
        tipo_movimiento: 'RETENCION_CREADA',
        destino: `${data.calle_direccion}, ${data.localidad}, ${data.provincia}`,
        observaciones: `Nueva retención registrada por agente. Dominio: ${dominioNorm}`
      }, { transaction });

      await transaction.commit();

      logger.info(`Retención creada exitosamente: ${retencion.numero_expediente} por usuario ${agente.userId}`);

      return {
        id: retencion.id,
        numero_expediente: retencion.numero_expediente,
        qr_url: qrUrl,
        acta_pdf_url: retencion.acta_pdf_url, // null por ahora, se genera en prompt siguiente
        estado_actual: retencion.estado_actual,
        created_at: retencion.createdAt
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al crear retención: ${error.message}`);

      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al crear la retención', 500);
    }
  }

  /**
   * Sube fotos a una retención existente.
   * En un entorno real las fotos irían a S3. Aquí simulamos la URL.
   *
   * @param {string}   retencionId  - UUID de la retención
   * @param {Array}    files        - Array de archivos Multer (req.files)
   * @param {string[]} descripciones - Descripciones opcionales
   * @param {Object}   user         - req.user
   * @returns {Promise<Object[]>}   Array de fotos creadas
   */
  async subirFotos(retencionId, files, descripciones = [], user) {
    // Validar existencia de la retención
    const retencion = await Retencion.findByPk(retencionId);
    if (!retencion) {
      throw new AppError('Retención no encontrada', 404);
    }

    // Validar permisos: solo agente de campo de esa institución
    if (user.role !== 'admin' && retencion.institucion_id !== user.institucion_id) {
      throw new AppError('No tiene permisos para cargar fotos a esta retención', 403);
    }

    // Validar cantidad mínima de fotos
    if (!files || files.length < 4) {
      throw new AppError('Debe cargar al menos 4 fotos', 400);
    }

    const transaction = await db.sequelize.transaction();

    try {
      // Obtener el último orden para continuar la secuencia
      const ultimaFoto = await FotoRetencion.findOne({
        where: { retencion_id: retencionId },
        order: [['orden', 'DESC']],
        transaction
      });
      let ordenBase = ultimaFoto ? ultimaFoto.orden + 1 : 1;

      const fotosCreadas = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const descripcion = descripciones[i] || null;

        // ── Simulación de subida a S3 ─────────────────────────────
        // En producción aquí iría: const url = await s3Service.upload(file.buffer, ...)
        const s3Key = `retenciones/${retencionId}/${Date.now()}_${file.originalname}`;
        const s3Url = `https://s3.amazonaws.com/sigevir-fotos/${s3Key}`;

        const foto = await FotoRetencion.create({
          retencion_id: retencionId,
          url_s3: s3Url,
          descripcion,
          orden: ordenBase + i
        }, { transaction });

        fotosCreadas.push({
          id: foto.id,
          url: foto.url_s3,
          descripcion: foto.descripcion,
          orden: foto.orden
        });
      }

      // Registrar en historial
      await HistorialMovimiento.create({
        retencion_id: retencionId,
        usuario_id: user.userId,
        tipo_movimiento: 'FOTOS_CARGADAS',
        observaciones: `Se cargaron ${files.length} foto(s) a la retención`
      }, { transaction });

      await transaction.commit();

      logger.info(`${files.length} fotos cargadas para retención ${retencionId} por usuario ${user.userId}`);

      return fotosCreadas;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al subir fotos: ${error.message}`);

      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al cargar las fotos', 500);
    }
  }

  /**
   * Obtiene los detalles completos de una retención.
   *
   * @param {string} retencionId - UUID
   * @param {Object} user        - req.user
   * @returns {Promise<Object>}
   */
  async obtenerRetencion(retencionId, user) {
    const retencion = await Retencion.findByPk(retencionId, {
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Institucion, as: 'institucion', attributes: ['id', 'nombre', 'tipo'] },
        { model: Usuario, as: 'agente', attributes: ['id', 'nombre', 'apellido', 'email'] },
        { model: FotoRetencion, as: 'fotos', attributes: ['id', 'url_s3', 'descripcion', 'orden'], order: [['orden', 'ASC']] },
        {
          model: VehicleStatusLog,
          as: 'status_logs',
          attributes: ['id', 'estado', 'timestamp', 'observaciones'],
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'] }],
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    if (!retencion) {
      throw new AppError('Retención no encontrada', 404);
    }

    // ── Validar permisos según rol ──────────────────────────────
    this._validarPermisoLectura(retencion, user);

    return retencion;
  }

  /**
   * Lista retenciones con filtros y paginación.
   *
   * @param {Object} filtros - Query params validados
   * @param {Object} user    - req.user
   * @returns {Promise<Object>} { data, total, limit, offset }
   */
  async listarRetenciones(filtros, user) {
    const { estado, institucion_id, fecha_desde, fecha_hasta, limit = 10, offset = 0 } = filtros;

    const where = {};

    // Filtrar por institución según rol del usuario
    if (user.role === 'agente_campo' || user.role === 'controlador') {
      where.institucion_id = user.institucion_id;
    } else if (user.role === 'deposito') {
      where.deposito_id = user.deposito_id || null;
    } else if (institucion_id && (user.role === 'admin' || user.role === 'fiscal_juez')) {
      where.institucion_id = institucion_id;
    }

    if (estado) {
      where.estado_actual = estado.toUpperCase();
    }

    if (fecha_desde || fecha_hasta) {
      where.fecha_hora = {};
      if (fecha_desde) where.fecha_hora[Op.gte] = new Date(fecha_desde);
      if (fecha_hasta) where.fecha_hora[Op.lte] = new Date(fecha_hasta);
    }

    const { count, rows } = await Retencion.findAndCountAll({
      where,
      include: [
        { model: Vehiculo, as: 'vehiculo', attributes: ['dominio', 'marca', 'modelo', 'color'] },
        { model: Institucion, as: 'institucion', attributes: ['id', 'nombre'] }
      ],
      order: [['fecha_hora', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    return {
      data: rows.map(r => ({
        id: r.id,
        numero_expediente: r.numero_expediente,
        dominio: r.vehiculo?.dominio,
        marca: r.vehiculo?.marca,
        modelo: r.vehiculo?.modelo,
        estado_actual: r.estado_actual,
        fecha_hora: r.fecha_hora,
        institucion: r.institucion?.nombre
      })),
      total: count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };
  }

  /**
   * Edita una retención existente (solo si estado = 'RETENIDO').
   *
   * @param {string} retencionId - UUID
   * @param {Object} data        - Campos a actualizar (validados por Joi)
   * @param {Object} user        - req.user
   * @returns {Promise<Object>}   Retención actualizada
   */
  async editarRetencion(retencionId, data, user) {
    const retencion = await Retencion.findByPk(retencionId, {
      include: [{ model: Vehiculo, as: 'vehiculo' }]
    });

    if (!retencion) {
      throw new AppError('Retención no encontrada', 404);
    }

    // Solo editable si aún está en tránsito
    if (retencion.estado_actual !== 'RETENIDO') {
      throw new AppError(
        `No se puede editar una retención en estado "${retencion.estado_actual}". Solo es editable en estado RETENIDO.`,
        409
      );
    }

    // Solo admin o el agente que la creó puede editar
    if (user.role !== 'admin' && retencion.agente_id !== user.userId) {
      throw new AppError('No tiene permisos para editar esta retención', 403);
    }

    const transaction = await db.sequelize.transaction();

    try {
      // Separar campos de vehículo vs campos de retención
      const camposVehiculo = ['marca', 'modelo', 'anio', 'color', 'tipo_vehiculo', 'numero_motor', 'numero_cuadro', 'danios_visibles'];
      const camposRetencion = ['motivo_retencion', 'versus', 'num_cooperacion', 'num_sumario', 'num_sac', 'titular_nombre', 'titular_dni', 'titular_contacto'];

      const vehiculoUpdate = {};
      const retencionUpdate = {};

      for (const [key, value] of Object.entries(data)) {
        if (camposVehiculo.includes(key)) vehiculoUpdate[key] = value;
        else if (camposRetencion.includes(key)) retencionUpdate[key] = value;
      }

      if (Object.keys(vehiculoUpdate).length > 0) {
        await retencion.vehiculo.update(vehiculoUpdate, { transaction });
      }

      if (Object.keys(retencionUpdate).length > 0) {
        await retencion.update(retencionUpdate, { transaction });
      }

      // Registrar en historial
      await HistorialMovimiento.create({
        retencion_id: retencionId,
        usuario_id: user.userId,
        tipo_movimiento: 'EDICION',
        observaciones: `Campos editados: ${Object.keys(data).join(', ')}`
      }, { transaction });

      await transaction.commit();

      // Recargar con relaciones
      await retencion.reload({
        include: [{ model: Vehiculo, as: 'vehiculo' }]
      });

      logger.info(`Retención ${retencion.numero_expediente} editada por usuario ${user.userId}`);

      return retencion;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al editar retención: ${error.message}`);

      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al editar la retención', 500);
    }
  }

  /**
   * Valida que el usuario tenga permisos de lectura sobre la retención.
   * @private
   */
  _validarPermisoLectura(retencion, user) {
    switch (user.role) {
      case 'admin':
      case 'fiscal_juez':
        // Ve todo
        break;
      case 'agente_campo':
      case 'controlador':
        if (retencion.institucion_id !== user.institucion_id) {
          throw new AppError('No tiene permisos para ver esta retención', 403);
        }
        break;
      case 'deposito':
        if (retencion.deposito_id !== user.deposito_id) {
          throw new AppError('No tiene permisos para ver esta retención', 403);
        }
        break;
      default:
        throw new AppError('Rol no reconocido', 403);
    }
  }
}

export default new RetencionService();
