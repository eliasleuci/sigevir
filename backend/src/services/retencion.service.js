import { Op } from 'sequelize';
import db from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const { Retencion, Vehiculo, Institucion, Usuario, VehicleStatusLog, FotoRetencion, HistorialMovimiento, ResolucionJudicial, Deposito } = db;

const SIGEVIR_DOMAIN = process.env.SIGEVIR_PUBLIC_DOMAIN || 'https://sigevir.dominio.com';

class RetencionService {
  async crearRetencion(data, agente) {
    const transaction = await db.sequelize.transaction();

    try {
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

      const retencion = await Retencion.create({
        vehiculo_id: vehiculo.id,
        institucion_id: agente.institucion_id,
        agente_id: agente.userId,
        provincia: data.provincia,
        localidad: data.localidad,
        calle_direccion: data.calle_direccion,
        latitud: data.latitud || null,
        longitud: data.longitud || null,
        motivo_retencion: data.motivo_retencion,
        versus: data.versus || null,
        num_cooperacion: data.num_cooperacion || null,
        num_sumario: data.num_sumario || null,
        num_sac: data.num_sac || null,
        estado_actual: 'RETENIDO'
      }, { transaction });

      await retencion.reload({ transaction });

      const qrUrl = `${SIGEVIR_DOMAIN}/r/${retencion.numero_expediente}`;
      await retencion.update({ qr_url: qrUrl }, { transaction });

      await VehicleStatusLog.create({
        retencion_id: retencion.id,
        estado: 'RETENIDO',
        usuario_id: agente.userId,
        observaciones: `Retención creada. Motivo: ${data.motivo_retencion}`
      }, { transaction });

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
        acta_pdf_url: retencion.acta_pdf_url,
        estado_actual: retencion.estado_actual,
        created_at: retencion.createdAt,
        latitud: retencion.latitud,
        longitud: retencion.longitud
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al crear retención: ${error.message}`);

      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al crear la retención', 500);
    }
  }

  async subirFotos(retencionId, files, descripciones = [], user) {
    const retencion = await Retencion.findByPk(retencionId);
    if (!retencion) {
      throw new AppError('Retención no encontrada', 404);
    }

    if (user.role !== 'admin' && retencion.institucion_id !== user.institucion_id) {
      throw new AppError('No tiene permisos para cargar fotos a esta retención', 403);
    }

    if (!files || files.length < 4) {
      throw new AppError('Debe cargar al menos 4 fotos', 400);
    }

    const transaction = await db.sequelize.transaction();

    try {
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

  async obtenerRetencion(retencionId, user) {
    const retencion = await Retencion.findByPk(retencionId, {
      include: [
        { model: Institucion, as: 'institucion', attributes: ['id', 'nombre', 'tipo'] },
        { model: Usuario, as: 'agente', attributes: ['id', 'nombre_completo', 'email'] },
        { model: FotoRetencion, as: 'fotos', attributes: ['id', 'url_s3', 'descripcion', 'orden'], order: [['orden', 'ASC']] },
        { model: ResolucionJudicial, as: 'resolucion_judicial' },
          { model: Deposito, as: 'deposito_activo' },
        {
          model: VehicleStatusLog,
          as: 'status_logs',
          attributes: ['id', 'estado', 'timestamp', 'observaciones'],
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre_completo'] }],
          order: [['timestamp', 'DESC']]
        }
      ]
    });

    if (!retencion) {
      throw new AppError('Retención no encontrada', 404);
    }

    this._validarPermisoLectura(retencion, user);

    return retencion;
  }

  async listarRetenciones(filtros, user) {
    const { estado, institucion_id, fecha_desde, fecha_hasta, limit = 10, offset = 0 } = filtros;

    const where = {};

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
        dominio: r.dominio,
        marca: r.marca,
        modelo: r.modelo,
        estado_actual: r.estado_actual,
        fecha_hora: r.fecha_hora,
        institucion: r.institucion?.nombre,
        latitud: r.latitud,
        longitud: r.longitud
      })),
      total: count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };
  }

  async editarRetencion(retencionId, data, user) {
    const retencion = await Retencion.findByPk(retencionId, {
      include: [{ model: Vehiculo, as: 'vehiculo' }]
    });

    if (!retencion) {
      throw new AppError('Retención no encontrada', 404);
    }

    if (retencion.estado_actual !== 'RETENIDO') {
      throw new AppError(
        `No se puede editar una retención en estado "${retencion.estado_actual}". Solo es editable en estado RETENIDO.`,
        409
      );
    }

    if (user.role !== 'admin' && retencion.agente_id !== user.userId) {
      throw new AppError('No tiene permisos para editar esta retención', 403);
    }

    const transaction = await db.sequelize.transaction();

    try {
      const camposVehiculo = ['marca', 'modelo', 'anio', 'color', 'tipo_vehiculo', 'numero_motor', 'numero_cuadro', 'danios_visibles'];
      const camposRetencion = ['motivo_retencion', 'versus', 'num_cooperacion', 'num_sumario', 'num_sac', 'titular_nombre', 'titular_dni', 'titular_contacto', 'latitud', 'longitud'];

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

      await HistorialMovimiento.create({
        retencion_id: retencionId,
        usuario_id: user.userId,
        tipo_movimiento: 'EDICION',
        observaciones: `Campos editados: ${Object.keys(data).join(', ')}`
      }, { transaction });

      await transaction.commit();

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

  _validarPermisoLectura(retencion, user) {
    switch (user.role) {
      case 'admin':
      case 'fiscal_juez':
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
