import { Op } from 'sequelize';
import db from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { notificarNuevaRetencion, notificarVehiculoEnCamino } from './notificacionService.js';

const { Retencion, Vehiculo, Institucion, Usuario, VehicleStatusLog, FotoRetencion, HistorialMovimiento, ResolucionJudicial, Deposito, PersonaInvolucrada } = db;

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
        estado_actual: 'RETENIDO',
        // Campos del protocolo policial
        numero_comision: data.numero_comision || null,
        numero_movil: data.numero_movil || null,
        colaboracion_especial: data.colaboracion_especial || [],
        coopera_policia_judicial: data.coopera_policia_judicial ?? null,
        queda_consigna: data.queda_consigna ?? false,
        consigna_nombre: data.consigna_nombre || null,
        consigna_cargo: data.consigna_cargo || null,
        consigna_dependencia: data.consigna_dependencia || null,
        consigna_telefono: data.consigna_telefono || null,
        tipo_traslado: data.tipo_traslado || null,
        grua_dominio: data.grua_dominio || null,
        grua_empresa: data.grua_empresa || null,
        hora_hecho: data.hora_hecho || null,
        numero_hecho: data.numero_hecho || null,
        mecanica_hecho: data.mecanica_hecho || null,
        tiene_camaras_privadas: data.tiene_camaras_privadas ?? null,
        tiene_carteles_nomenclatura: data.tiene_carteles_nomenclatura ?? null,
        tiene_reductores_velocidad: data.tiene_reductores_velocidad ?? null,
        estado_iluminacion: data.estado_iluminacion || null,
        estado_calzada: data.estado_calzada || null,
        croquis_url: data.croquis_url || null,
        acta_inspeccion_url: data.acta_inspeccion_url || null,
        deposito_institucion_id: data.deposito_institucion_id || null,
        inventario: data.inventario || {}
      }, { transaction });

      // Guardar personas involucradas si vinieron en el payload
      if (Array.isArray(data.personas_involucradas) && data.personas_involucradas.length > 0) {
        await Promise.all(
          data.personas_involucradas.map(persona =>
            PersonaInvolucrada.create({
              ...persona,
              retencion_id: retencion.id,
            }, { transaction })
          )
        );
      }

      await retencion.reload({ transaction });

      const qrUrl = `${SIGEVIR_DOMAIN}/r/${retencion.numero_expediente}`;
      await retencion.update({ qr_url: qrUrl }, { transaction });

      await VehicleStatusLog.create({
        retencion_id: retencion.id,
        estado: 'RETENIDO',
        usuario_id: agente.userId,
        observaciones: `Retencin creada. Motivo: ${data.motivo_retencion}`
      }, { transaction });

      await HistorialMovimiento.create({
        retencion_id: retencion.id,
        usuario_id: agente.userId,
        tipo_movimiento: 'RETENCION_CREADA',
        destino: `${data.calle_direccion}, ${data.localidad}, ${data.provincia}`,
        observaciones: `Nueva retencin registrada por agente. Dominio: ${dominioNorm}`
      }, { transaction });

      await transaction.commit();

      // Disparar notificacin (no bloquea la respuesta)                        
      notificarNuevaRetencion(
        retencion,
        agente?.nombre_completo || agente?.email || 'Agente'
      ).catch(err => logger.error(`Error notificando: ${err.message}`));
      
      // Si el agente eligió un depósito, notificar a ese depósito específico
      if (retencion.deposito_institucion_id) {
        const depositoElegido = await db.DepositoInstitucion.findByPk(retencion.deposito_institucion_id);
        if (depositoElegido) {
          notificarVehiculoEnCamino(
            retencion,
            depositoElegido,
            agente?.nombre_completo || agente?.email || 'Agente'
          ).catch(err => logger.error(`Error notificando vehículo en camino: ${err.message}`));
        }
      }   //                                                                          


      logger.info(`Retencin creada exitosamente: ${retencion.numero_expediente} por usuario ${agente.userId}`);

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
      logger.error(`Error al crear retenci�n: ${error.message}`);

      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al crear la retenci�n', 500);
    }
  }

  async subirFotos(retencionId, files, descripciones = [], user) {
    const retencion = await Retencion.findByPk(retencionId);
    if (!retencion) {
      throw new AppError('Retenci�n no encontrada', 404);
    }

    if (user.role !== 'admin' && retencion.institucion_id !== user.institucion_id) {
      throw new AppError('No tiene permisos para cargar fotos a esta retenci�n', 403);
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
        observaciones: `Se cargaron ${files.length} foto(s) a la retenci�n`
      }, { transaction });

      await transaction.commit();

      logger.info(`${files.length} fotos cargadas para retenci�n ${retencionId} por usuario ${user.userId}`);

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
        { model: PersonaInvolucrada, as: 'personas_involucradas' },
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

    // Buscar nombre actualizado en la tabla perfiles de Supabase si existe
    if (retencion.agente_id) {
      try {
        const [perfilRow] = await db.sequelize.query(
          `SELECT nombre_completo, email FROM perfiles WHERE id = :agenteId LIMIT 1`,
          { replacements: { agenteId: retencion.agente_id }, type: db.sequelize.QueryTypes.SELECT }
        );
        if (perfilRow && perfilRow.nombre_completo) {
          if (!retencion.agente) {
            retencion.setDataValue('agente', { id: retencion.agente_id, nombre_completo: perfilRow.nombre_completo, email: perfilRow.email });
          } else {
            retencion.agente.setDataValue('nombre_completo', perfilRow.nombre_completo);
          }
        }
      } catch (e) {
        logger.warn(`No se pudo sincronizar perfil de agente: ${e.message}`);
      }
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
      throw new AppError('Retenci�n no encontrada', 404);
    }

    if (retencion.estado_actual !== 'RETENIDO') {
      throw new AppError(
        `No se puede editar una retenci�n en estado "${retencion.estado_actual}". Solo es editable en estado RETENIDO.`,
        409
      );
    }

    if (user.role !== 'admin' && retencion.agente_id !== user.userId) {
      throw new AppError('No tiene permisos para editar esta retenci�n', 403);
    }

    const transaction = await db.sequelize.transaction();

    try {
      const camposVehiculo = ['marca', 'modelo', 'anio', 'color', 'tipo_vehiculo', 'numero_motor', 'numero_cuadro', 'danios_visibles'];
      const camposRetencion = ['motivo_retencion', 'versus', 'num_cooperacion', 'num_sumario', 'num_sac', 'titular_nombre', 'titular_dni', 'titular_contacto', 'latitud', 'longitud', 'numero_comision', 'numero_movil', 'colaboracion_especial', 'coopera_policia_judicial', 'queda_consigna', 'consigna_nombre', 'consigna_cargo', 'consigna_dependencia', 'consigna_telefono', 'tipo_traslado', 'grua_dominio', 'grua_empresa', 'hora_hecho', 'numero_hecho', 'mecanica_hecho', 'tiene_camaras_privadas', 'tiene_carteles_nomenclatura', 'tiene_reductores_velocidad', 'estado_iluminacion', 'estado_calzada', 'croquis_url', 'acta_inspeccion_url', 'inventario'];

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

      logger.info(`Retenci�n ${retencion.numero_expediente} editada por usuario ${user.userId}`);

      return retencion;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al editar retenci�n: ${error.message}`);

      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al editar la retenci�n', 500);
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
          throw new AppError('No tiene permisos para ver esta retenci�n', 403);
        }
        break;
      case 'deposito':
        if (retencion.deposito_id !== user.deposito_id) {
          throw new AppError('No tiene permisos para ver esta retenci�n', 403);
        }
        break;
      default:
        throw new AppError('Rol no reconocido', 403);
    }
  }
}

export default new RetencionService();
