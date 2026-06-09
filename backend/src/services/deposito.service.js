import { Op } from 'sequelize';
import db from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import socketService from './socketService.js';
import pdfService from './pdfService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Deposito, Retencion, VehicleStatusLog, HistorialMovimiento, Usuario, ResolucionJudicial } = db;

class DepositoService {
  async confirmarIngreso(retencionId, data, user) {
    const transaction = await db.sequelize.transaction();
    try {
      const retencion = await Retencion.findByPk(retencionId, { transaction });
      if (!retencion) throw new AppError('Retención no encontrada', 404);
      const estadosValidos = ['RETENIDO', 'RETENIDO_EN_TRANSITO', 'RETENIDO_EN_TRASLADO'];
      const estadoNormalizado = retencion.estado_actual.toUpperCase();
      if (!estadosValidos.includes(estadoNormalizado)) {
        throw new AppError('El vehículo no puede ingresar al depósito en su estado actual: ' + retencion.estado_actual, 400);
      }
      if (user.role !== 'admin' && user.institucion_id !== retencion.institucion_id) {
        throw new AppError('No tiene permisos para gestionar retenciones de otra institución', 403);
      }
      const ingreso = await Deposito.create({
        retencion_id: retencion.id,
        institucion_id: retencion.institucion_id,
        responsable_id: user.userId,
        sector: data.sector,
        fila: String(data.fila),
        numero_espacio: String(data.numero_espacio || data.espacio),
        inventario_objetos: data.inventario_objetos,
        fecha_hora_ingreso: new Date()
      }, { transaction });
      await retencion.update({ estado_actual: 'EN_DEPOSITO', deposito_id: ingreso.id }, { transaction });
      await VehicleStatusLog.create({
        retencion_id: retencion.id, estado: 'EN_DEPOSITO', usuario_id: user.userId,
        observaciones: 'Ingreso confirmado en depósito.'
      }, { transaction });
      await HistorialMovimiento.create({
        retencion_id: retencion.id, usuario_id: user.userId, tipo_movimiento: 'INGRESO_DEPOSITO',
        origen: retencion.calle_direccion, destino: 'Depósito Sector ' + data.sector,
        observaciones: data.observaciones_ingreso || data.observaciones || 'Ingreso físico al depósito'
      }, { transaction });
      await transaction.commit();
      return { id: ingreso.id, numero_expediente: retencion.numero_expediente, estado_actual: 'EN_DEPOSITO', sector: ingreso.sector, fila: ingreso.fila, numero_espacio: ingreso.numero_espacio, fecha_hora_ingreso: ingreso.fecha_hora_ingreso };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error confirmando ingreso: ' + error.message);
      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al confirmar el ingreso al depósito', 500);
    }
  }

  async uploadFotoIngreso(depositoId, file, user) {
    const ingreso = await Deposito.findByPk(depositoId);
    if (!ingreso) throw new AppError('Registro de depósito no encontrado', 404);
    if (user.role !== 'admin' && ingreso.responsable_id !== user.userId) throw new AppError('Sin permisos', 403);
    try {
      const key = 'depositos/' + depositoId + '/ingreso_' + Date.now() + '_' + file.originalname;
      const mockUrl = 'https://s3.amazonaws.com/sigevir-fotos/' + key;
      await ingreso.update({ foto_ingreso_url: mockUrl });
      return { foto_ingreso_url: mockUrl };
    } catch (error) {
      logger.error('Error subiendo foto de ingreso: ' + error.message);
      throw new AppError('Error al subir la foto de ingreso', 500);
    }
  }

