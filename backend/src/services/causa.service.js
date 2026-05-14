import { Op } from 'sequelize';
import db from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const { Retencion, Vehiculo, Institucion, Usuario, FotoRetencion, Deposito, ResolucionJudicial, VehicleStatusLog, HistorialMovimiento } = db;

class CausaService {
  /**
   * Busca causas (retenciones) por diversos criterios
   */
  async buscarCausas(query, user) {
    const { numero_expediente, dominio, dni_titular } = query;
    
    const whereRetencion = {};
    if (numero_expediente) whereRetencion.numero_expediente = { [Op.iLike]: `%${numero_expediente}%` };
    if (dni_titular) whereRetencion.titular_dni = { [Op.iLike]: `%${dni_titular}%` };

    // Filtro por institución si no es admin/fiscal
    if (user.role !== 'admin' && user.role !== 'fiscal_juez') {
      whereRetencion.institucion_id = user.institucion_id;
    }

    const whereVehiculo = {};
    if (dominio) whereVehiculo.dominio = { [Op.iLike]: `%${dominio}%` };

    const resultados = await Retencion.findAll({
      where: whereRetencion,
      include: [
        {
          model: Vehiculo,
          as: 'vehiculo',
          where: Object.keys(whereVehiculo).length > 0 ? whereVehiculo : undefined,
          required: Object.keys(whereVehiculo).length > 0
        }
      ],
      limit: 50,
      order: [['fecha_hora', 'DESC']]
    });

    return resultados.map(r => ({
      numero_expediente: r.numero_expediente,
      dominio: r.vehiculo?.dominio,
      estado_actual: r.estado_actual,
      fecha_retencion: r.fecha_hora,
      provincia: r.provincia,
      localidad: r.localidad
    }));
  }

