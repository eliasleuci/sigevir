import db from '../models/index.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const { DepositoInstitucion, Retencion } = db;

/**
 * Fórmula de distancia Haversine (km) entre dos coordenadas
 */
const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * GET /api/depositos-disponibles/cercanos?lat=&lng=
 * Devuelve depósitos activos ordenados por distancia, con espacios disponibles calculados
 */
export const getDepositosCercanos = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    throw new AppError('Se requieren coordenadas lat y lng', 400, 'MISSING_COORDS');
  }

  const depositos = await DepositoInstitucion.findAll({
    where: { activo: true },
    raw: true,
  });

  // Calcular ocupación actual de cada depósito
  const depositosConDisponibilidad = await Promise.all(
    depositos.map(async (dep) => {
      const ocupados = await Retencion.count({
        where: {
          deposito_institucion_id: dep.id,
          estado_actual: ['EN_DEPOSITO', 'RETENIDO'], // vehículos actualmente ahí o en camino
        },
      });

      const disponibles = Math.max(0, dep.capacidad_maxima - ocupados);
      const distanciaKm = calcularDistanciaKm(
        parseFloat(lat), parseFloat(lng),
        parseFloat(dep.latitud), parseFloat(dep.longitud)
      );

      return {
        ...dep,
        espacios_ocupados: ocupados,
        espacios_disponibles: disponibles,
        distancia_km: Math.round(distanciaKm * 10) / 10,
        tiene_lugar: disponibles > 0,
      };
    })
  );

  // Ordenar por distancia
  depositosConDisponibilidad.sort((a, b) => a.distancia_km - b.distancia_km);

  res.json({
    success: true,
    data: depositosConDisponibilidad,
  });
});
