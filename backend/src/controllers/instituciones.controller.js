import institucionService from '../services/institucion.service.js';
import logger from '../utils/logger.js';

class InstitucionesController {
  listarInstituciones = async (req, res, next) => {
    try {
      const instituciones = await institucionService.listarInstituciones(req.query);
      res.status(200).json({ success: true, data: instituciones });
    } catch (error) {
      logger.error(`Error al listar instituciones: ${error?.message}`);
      next(error);
    }
  };

  obtenerInstitucion = async (req, res, next) => {
    try {
      const institucion = await institucionService.obtenerInstitucion(req.params.id);
      res.status(200).json({ success: true, data: institucion });
    } catch (error) {
      logger.error(`Error al obtener institución: ${error?.message}`);
      next(error);
    }
  };

  crearInstitucion = async (req, res, next) => {
    try {
      const institucion = await institucionService.crearInstitucion(req.body, req.user);
      res.status(201).json({ success: true, data: institucion, message: 'Institución creada correctamente' });
    } catch (error) {
      logger.error(`Error al crear institución: ${error?.message}`);
      next(error);
    }
  };

  editarInstitucion = async (req, res, next) => {
    try {
      const institucion = await institucionService.editarInstitucion(req.params.id, req.body, req.user);
      res.status(200).json({ success: true, data: institucion, message: 'Institución actualizada correctamente' });
    } catch (error) {
      logger.error(`Error al editar institución: ${error?.message}`);
      next(error);
    }
  };

  eliminarInstitucion = async (req, res, next) => {
    try {
      const result = await institucionService.eliminarInstitucion(req.params.id, req.user);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      logger.error(`Error al eliminar institución: ${error?.message}`);
      next(error);
    }
  };
}

export default new InstitucionesController();
