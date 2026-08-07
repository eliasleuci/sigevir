import db from '../models/index.js';
import logger from '../utils/logger.js';

class ConfiguracionesController {
  // Obtener todas las configuraciones
  async getAll(req, res) {
    try {
      const configuraciones = await db.Configuracion.findAll({
        order: [['categoria', 'ASC'], ['clave', 'ASC']]
      });

      // Transformar a un objeto clave:valor o devolver el array completo para que el admin pueda editar
      // Devolveremos el array para tener info del tipo, categoria, etc.
      res.json({ success: true, data: configuraciones });
    } catch (error) {
      logger.error(`Error al obtener configuraciones: ${error.message}`);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Obtener configuración por clave (utilidad para el sistema interno)
  async getByClave(req, res) {
    try {
      const { clave } = req.params;
      const config = await db.Configuracion.findOne({ where: { clave } });
      
      if (!config) {
        return res.status(404).json({ success: false, message: 'Configuración no encontrada' });
      }

      // Convertir el valor según el tipo
      let valorFinal = config.valor;
      if (config.tipo === 'boolean') valorFinal = config.valor === 'true';
      if (config.tipo === 'number') valorFinal = Number(config.valor);
      if (config.tipo === 'json') valorFinal = JSON.parse(config.valor);

      res.json({ success: true, data: { ...config.toJSON(), valorParseado: valorFinal } });
    } catch (error) {
      logger.error(`Error al obtener configuración por clave: ${error.message}`);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Actualizar una o múltiples configuraciones
  async updateMultiple(req, configuracionesToUpdate) {
    // Si viene como req,res usamos el body, pero lo separamos para reusabilidad
    const updates = configuracionesToUpdate || req.body.configuraciones;
    
    if (!Array.isArray(updates)) {
      return req.res.status(400).json({ success: false, message: 'Se esperaba un array de configuraciones' });
    }

    const t = await db.sequelize.transaction();
    try {
      for (const update of updates) {
        const { clave, valor } = update;
        // Solo actualizamos el valor, no la clave ni tipo
        await db.Configuracion.update(
          { valor: String(valor) },
          { where: { clave }, transaction: t }
        );
      }
      
      await t.commit();
      
      if (req && req.res) {
        req.res.json({ success: true, message: 'Configuraciones actualizadas correctamente' });
      }
    } catch (error) {
      await t.rollback();
      logger.error(`Error al actualizar configuraciones: ${error.message}`);
      if (req && req.res) {
        req.res.status(500).json({ success: false, message: 'Error al actualizar configuraciones' });
      } else {
        throw error;
      }
    }
  }

  // Crear nueva configuración
  async create(req, res) {
    try {
      const { clave, valor, descripcion, categoria, tipo } = req.body;
      
      if (!clave || !valor) {
        return res.status(400).json({ success: false, message: 'Clave y valor son requeridos' });
      }

      const existingConfig = await db.Configuracion.findOne({ where: { clave: clave.toUpperCase() } });
      if (existingConfig) {
        return res.status(400).json({ success: false, message: 'La clave ya existe' });
      }

      const newConfig = await db.Configuracion.create({
        clave: clave.toUpperCase(),
        valor: String(valor),
        descripcion,
        categoria: categoria ? categoria.toUpperCase() : 'GENERAL',
        tipo: tipo || 'string'
      });

      res.status(201).json({ success: true, message: 'Configuración creada', data: newConfig });
    } catch (error) {
      logger.error(`Error al crear configuración: ${error.message}`);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Modificar estructura de una configuración existente (todo menos la clave)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { valor, descripcion, categoria, tipo } = req.body;

      const config = await db.Configuracion.findByPk(id);
      if (!config) {
        return res.status(404).json({ success: false, message: 'Configuración no encontrada' });
      }

      await config.update({
        valor: valor !== undefined ? String(valor) : config.valor,
        descripcion: descripcion !== undefined ? descripcion : config.descripcion,
        categoria: categoria ? categoria.toUpperCase() : config.categoria,
        tipo: tipo || config.tipo
      });

      res.json({ success: true, message: 'Configuración actualizada', data: config });
    } catch (error) {
      logger.error(`Error al actualizar configuración: ${error.message}`);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Eliminar configuración
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const config = await db.Configuracion.findByPk(id);
      if (!config) {
        return res.status(404).json({ success: false, message: 'Configuración no encontrada' });
      }

      await config.destroy();
      res.json({ success: true, message: 'Configuración eliminada' });
    } catch (error) {
      logger.error(`Error al eliminar configuración: ${error.message}`);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
}

export default new ConfiguracionesController();