  async listPendientes(filtros, user) {
    const { institucion_id, limit = 10, offset = 0 } = filtros;
    const whereRetencion = { estado_actual: { [Op.in]: ['RETENIDO', 'RETENIDO_EN_TRANSITO', 'RETENIDO_EN_TRASLADO'] } };
    if (user.role !== 'admin' && user.role !== 'fiscal_juez') whereRetencion.institucion_id = user.institucion_id;
    else if (institucion_id) whereRetencion.institucion_id = institucion_id;
    const { count, rows } = await Retencion.findAndCountAll({
      where: whereRetencion,
      // No se incluyen relaciones con Vehiculo, los datos están en la tabla Retencion
      order: [['fecha_hora', 'ASC']],
      limit: parseInt(limit, 10), offset: parseInt(offset, 10)
    });
    return { data: rows.map(r => ({ numero_expediente: r.numero_expediente, dominio: r.dominio, marca: r.marca, modelo: r.modelo, color: r.color, provincia: r.provincia, localidad: r.localidad, fecha_hora: r.fecha_hora })), total: count, limit: parseInt(limit, 10), offset: parseInt(offset, 10) };
  }

  async listPendientesEgreso(filtros, user) {
    const { institucion_id } = filtros;
    const whereDeposito = { fecha_hora_egreso: null };
    if (user.role !== 'admin' && user.role !== 'fiscal_juez') whereDeposito.institucion_id = user.institucion_id;
    else if (institucion_id) whereDeposito.institucion_id = institucion_id;
    const rows = await Deposito.findAll({
      where: whereDeposito,
      include: [{
        model: Retencion, as: 'retencion', required: true,
        where: { estado_actual: { [Op.in]: ['EN_TRAMITE'] } },
        include: [
          // No se incluye Vehiculo, sus campos están en Retencion
          { model: ResolucionJudicial, as: 'resolucion_judicial', attributes: ['fecha_emision', 'observaciones'] }
        ]
      }],
      order: [['fecha_hora_ingreso', 'DESC']]
    });
    return { data: rows.map(d => { const ret = d.retencion; return { id: d.id, dominio: ret?.dominio, nro_expediente: ret?.numero_expediente, sector: d.sector, fila: d.fila, espacio: d.numero_espacio, estado: ret?.estado_actual, fecha_ingreso: d.fecha_hora_ingreso, tipo_vehiculo: ret?.tipo_vehiculo, marca: ret?.marca, modelo: ret?.modelo, resolucion_judicial: ret?.resolucion_judicial || null }; }) };
  }

  async listPendientesTramite(filtros, user) {
    const { institucion_id } = filtros;
    const whereDeposito = { fecha_hora_egreso: null };
    if (user.role !== 'admin' && user.role !== 'fiscal_juez') whereDeposito.institucion_id = user.institucion_id;
    else if (institucion_id) whereDeposito.institucion_id = institucion_id;
    const rows = await Deposito.findAll({
      where: whereDeposito,
      include: [{
        model: Retencion, as: 'retencion', required: true,
        where: { estado_actual: { [Op.in]: ['RESOLUCION_PENDIENTE'] } },
        include: [
          // No Vehiculo, los datos están en Retencion
          { model: ResolucionJudicial, as: 'resolucion_judicial', attributes: ['fecha_emision', 'observaciones'] }
        ]
      }],
      order: [['fecha_hora_ingreso', 'DESC']]
    });
    return { data: rows.map(d => { const ret = d.retencion; return { id: d.id, dominio: ret?.dominio, nro_expediente: ret?.numero_expediente, sector: d.sector, fila: d.fila, espacio: d.numero_espacio, estado: ret?.estado_actual, fecha_ingreso: d.fecha_hora_ingreso, tipo_vehiculo: ret?.tipo_vehiculo, marca: ret?.marca, modelo: ret?.modelo, resolucion_judicial: ret?.resolucion_judicial || null }; }) };
  }

