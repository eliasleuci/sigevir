import Retencion from '../models/Retencion.js';
import DepositoInstitucion from '../models/DepositoInstitucion.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

class PublicController {
  consultaVehiculo = async (req, res, next) => {
    try {
      const { dominio } = req.params;
      
      if (!dominio) {
        return res.status(400).json({ success: false, error: 'Dominio es requerido' });
      }

      // Buscar la última retención del dominio que NO esté egresada
      const retencion = await Retencion.findOne({
        where: {
          dominio: {
            [Op.iLike]: dominio.replace(/\s+/g, '') // Case insensitive e ignorar espacios
          },
          estado_actual: {
            [Op.ne]: 'EGRESADO'
          }
        },
        order: [['fecha_hora', 'DESC']],
        include: [
          {
            model: DepositoInstitucion,
            as: 'deposito_institucion',
            attributes: ['nombre', 'direccion', 'latitud', 'longitud']
          }
        ],
        attributes: ['id', 'dominio', 'marca', 'modelo', 'estado_actual', 'fecha_hora'] // Safe fields
      });

      if (!retencion) {
        return res.status(404).json({ 
          success: false, 
          error: 'No se encontró ningún vehículo retenido con ese dominio actualmente.' 
        });
      }

      res.status(200).json({ success: true, data: retencion });
    } catch (error) {
      logger.error(`Error en consulta pública de vehículo: ${error?.message}`);
      next(error);
    }
  };
}

export default new PublicController();
