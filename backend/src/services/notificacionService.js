/**
 * Servicio central de notificaciones SIGEVIR
 * Conecta los eventos de negocio con Socket.io y la BD
 */
import db from '../models/index.js';
import socketService from './socketService.js';
import logger from '../utils/logger.js';

const { Usuario, Notificacion } = db;

/**
 * Obtener IDs de todos los usuarios activos con un rol específico
 */
const getUsuariosPorRol = async (rol) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { rol: rol, activo: true },
      attributes: ['id'],
      raw: true,
    });
    return usuarios.map(u => u.id);
  } catch (error) {
    logger.error(`Error obteniendo usuarios con rol ${rol}: ${error.message}`);
    return [];
  }
};

/**
 * Enviar notificación a múltiples usuarios
 */
const notificarUsuarios = async (usuarioIds, datos) => {
  const promesas = usuarioIds.map(id =>
    socketService.broadcastNotification(id, datos).catch(err =>
      logger.error(`Error notificando a ${id}: ${err.message}`)
    )
  );
  await Promise.allSettled(promesas);
};

// ── Notificaciones por tipo de evento ─────────────────────────────────────────

/**
 * EVENTO 1: Nueva retención registrada
 * Trigger: Agente de campo crea una retención
 * Destinatarios: Todos los usuarios de depósito
 */
export const notificarNuevaRetencion = async (retencion, agenteNombre) => {
  try {
    const destinatarios = await getUsuariosPorRol('deposito');
    if (!destinatarios.length) return;

    await notificarUsuarios(destinatarios, {
      tipo: 'NUEVA_RETENCION',
      retencion_id: retencion.id,
      mensaje: `🚗 Nueva retención registrada: ${retencion.dominio || 'Sin dominio'} — ${retencion.tipo_vehiculo || 'Vehículo'} por ${agenteNombre}. Pendiente de ingreso al depósito.`,
    });

    logger.info(`[NOTIF] NUEVA_RETENCION → ${destinatarios.length} usuarios de depósito`);
  } catch (error) {
    logger.error(`[NOTIF] Error en notificarNuevaRetencion: ${error.message}`);
  }
};

/**
 * EVENTO 2: Vehículo ingresado al depósito
 * Trigger: Depósito confirma el ingreso
 * Destinatarios: Todos los fiscales/jueces + admins
 */
export const notificarIngresoDeposito = async (retencion, depositoNombre) => {
  try {
    const judiciales = await getUsuariosPorRol('fiscal_juez');
    const admins     = await getUsuariosPorRol('admin');
    const destinatarios = [...new Set([...judiciales, ...admins])];

    if (!destinatarios.length) return;

    await notificarUsuarios(destinatarios, {
      tipo: 'INGRESO_DEPOSITO',
      retencion_id: retencion.id,
      mensaje: `🏭 Vehículo ${retencion.dominio || 'Sin dominio'} ingresó al depósito — confirmado por ${depositoNombre}. Disponible para resolución judicial.`,
    });

    logger.info(`[NOTIF] INGRESO_DEPOSITO → ${destinatarios.length} destinatarios`);
  } catch (error) {
    logger.error(`[NOTIF] Error en notificarIngresoDeposito: ${error.message}`);
  }
};

/**
 * EVENTO 3: Resolución judicial emitida
 * Trigger: Juez/Fiscal emite una resolución
 * Destinatarios: Usuarios de depósito + agentes de campo
 */
export const notificarResolucionJudicial = async (retencion, resolucion, juezNombre) => {
  try {
    const deposito = await getUsuariosPorRol('deposito');
    const agentes  = await getUsuariosPorRol('agente_campo');
    const destinatarios = [...new Set([...deposito, ...agentes])];

    if (!destinatarios.length) return;

    await notificarUsuarios(destinatarios, {
      tipo: 'RESOLUCION_JUDICIAL',
      retencion_id: retencion.id,
      mensaje: `⚖️ Resolución emitida para ${retencion.dominio || 'vehículo'}: ${resolucion.tipo_resolucion || 'Resolución'} — ${juezNombre}. ${resolucion.descripcion ? resolucion.descripcion.substring(0, 80) + '...' : ''}`,
    });

    logger.info(`[NOTIF] RESOLUCION_JUDICIAL → ${destinatarios.length} destinatarios`);
  } catch (error) {
    logger.error(`[NOTIF] Error en notificarResolucionJudicial: ${error.message}`);
  }
};

/**
 * EVENTO 4: Vehículo egresado/entregado
 * Trigger: Depósito registra el egreso
 * Destinatarios: Agentes de campo + admins
 */
export const notificarEgresoVehiculo = async (retencion, depositoNombre) => {
  try {
    const agentes = await getUsuariosPorRol('agente_campo');
    const admins  = await getUsuariosPorRol('admin');
    const destinatarios = [...new Set([...agentes, ...admins])];

    if (!destinatarios.length) return;

    await notificarUsuarios(destinatarios, {
      tipo: 'EGRESO_VEHICULO',
      retencion_id: retencion.id,
      mensaje: `✅ Vehículo ${retencion.dominio || 'Sin dominio'} egresado del depósito y entregado — registrado por ${depositoNombre}. Retención cerrada.`,
    });

    logger.info(`[NOTIF] EGRESO_VEHICULO → ${destinatarios.length} destinatarios`);
  } catch (error) {
    logger.error(`[NOTIF] Error en notificarEgresoVehiculo: ${error.message}`);
  }
};

/**
 * EVENTO 5: Usuario pendiente de aprobación
 * Trigger: Un usuario se registra con email no institucional
 * Destinatarios: Todos los admins
 */
export const notificarUsuarioPendiente = async (email, nombreCompleto) => {
  try {
    const admins = await getUsuariosPorRol('admin');
    if (!admins.length) return;

    await notificarUsuarios(admins, {
      tipo: 'USUARIO_PENDIENTE',
      retencion_id: null,
      mensaje: `👤 Nuevo usuario pendiente de aprobación: ${nombreCompleto} (${email}). Requiere revisión y asignación de rol.`,
    });

    logger.info(`[NOTIF] USUARIO_PENDIENTE → ${admins.length} admins`);
  } catch (error) {
    logger.error(`[NOTIF] Error en notificarUsuarioPendiente: ${error.message}`);
  }
};

/**
 * EVENTO 6: Alerta de permanencia prolongada (llamado por el cron job)
 * Trigger: Vehículo lleva más días del límite en el depósito
 * Destinatarios: Admins + fiscales/jueces
 */
export const notificarPermanenciaProlongada = async (retencion, diasRetenido) => {
  try {
    const judiciales = await getUsuariosPorRol('fiscal_juez');
    const admins     = await getUsuariosPorRol('admin');
    const destinatarios = [...new Set([...judiciales, ...admins])];

    if (!destinatarios.length) return;

    await notificarUsuarios(destinatarios, {
      tipo: 'ALERTA_TIEMPO',
      retencion_id: retencion.id,
      mensaje: `⚠️ ALERTA: Vehículo ${retencion.dominio || 'Sin dominio'} lleva ${diasRetenido} días retenido sin resolución. Requiere atención judicial urgente.`,
    });

    logger.info(`[NOTIF] ALERTA_TIEMPO para retención ${retencion.id} → ${destinatarios.length} destinatarios`);
  } catch (error) {
    logger.error(`[NOTIF] Error en notificarPermanenciaProlongada: ${error.message}`);
  }
};