  async iniciarTramite(id, data, user) {
    const transaction = await db.sequelize.transaction();
    try {
      const deposito = await Deposito.findByPk(id, { include: [{ model: Retencion, as: 'retencion' }], transaction });
      if (!deposito) throw new AppError('Registro de depósito no encontrado', 404);
      if (deposito.retencion.estado_actual !== 'RESOLUCION_PENDIENTE') {
        throw new AppError('El vehículo no está en estado de resolución pendiente', 400);
      }
      const updateData = {};
      if (data.quien_retira) updateData.quien_retira = data.quien_retira;
      if (data.dni_quien_retira) updateData.dni_quien_retira = data.dni_quien_retira;
      if (data.razon_egreso) updateData.razon_egreso = data.razon_egreso;
      if (data.documentos_egreso) updateData.documentos_egreso = data.documentos_egreso;
      await deposito.update(updateData, { transaction });
      await deposito.retencion.update({ estado_actual: 'EN_TRAMITE' }, { transaction });
      await VehicleStatusLog.create({ retencion_id: deposito.retencion_id, estado: 'EN_TRAMITE', usuario_id: user.userId, observaciones: 'Tramite de retiro iniciado. Razon: ' + (data.razon_egreso || 'No especificada') }, { transaction });
      await transaction.commit();
      return { id: deposito.id, numero_expediente: deposito.retencion.numero_expediente, estado_actual: 'EN_TRAMITE', documentos_egreso: deposito.documentos_egreso };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error iniciando tramite: ' + error.message);
      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al iniciar el tramite', 500);
    }
  }

  async getDeposito(id, user) {
    const deposito = await Deposito.findByPk(id, { include: [{ model: Retencion, as: 'retencion' }] });
    if (!deposito) throw new AppError('Registro de depósito no encontrado', 404);
    if (user.role !== 'admin' && user.role !== 'fiscal_juez' && deposito.institucion_id !== user.institucion_id) throw new AppError('Acceso denegado', 403);
    const diffTime = Math.abs((deposito.fecha_hora_egreso || new Date()) - deposito.fecha_hora_ingreso);
    return { id: deposito.id, numero_expediente: deposito.retencion?.numero_expediente, vehiculo: deposito.retencion, sector: deposito.sector, fila: deposito.fila, numero_espacio: deposito.numero_espacio, inventario_objetos: deposito.inventario_objetos, foto_ingreso_url: deposito.foto_ingreso_url, fecha_hora_ingreso: deposito.fecha_hora_ingreso, fecha_hora_egreso: deposito.fecha_hora_egreso, estado_actual: deposito.retencion?.estado_actual, tiempo_deposito_dias: Math.ceil(diffTime / (1000 * 60 * 60 * 24)), documentos_egreso: deposito.documentos_egreso };
  }

  async listDepositos(filtros, user) {
    const { estado, sector, institucion_id, limit = 10, offset = 0 } = filtros;
    const whereDeposito = {};
    if (sector) whereDeposito.sector = sector;
    if (user.role !== 'admin' && user.role !== 'fiscal_juez') whereDeposito.institucion_id = user.institucion_id;
    else if (institucion_id) whereDeposito.institucion_id = institucion_id;
    if (estado === 'egresado') whereDeposito.fecha_hora_egreso = { [Op.not]: null };
    else whereDeposito.fecha_hora_egreso = null;
    const { count, rows } = await Deposito.findAndCountAll({
      where: whereDeposito,
      include: [{ model: Retencion, as: 'retencion', // Vehiculo fields están en Retencion
        // No include de Vehiculo
      }],
      order: [['fecha_hora_ingreso', 'DESC']],
      limit: parseInt(limit, 10), offset: parseInt(offset, 10)
    });
    return { data: rows.map(d => { const diffTime = Math.abs((d.fecha_hora_egreso || new Date()) - d.fecha_hora_ingreso); return { id: d.id, numero_expediente: d.retencion?.numero_expediente, dominio: d.retencion?.dominio, sector: d.sector, fila: d.fila, espacio: d.numero_espacio, fecha_ingreso: d.fecha_hora_ingreso, dias_deposito: Math.ceil(diffTime / (1000 * 60 * 60 * 24)), estado_actual: d.retencion?.estado_actual }; }), total: count, limit: parseInt(limit, 10), offset: parseInt(offset, 10) };
  }

