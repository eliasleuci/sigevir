import logger from '../utils/logger.js';
import alertaService from '../services/alertaService.js';
import { notificarPermanenciaProlongada } from '../services/notificacionService.js';

const PLAZO_AMARILLO = parseInt(process.env.ALERTA_DIAS_AMARILLO, 10) || 30;
const PLAZO_NARANJA = parseInt(process.env.ALERTA_DIAS_NARANJA, 10) || 60;
const PLAZO_ROJO = parseInt(process.env.ALERTA_DIAS_ROJO, 10) || 90;

async function execute() {
  const startTime = Date.now();
  logger.info('=== Iniciando verificación de permanencias prolongadas ===');

  let totalAlertas = 0;
  const detalles = { AMARILLO: 0, NARANJA: 0, ROJO: 0 };
  const umbrales = [
    { dias: PLAZO_AMARILLO, nivel: 'AMARILLO' },
    { dias: PLAZO_NARANJA, nivel: 'NARANJA' },
    { dias: PLAZO_ROJO, nivel: 'ROJO' },
  ];

  try {
    const depositos = await alertaService.getVehiclesWithProblematicPermanencia(PLAZO_AMARILLO);

    logger.info(`Se encontraron ${depositos.length} vehículos con permanencia >= ${PLAZO_AMARILLO} días`);

    for (const deposito of depositos) {
      try {
        const diasIngresado = calcularDias(deposito.fecha_hora_ingreso);
        const nivel = alertaService.getNivelAlerta(diasIngresado);

        const resultado = await alertaService.createAlertaPermanenciaProlongada(deposito, diasIngresado);

        if (resultado.success) {
          totalAlertas++;
          detalles[nivel] = (detalles[nivel] || 0) + 1;

          await notificarPermanenciaProlongada(deposito.retencion || deposito, diasIngresado)
            .catch(err => logger.error(`Error notificando permanencia: ${err.message}`));
        }
      } catch (itemError) {
        logger.error(`Error procesando depósito ${deposito.id}: ${itemError.message}`);
      }
    }

    const elapsed = Date.now() - startTime;
    logger.info(`=== Verificación completada: ${totalAlertas} alertas generadas en ${elapsed}ms ===`);
    logger.info(`Detalle: Amarillas=${detalles.AMARILLO}, Naranjas=${detalles.NARANJA}, Rojas=${detalles.ROJO}`);

    return { success: true, totalAlertas, detalles, elapsed, totalDepositos: depositos.length };
  } catch (error) {
    logger.error(`Error crítico en job de permanencias: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function calcularDias(fechaIngreso) {
  const now = new Date();
  const ingreso = new Date(fechaIngreso);
  const diff = now.getTime() - ingreso.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default { execute };
