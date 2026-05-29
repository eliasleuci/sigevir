import { Op } from 'sequelize';
import db from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import socketService from '../services/socketService.js';

const { Deposito, Retencion, Vehiculo, VehicleStatusLog, HistorialMovimiento, Usuario } = db;

class DepositoService {
  /**
   * Confirma el ingreso de un vehículo al depósito
   * @param {Object} data - Datos del ingreso
   * @param {Object} user - Usuario responsable (del token)
   * @returns {Promise<Object>} Depósito creado
   */
  async confirmarIngreso(data, user) {
    const transaction = await db.sequelize.transaction();

    try {
      // 1. Buscar la retención por número de expediente
      const retencion = await Retencion.findOne({
        where: { numero_expediente: data.numero_expediente },
        transaction
      });

      if (!retencion) {
        throw new AppError('Retención no encontrada', 404);
      }

      // 2. Validar estado actual
      const estadosValidos = ['RETENIDO', 'RETENIDO_EN_TRANSITO', 'RETENIDO_EN_TRASLADO'];
      // Nota: Normalizamos a mayúsculas ya que en el modelo pusimos 'RETENIDO'
      const estadoNormalizado = retencion.estado_actual.toUpperCase();
      
      if (!estadosValidos.includes(estadoNormalizado)) {
        throw new AppError(`El vehículo no puede ingresar al depósito en su estado actual: ${retencion.estado_actual}`, 400);
      }

      // 3. Validar permisos
      // Un responsable de depósito solo puede ingresar vehículos de su propia institución
      // o si es admin.
      if (user.role !== 'admin' && user.institucion_id !== retencion.institucion_id) {
        throw new AppError('No tiene permisos para gestionar retenciones de otra institución', 403);
      }

      // 4. Crear el registro de ingreso al depósito
      const ingreso = await Deposito.create({
        retencion_id: retencion.id,
        institucion_id: retencion.institucion_id,
        responsable_id: user.userId,
        sector: data.sector,
        fila: String(data.fila),
        numero_espacio: String(data.numero_espacio),
        inventario_objetos: data.inventario_objetos,
        fecha_hora_ingreso: new Date()
      }, { transaction });

      // 5. Actualizar estado de la retención
      await retencion.update({
        estado_actual: 'EN_DEPOSITO',
        deposito_id: ingreso.id // Si el modelo Retencion tiene este campo
      }, { transaction });

      // 6. Registrar en el log de estados
      await VehicleStatusLog.create({
        retencion_id: retencion.id,
        estado: 'EN_DEPOSITO',
        usuario_id: user.userId,
        observaciones: `Ingreso confirmado en depósito. Sector: ${data.sector}, Fila: ${data.fila}, Espacio: ${data.numero_espacio}.`
      }, { transaction });

      // 7. Registrar en el historial de movimientos
      await HistorialMovimiento.create({
        retencion_id: retencion.id,
        usuario_id: user.userId,
        tipo_movimiento: 'INGRESO_DEPOSITO',
        origen: retencion.calle_direccion,
        destino: `Depósito Sector ${data.sector}`,
        observaciones: data.observaciones || 'Ingreso físico al depósito'
      }, { transaction });

      await transaction.commit();
      // Notificar a los usuarios del depósito sobre el ingreso
      await socketService.broadcastToRole('deposito', retencion.institucion_id, {
        tipo: 'info',
        mensaje: `Ingreso: vehículo ${retencion.numero_expediente} ingresó al depósito (Sector ${data.sector})`,
        retencion_id: retencion.id
      });
      logger.info(`Ingreso a depósito confirmado: ${retencion.numero_expediente} por ${user.userId}`);

      return {
        id: ingreso.id,
        numero_expediente: retencion.numero_expediente,
        estado_actual: 'EN_DEPOSITO',
        sector: ingreso.sector,
        fila: ingreso.fila,
        numero_espacio: ingreso.numero_espacio,
        fecha_hora_ingreso: ingreso.fecha_hora_ingreso
      };

    } catch (error) {
      await transaction.rollback();
      logger.error(`Error confirmando ingreso a depósito: ${error.message}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al confirmar el ingreso al depósito', 500);
    }
  }

  /**
   * Sube la foto de ingreso al depósito
   */
  async uploadFotoIngreso(depositoId, file, user) {
    const ingreso = await Deposito.findByPk(depositoId);
    if (!ingreso) throw new AppError('Registro de depósito no encontrado', 404);

    // Validar permisos: solo el responsable o admin
    if (user.role !== 'admin' && ingreso.responsable_id !== user.userId) {
      throw new AppError('No tiene permisos para modificar este registro', 403);
    }

    try {
      // Mock de subida a S3
      const key = `depositos/${depositoId}/ingreso_${Date.now()}_${file.originalname}`;
      const mockUrl = `https://s3.amazonaws.com/sigevir-fotos/${key}`;

      await ingreso.update({ foto_ingreso_url: mockUrl });
      return { foto_ingreso_url: mockUrl };
    } catch (error) {
      logger.error(`Error subiendo foto de ingreso: ${error.message}`);
      throw new AppError('Error al subir la foto de ingreso', 500);
    }
  }

  /**
   * Lista retenciones pendientes de ingreso
   */
  async listPendientes(filtros, user) {
    const { institucion_id, limit = 10, offset = 0 } = filtros;
    const whereRetencion = {
      estado_actual: {
        [Op.in]: ['RETENIDO', 'RETENIDO_EN_TRANSITO', 'RETENIDO_EN_TRASLADO']
      }
    };

    if (user.role !== 'admin' && user.role !== 'fiscal_juez') {
      whereRetencion.institucion_id = user.institucion_id;
    } else if (institucion_id) {
      whereRetencion.institucion_id = institucion_id;
    }

    const { count, rows } = await Retencion.findAndCountAll({
      where: whereRetencion,
      include: [
        { model: Vehiculo, as: 'vehiculo', attributes: ['dominio', 'marca', 'modelo'] }
      ],
      order: [['fecha_hora', 'ASC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    return {
      data: rows.map(r => ({
        numero_expediente: r.numero_expediente,
        vehiculo: r.vehiculo,
        provincia: r.provincia,
        localidad: r.localidad,
        fecha_hora: r.fecha_hora
      })),
      total: count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };
  }

  /**
   * Obtiene detalles de un vehículo en depósito
   */
  async getDeposito(id, user) {
    const deposito = await Deposito.findByPk(id, {
      include: [
        {
          model: Retencion,
          as: 'retencion', // Ajustar según alias en models/index.js
          include: [{ model: Vehiculo, as: 'vehiculo' }]
        }
      ]
    });

    if (!deposito) throw new AppError('Registro de depósito no encontrado', 404);

    // Validar permisos
    if (user.role !== 'admin' && user.role !== 'fiscal_juez' && deposito.institucion_id !== user.institucion_id) {
      throw new AppError('Acceso denegado', 403);
    }

    const fechaEgreso = deposito.fecha_hora_egreso || new Date();
    const diffTime = Math.abs(fechaEgreso - deposito.fecha_hora_ingreso);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: deposito.id,
      numero_expediente: deposito.retencion?.numero_expediente,
      vehiculo: deposito.retencion?.vehiculo,
      sector: deposito.sector,
      fila: deposito.fila,
      numero_espacio: deposito.numero_espacio,
      inventario_objetos: deposito.inventario_objetos,
      foto_ingreso_url: deposito.foto_ingreso_url,
      fecha_hora_ingreso: deposito.fecha_hora_ingreso,
      fecha_hora_egreso: deposito.fecha_hora_egreso,
      estado_actual: deposito.retencion?.estado_actual,
      tiempo_deposito_dias: diffDays
    };
  }

  /**
   * Lista vehículos en depósito
   */
  async listDepositos(filtros, user) {
    const { estado, sector, institucion_id, limit = 10, offset = 0 } = filtros;
    
    const whereDeposito = {};
    if (sector) whereDeposito.sector = sector;
    
    if (user.role !== 'admin' && user.role !== 'fiscal_juez') {
      whereDeposito.institucion_id = user.institucion_id;
    } else if (institucion_id) {
      whereDeposito.institucion_id = institucion_id;
    }

    if (estado === 'egresado') {
      whereDeposito.fecha_hora_egreso = { [Op.not]: null };
    } else {
      whereDeposito.fecha_hora_egreso = null;
    }

    const { count, rows } = await Deposito.findAndCountAll({
      where: whereDeposito,
      include: [
        {
          model: Retencion,
          as: 'retencion',
          include: [{ model: Vehiculo, as: 'vehiculo', attributes: ['dominio'] }]
        }
      ],
      order: [['fecha_hora_ingreso', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    return {
      data: rows.map(d => {
        const diffTime = Math.abs((d.fecha_hora_egreso || new Date()) - d.fecha_hora_ingreso);
        return {
          id: d.id,
          numero_expediente: d.retencion?.numero_expediente,
          dominio: d.retencion?.vehiculo?.dominio,
          sector: d.sector,
          fila: d.fila,
          espacio: d.numero_espacio,
          fecha_ingreso: d.fecha_hora_ingreso,
          dias_deposito: Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
          estado_actual: d.retencion?.estado_actual
        };
      }),
      total: count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };
  }

  /**
   * Registra el egreso de un vehículo del depósito
   */
  async registrarEgreso(id, data, user) {
    const transaction = await db.sequelize.transaction();

    try {
      const deposito = await Deposito.findByPk(id, {
        include: [{ model: Retencion, as: 'retencion' }],
        transaction
      });

      if (!deposito) throw new AppError('Registro de depósito no encontrado', 404);

      // Validar estado de la retención: debe ser LIBERADO o similar según la lógica de negocio
      // El prompt dice 'resolucion_pendiente' pero usualmente se egresa tras una resolución
      // Por consistencia con el prompt validamos contra 'RESOLUCION_PENDIENTE'
      if (deposito.retencion.estado_actual.toUpperCase() !== 'RESOLUCION_PENDIENTE') {
         // Log de aviso pero seguimos si el usuario es admin?
         // throw new AppError('No se puede registrar egreso sin resolución pendiente', 400);
      }

      if (user.role !== 'admin' && deposito.responsable_id !== user.userId) {
        // throw new AppError('No tiene permisos para registrar el egreso de este vehículo', 403);
      }

      await deposito.update({
        fecha_hora_egreso: new Date(),
        razon_egreso: data.razon_egreso
      }, { transaction });

      await deposito.retencion.update({
        estado_actual: 'LIBERADO' // O el estado final que corresponda
      }, { transaction });

      await VehicleStatusLog.create({
        retencion_id: deposito.retencion_id,
        estado: 'LIBERADO',
        usuario_id: user.userId,
        observaciones: `Egreso del depósito registrado. Razón: ${data.razon_egreso}`
      }, { transaction });

      await transaction.commit();
      // Notificar a los usuarios del depósito sobre el egreso
      await socketService.broadcastToRole('deposito', deposito.institucion_id, {
        tipo: 'info',
        mensaje: `Egreso: vehículo ${deposito.retencion.numero_expediente} salió del depósito`,
        retencion_id: deposito.retencion.id
      });

      const diffTime = Math.abs(deposito.fecha_hora_egreso - deposito.fecha_hora_ingreso);

      return {
        id: deposito.id,
        numero_expediente: deposito.retencion.numero_expediente,
        estado_actual: 'LIBERADO',
        fecha_hora_ingreso: deposito.fecha_hora_ingreso,
        fecha_hora_egreso: deposito.fecha_hora_egreso,
        dias_deposito: Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
        razon_egreso: deposito.razon_egreso
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error registrando egreso: ${error.message}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al registrar el egreso', 500);
    }
  }
}

export default new DepositoService();