  async registrarEgreso(id, data, user) {
    const transaction = await db.sequelize.transaction();
    try {
      const deposito = await Deposito.findByPk(id, { include: [{ model: Retencion, as: 'retencion' }], transaction });
      if (!deposito) throw new AppError('Registro de depósito no encontrado', 404);
      const updateData = { fecha_hora_egreso: new Date() };
      if (data.razon_egreso) updateData.razon_egreso = data.razon_egreso;
      await deposito.update(updateData, { transaction });
      await deposito.retencion.update({ estado_actual: 'LIBERADO' }, { transaction });
      await VehicleStatusLog.create({ retencion_id: deposito.retencion_id, estado: 'LIBERADO', usuario_id: user.userId, observaciones: 'Egreso del depósito registrado. Razón: ' + data.razon_egreso + (data.observaciones_finales ? '. Observaciones: ' + data.observaciones_finales : '') }, { transaction });
      await transaction.commit();
      const diffTime = Math.abs(deposito.fecha_hora_egreso - deposito.fecha_hora_ingreso);
      return { id: deposito.id, numero_expediente: deposito.retencion.numero_expediente, estado_actual: 'LIBERADO', fecha_hora_ingreso: deposito.fecha_hora_ingreso, fecha_hora_egreso: deposito.fecha_hora_egreso, dias_deposito: Math.ceil(diffTime / (1000 * 60 * 60 * 24)), razon_egreso: deposito.razon_egreso, documentos_egreso: deposito.documentos_egreso };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error registrando egreso: ' + error.message);
      if (error instanceof AppError) throw error;
      throw new AppError('Error interno al registrar el egreso', 500);
    }
  }

  async generarConstanciaEntrega(depositoId, user) {
    const deposito = await Deposito.findByPk(depositoId, {
      include: [{ model: Retencion, as: 'retencion' }]
    });
    if (!deposito) throw new AppError('Registro de depósito no encontrado', 404);
    if (user.role !== 'admin' && user.role !== 'deposito') throw new AppError('Acceso denegado', 403);
    const ret = deposito.retencion;
    const v = { dominio: ret?.dominio, tipo_vehiculo: ret?.tipo_vehiculo, marca: ret?.marca, modelo: ret?.modelo, anio: ret?.anio, color: ret?.color, numero_motor: ret?.nro_motor, numero_cuadro: ret?.nro_cuadro };
    const diffTime = Math.abs((deposito.fecha_hora_egreso || new Date()) - deposito.fecha_hora_ingreso);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let html = await fs.readFile(path.join(__dirname, '../templates/constancia_entrega.html'), 'utf8');
    const reemplazos = {
      '{{logo_url}}': '', '{{institucion_nombre}}': 'SIGEVIR', '{{institucion_tipo}}': 'Sistema Integral de Gestión',
      '{{institucion_jurisdiccion}}': '', '{{numero_expediente}}': ret?.numero_expediente || 'N/A',
      '{{fecha_egreso}}': new Date(deposito.fecha_hora_egreso || new Date()).toLocaleString('es-AR'),
      '{{vehiculo_dominio}}': v.dominio || 'N/A', '{{vehiculo_tipo}}': v.tipo_vehiculo || 'N/A',
      '{{vehiculo_marca}}': v.marca || '', '{{vehiculo_modelo}}': v.modelo || '',
      '{{vehiculo_anio}}': v.anio || 'N/A', '{{vehiculo_color}}': v.color || 'N/A',
      '{{vehiculo_motor}}': v.numero_motor || 'N/A', '{{vehiculo_cuadro}}': v.numero_cuadro || 'N/A',
      '{{dias_deposito}}': String(diffDays), '{{razon_egreso}}': deposito.razon_egreso || 'No especificada',
      '{{quien_retira}}': deposito.quien_retira || 'No registrado', '{{dni_quien_retira}}': deposito.dni_quien_retira || 'No registrado',
      '{{observaciones_texto}}': deposito.razon_egreso || 'Sin observaciones',
      '{{responsable_nombre}}': user.nombre_completo || 'Responsable', '{{responsable_dni}}': user.dni || 'N/A',
      '{{fecha_firma}}': new Date().toLocaleDateString('es-AR')
    };
    for (const [key, value] of Object.entries(reemplazos)) { html = html.split(key).join(value); }
    const obsBlockMatch = html.match(/{{observaciones}}[\s\S]*?{{\/observaciones}}/);
    if (obsBlockMatch) html = html.replace(obsBlockMatch[0], '');
    return await pdfService.generatePdfFromHtml(html);
  }
}
export default new DepositoService();