  /**
   * Obtiene el historial COMPLETO de una causa por número de expediente
   */
  async getHistorialCompleto(numeroExpediente, user) {
    const retencion = await Retencion.findOne({
      where: { numero_expediente: numeroExpediente },
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Institucion, as: 'institucion', attributes: ['id', 'nombre', 'tipo', 'jurisdiccion'] },
        { model: Usuario, as: 'agente', attributes: ['nombre', 'apellido', 'email'] },
        { model: FotoRetencion, as: 'fotos', attributes: ['id', 'url_s3', 'descripcion', 'orden'] },
        { 
          model: Deposito, 
          as: 'deposito_activo', // Ajustar alias según models/index.js
          include: [{ model: Usuario, as: 'responsable', attributes: ['nombre', 'apellido'] }]
        },
        { 
          model: ResolucionJudicial, 
          as: 'resolucion', 
          include: [{ model: Usuario, as: 'usuario_judicial', attributes: ['nombre', 'apellido'] }]
        },
        {
          model: VehicleStatusLog,
          as: 'status_logs',
          include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }],
          order: [['timestamp', 'ASC']]
        }
      ]
    });

    if (!retencion) throw new AppError('Causa no encontrada', 404);

    // Validar permisos
    if (user.role !== 'admin' && user.role !== 'fiscal_juez' && retencion.institucion_id !== user.institucion_id) {
      throw new AppError('Acceso denegado a esta causa', 403);
    }

    // Cálculo de permanencia
    let diasPermanencia = 0;
    if (retencion.deposito_activo) {
      const fin = retencion.deposito_activo.fecha_hora_egreso || new Date();
      diasPermanencia = Math.ceil(Math.abs(fin - retencion.deposito_activo.fecha_hora_ingreso) / (1000 * 60 * 60 * 24));
    }

    return {
      expediente: {
        numero: retencion.numero_expediente,
        estado_actual: retencion.estado_actual,
        fecha_creacion: retencion.createdAt
      },
      vehiculo: {
        dominio: retencion.vehiculo?.dominio,
        marca: retencion.vehiculo?.marca,
        modelo: retencion.vehiculo?.modelo,
        anio: retencion.vehiculo?.anio,
        color: retencion.vehiculo?.color,
        tipo: retencion.vehiculo?.tipo_vehiculo,
        numero_motor: retencion.vehiculo?.numero_motor,
        numero_cuadro: retencion.vehiculo?.numero_cuadro,
        danios_visibles: retencion.vehiculo?.danios_visibles
      },
      retencion: {
        fecha_hora: retencion.fecha_hora,
        provincia: retencion.provincia,
        localidad: retencion.localidad,
        calle_direccion: retencion.calle_direccion,
        motivo: retencion.motivo_retencion,
        versus: retencion.versus,
        num_cooperacion: retencion.num_cooperacion,
        agente: {
          nombre: `${retencion.agente?.nombre} ${retencion.agente?.apellido}`,
          email: retencion.agente?.email
        },
        titular: {
          nombre: retencion.titular_nombre,
          dni: retencion.titular_dni,
          contacto: retencion.titular_contacto
        }
      },
      fotos_retencion: retencion.fotos.map(f => ({
        id: f.id,
        url: f.url_s3,
        descripcion: f.descripcion,
        orden: f.orden
      })),
      deposito: retencion.deposito_activo ? {
        sector: retencion.deposito_activo.sector,
        fila: retencion.deposito_activo.fila,
        espacio: retencion.deposito_activo.numero_espacio,
        fecha_ingreso: retencion.deposito_activo.fecha_hora_ingreso,
        fecha_egreso: retencion.deposito_activo.fecha_hora_egreso,
        dias_permanencia: diasPermanencia,
        inventario: retencion.deposito_activo.inventario_objetos,
        foto_ingreso_url: retencion.deposito_activo.foto_ingreso_url
      } : null,
      resolucion: retencion.resolucion ? {
        tipo: retencion.resolucion.tipo,
        fecha: retencion.resolucion.fecha_emision,
        documento_url: retencion.resolucion.documento_url,
        usuario_judicial: `${retencion.resolucion.usuario_judicial?.nombre} ${retencion.resolucion.usuario_judicial?.apellido}`
      } : null,
      estados_historico: retencion.status_logs.map(l => ({
        estado: l.estado,
        timestamp: l.timestamp,
        usuario: {
          nombre: `${l.usuario?.nombre} ${l.usuario?.apellido}`,
          rol: l.usuario?.role // Nota: Necesitaría incluir role en el include si se desea
        },
        observaciones: l.observaciones
      }))
    };
  }

  /**
   * Emite una resolución judicial para una causa
   */
  async emitirResolucion(data, user) {
    const transaction = await db.sequelize.transaction();
    try {
      // 1. Buscar retención y validar estado
      const retencion = await Retencion.findOne({
        where: { numero_expediente: data.numero_expediente },
        transaction
      });

      if (!retencion) throw new AppError('Expediente no encontrado', 404);
      
      if (retencion.estado_actual !== 'EN_DEPOSITO') {
        throw new AppError(`No se puede emitir resolución. El vehículo está en estado: ${retencion.estado_actual}. Debe estar EN_DEPOSITO.`, 400);
      }

      // 2. Crear registro de resolución
      const resolucion = await ResolucionJudicial.create({
        retencion_id: retencion.id,
        usuario_judicial_id: user.userId,
        tipo: data.tipo.toUpperCase(),
        documento_url: data.documento_url,
        observaciones: data.observaciones,
        fecha_emision: new Date()
      }, { transaction });

      // 3. Actualizar estado de retención
      await retencion.update({
        estado_actual: 'RESOLUCION_PENDIENTE'
      }, { transaction });

      // 4. Registrar en log de estados
      await VehicleStatusLog.create({
        retencion_id: retencion.id,
        estado: 'RESOLUCION_PENDIENTE',
        usuario_id: user.userId,
        observaciones: `Resolución judicial emitida (${data.tipo.toUpperCase()}). Pendiente de ejecución por depósito.`
      }, { transaction });

      // 5. Registrar en historial de movimientos
      await HistorialMovimiento.create({
        retencion_id: retencion.id,
        usuario_id: user.userId,
        tipo_movimiento: 'RESOLUCION_EMITIDA',
        observaciones: `Tipo: ${data.tipo.toUpperCase()}. Observaciones: ${data.observaciones}`
      }, { transaction });

      await transaction.commit();
      logger.info(`Resolución judicial emitida para ${data.numero_expediente} por ${user.userId}`);

      return {
        id: resolucion.id,
        numero_expediente: retencion.numero_expediente,
        tipo: resolucion.tipo,
        estado_actual: 'RESOLUCION_PENDIENTE',
        fecha_emision: resolucion.fecha_emision,
        documento_url: resolucion.documento_url
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error emitiendo resolución: ${error.message}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al procesar la resolución judicial', 500);
    }
  }

  /**
   * Lista causas pendientes de resolución
   */
  async listPorResolver(query, user) {
    const { limit = 10, offset = 0, institucion_id } = query;

    const whereRetencion = {
      estado_actual: 'EN_DEPOSITO'
    };

    if (user.role !== 'admin' && user.role !== 'fiscal_juez') {
      whereRetencion.institucion_id = user.institucion_id;
    } else if (institucion_id) {
      whereRetencion.institucion_id = institucion_id;
    }

    const { count, rows } = await Retencion.findAndCountAll({
      where: whereRetencion,
      include: [
        { model: Vehiculo, as: 'vehiculo', attributes: ['dominio'] },
        // Queremos las que NO tengan resolución aún
        { 
          model: ResolucionJudicial, 
          as: 'resolucion', 
          required: false 
        }
      ],
      // Sequelize filter for null association
      // where: { '$resolucion.id$': null }, // Opcional si no se usa association proxy
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['fecha_hora', 'ASC']]
    });

    // Nota: findAndCountAll con required: false y filtros sobre la relación puede ser complejo
    // Aquí filtramos manualmente o ajustamos la query.
    const filtrados = rows.filter(r => !r.resolucion);

    return {
      data: filtrados.map(r => ({
        numero_expediente: r.numero_expediente,
        dominio: r.vehiculo?.dominio,
        dias_pendiente: Math.ceil(Math.abs(new Date() - r.fecha_hora) / (1000 * 60 * 60 * 24)),
        fecha_retencion: r.fecha_hora,
        estado_actual: r.estado_actual
      })),
      total: count - (rows.length - filtrados.length) // Ajuste aproximado
    };
  }

  /**
   * Realiza un cambio extraordinario de estado por orden judicial
   */
  async cambioExtraordinario(id, data, user) {
    const transaction = await db.sequelize.transaction();
    try {
      const retencion = await Retencion.findByPk(id, { transaction });
      if (!retencion) throw new AppError('Retención no encontrada', 404);

      const estadoAnterior = retencion.estado_actual;
      
      await retencion.update({
        estado_actual: data.nuevo_estado.toUpperCase()
      }, { transaction });

      await VehicleStatusLog.create({
        retencion_id: retencion.id,
        estado: data.nuevo_estado.toUpperCase(),
        usuario_id: user.userId,
        observaciones: `CAMBIO EXTRAORDINARIO: ${data.justificacion}. Orden: ${data.documento_url}`
      }, { transaction });

      await HistorialMovimiento.create({
        retencion_id: retencion.id,
        usuario_id: user.userId,
        tipo_movimiento: 'CAMBIO_EXTRAORDINARIO',
        observaciones: `De ${estadoAnterior} a ${data.nuevo_estado.toUpperCase()}. Justificación: ${data.justificacion}`
      }, { transaction });

      await transaction.commit();
      return { success: true, nuevo_estado: retencion.estado_actual };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new CausaService();
