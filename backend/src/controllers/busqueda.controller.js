import { Op } from 'sequelize';
import db from '../models/index.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

const { Retencion, Vehiculo, Institucion } = db;

class BusquedaController {
  /**
   * POST /api/busqueda/avanzada
   * Realiza una búsqueda multicriterio eficiente sobre retenciones y vehículos
   */
  busquedaAvanzada = async (req, res, next) => {
    const startTime = Date.now();
    try {
      const {
        dominio,
        numero_motor,
        numero_cuadro,
        dni_titular,
        numero_expediente,
        estado_actual,
        fecha_desde,
        fecha_hasta,
        institucion_id,
        limit = 10,
        offset = 0
      } = req.body;

      // Construcción dinámica de filtros para Retencion
      const whereRetencion = {};
      
      // Filtro por permisos de rol
      if (req.user.role !== 'admin' && req.user.role !== 'fiscal_juez') {
        whereRetencion.institucion_id = req.user.institucion_id;
      } else if (institucion_id) {
        whereRetencion.institucion_id = institucion_id;
      }

      if (numero_expediente) {
        whereRetencion.numero_expediente = { [Op.iLike]: `%${numero_expediente}%` };
      }

      if (estado_actual) {
        whereRetencion.estado_actual = estado_actual.toUpperCase();
      }

      if (dni_titular) {
        whereRetencion.titular_dni = { [Op.iLike]: `%${dni_titular}%` };
      }

      if (fecha_desde || fecha_hasta) {
        whereRetencion.fecha_hora = {};
        if (fecha_desde) whereRetencion.fecha_hora[Op.gte] = new Date(fecha_desde);
        if (fecha_hasta) whereRetencion.fecha_hora[Op.lte] = new Date(fecha_hasta);
      }

      // Filtros para la tabla Vehiculo
      const whereVehiculo = {};
      if (dominio) whereVehiculo.dominio = { [Op.iLike]: `%${dominio}%` };
      if (numero_motor) whereVehiculo.numero_motor = { [Op.iLike]: `%${numero_motor}%` };
      if (numero_cuadro) whereVehiculo.numero_cuadro = { [Op.iLike]: `%${numero_cuadro}%` };

      // Ejecutar query con joins
      const { count, rows } = await Retencion.findAndCountAll({
        where: whereRetencion,
        include: [
          {
            model: Vehiculo,
            as: 'vehiculo',
            where: Object.keys(whereVehiculo).length > 0 ? whereVehiculo : undefined,
            required: Object.keys(whereVehiculo).length > 0 // INNER JOIN si hay filtros de vehículo, LEFT JOIN si no
          },
          {
            model: Institucion,
            as: 'institucion',
            attributes: ['id', 'nombre']
          }
        ],
        order: [['fecha_hora', 'DESC']],
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        distinct: true // Necesario para count correcto con joins 1:N si los hubiera
      });

      const totalTime = Date.now() - startTime;

      res.status(200).json({
        success: true,
        resultados: rows.map(r => ({
          id: r.id,
          numero_expediente: r.numero_expediente,
          dominio: r.vehiculo?.dominio,
          marca: r.vehiculo?.marca,
          modelo: r.vehiculo?.modelo,
          color: r.vehiculo?.color,
          provincia: r.provincia,
          localidad: r.localidad,
          fecha_retencion: r.fecha_hora,
          estado_actual: r.estado_actual,
          institucion: r.institucion?.nombre
        })),
        total: count,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        tiempo_busqueda_ms: totalTime
      });

    } catch (error) {
      logger.error(`Error en búsqueda avanzada: ${error.message}`);
      next(error);
    }
  };
}

export default new BusquedaController();
