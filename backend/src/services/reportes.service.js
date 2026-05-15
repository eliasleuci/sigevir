import db from '../models/index.js';
import { Op } from 'sequelize';

const { Retencion, Vehiculo, HistorialMovimiento } = db;

class ReportesService {
  async obtenerEstadisticas(filtros, user) {
    const where = {};
    if (user.role === 'agente_campo' || user.role === 'controlador') {
      where.institucion_id = user.institucion_id;
    } else if (filtros.institucion_id && (user.role === 'admin' || user.role === 'fiscal_juez')) {
      where.institucion_id = filtros.institucion_id;
    }

    const [
      totalRetenciones,
      retencionesPorEstado,
      retencionesPorMes,
      ultimasRetenciones,
      totalMovimientos
    ] = await Promise.all([
      Retencion.count({ where }),
      Retencion.findAll({
        where,
        attributes: ['estado_actual', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cantidad']],
        group: ['estado_actual'],
        raw: true
      }),
      Retencion.findAll({
        where: {
          ...where,
          fecha_hora: {
            [Op.gte]: db.sequelize.literal("NOW() - INTERVAL '12 months'")
          }
        },
        attributes: [
          [db.sequelize.fn('to_char', db.sequelize.col('fecha_hora'), 'YYYY-MM'), 'mes'],
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cantidad']
        ],
        group: [db.sequelize.fn('to_char', db.sequelize.col('fecha_hora'), 'YYYY-MM')],
        order: [[db.sequelize.literal('mes'), 'ASC']],
        raw: true
      }),
      Retencion.findAll({
        where,
        include: [
          { model: Vehiculo, as: 'vehiculo', attributes: ['dominio', 'marca', 'modelo'] }
        ],
        order: [['fecha_hora', 'DESC']],
        limit: 10,
        attributes: ['id', 'numero_expediente', 'estado_actual', 'fecha_hora', 'calle_direccion', 'localidad']
      }),
      HistorialMovimiento.count()
    ]);

    return {
      resumen: {
        total: totalRetenciones,
        totalMovimientos
      },
      porEstado: retencionesPorEstado.map(r => ({
        estado: r.estado_actual,
        cantidad: parseInt(r.cantidad, 10)
      })),
      porMes: retencionesPorMes.map(r => ({
        mes: r.mes,
        cantidad: parseInt(r.cantidad, 10)
      })),
      ultimas: ultimasRetenciones.map(r => ({
        id: r.id,
        expediente: r.numero_expediente,
        dominio: r.vehiculo?.dominio,
        marca: r.vehiculo?.marca,
        modelo: r.vehiculo?.modelo,
        estado: r.estado_actual,
        fecha: r.fecha_hora,
        direccion: `${r.calle_direccion}, ${r.localidad}`
      }))
    };
  }
}

export default new ReportesService();
