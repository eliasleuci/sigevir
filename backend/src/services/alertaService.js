import { Op, literal } from 'sequelize';
import db from '../models/index.js';
import logger from '../utils/logger.js';
import emailService from './emailService.js';
import socketService from './socketService.js';

const { Deposito, Usuario, Retencion, Vehiculo, Notificacion, HistorialMovimiento } = db;

const PLAZO_AMARILLO = parseInt(process.env.ALERTA_DIAS_AMARILLO, 10) || 30;
const PLAZO_NARANJA = parseInt(process.env.ALERTA_DIAS_NARANJA, 10) || 60;
const PLAZO_ROJO = parseInt(process.env.ALERTA_DIAS_ROJO, 10) || 90;

class AlertaService {
  getNivelAlerta(dias) {
    if (dias >= PLAZO_ROJO) return 'ROJO';
    if (dias >= PLAZO_NARANJA) return 'NARANJA';
    return 'AMARILLO';
  }

  async getVehiclesWithProblematicPermanencia(diasMin = PLAZO_AMARILLO) {
    const depositos = await Deposito.findAll({
      where: {
        fecha_hora_egreso: null,
        fecha_hora_ingreso: {
          [Op.lte]: literal(`datetime('now', '-${diasMin} days')`),
        },
      },
      include: [
        {
          model: Retencion,
          as: 'retenciones_albergadas',
          include: [
            { model: Vehiculo, as: 'vehiculo' },
          ],
        },
      ],
    });

    return depositos;
  }

  async createAlertaPermanenciaProlongada(deposito, dias) {
    const nivel = this.getNivelAlerta(dias);
    const retencion = deposito.retenciones_albergadas?.[0] || await Retencion.findByPk(deposito.retencion_id, {
      include: [{ model: Vehiculo, as: 'vehiculo' }],
    });
    const dominio = retencion?.vehiculo?.dominio || 'N/D';

    const responsables = [];

    const responsableDeposito = await Usuario.findByPk(deposito.responsable_id);
    if (responsableDeposito) {
      responsables.push(responsableDeposito);
    }

    if (nivel === 'NARANJA' || nivel === 'ROJO') {
      const admins = await Usuario.findAll({
        where: {
          institucion_id: deposito.institucion_id,
          rol: { [Op.in]: ['ADMIN_INSTITUCION', 'admin'] },
          activo: true,
        },
      });
      responsables.push(...admins);
    }

    if (nivel === 'ROJO') {
      const directores = await Usuario.findAll({
        where: {
          rol: 'fiscal_juez',
          activo: true,
        },
      });
      responsables.push(...directores);
    }

    const resultados = [];

    for (const usuario of responsables) {
      const notificacion = await Notificacion.create({
        destinatario_id: usuario.id,
        retencion_id: deposito.retencion_id,
        tipo: 'ALERTA_TIEMPO',
        mensaje: `${dominio} lleva ${dias} días en depósito (nivel ${nivel})`,
      }).catch((err) => {
        logger.warn(`No se pudo crear notificación en BD: ${err.message}`);
        return null;
      });

      if (notificacion) {
        await socketService.broadcastNotification(usuario.id, {
          tipo: 'ALERTA_TIEMPO',
          mensaje: `${dominio} lleva ${dias} días en depósito (nivel ${nivel})`,
          retencion_id: deposito.retencion_id,
        });
      }

      if (usuario.email) {
        try {
          await emailService.sendAlertaPermancenciaProlongada(
            usuario.email,
            {
              nombre_responsable: usuario.nombre_completo,
              numero_expediente: retencion?.numero_expediente || 'N/D',
              dominio,
              dias,
            },
            notificacion?.id || null,
          );
        } catch (emailError) {
          logger.error(`Error email alerta a ${usuario.email}: ${emailError.message}`);
        }
      }

      resultados.push({ usuario_id: usuario.id, notificacion_id: notificacion?.id, nivel });
    }

    await HistorialMovimiento.create({
      retencion_id: deposito.retencion_id,
      usuario_id: deposito.responsable_id,
      tipo_movimiento: 'ALERTA_PERMANENCIA',
      origen: `Sistema Automático (${nivel})`,
      destino: null,
      observaciones: `Alerta generada: ${dominio} lleva ${dias} días en depósito. Nivel ${nivel}. Notificaciones enviadas a ${responsables.length} usuario(s).`,
    }).catch((err) => {
      logger.warn(`No se pudo registrar historial: ${err.message}`);
    });

    logger.info(`Alerta ${nivel} generada para depósito ${deposito.id}: ${dominio} - ${dias} días`);

    return { success: true, nivel, destinatarios: resultados.length, dominio };
  }
}

export default new AlertaService();
