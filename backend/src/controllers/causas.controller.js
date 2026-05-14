import causaService from '../services/causa.service.js';

class CausasController {
  /**
   * GET /api/causas/buscar
   */
  buscarCausas = async (req, res, next) => {
    try {
      const resultados = await causaService.buscarCausas(req.query, req.user);
      res.status(200).json({
        success: true,
        resultados
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/causas/:numero_expediente/historial-completo
   */
  getHistorialCompleto = async (req, res, next) => {
    try {
      const { numero_expediente } = req.params;
      const historial = await causaService.getHistorialCompleto(numero_expediente, req.user);
      res.status(200).json({
        success: true,
        data: historial
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/resoluciones
   */
  emitirResolucion = async (req, res, next) => {
    try {
      const result = await causaService.emitirResolucion(req.body, req.user);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/causas/por-resolver
   */
  getPorResolver = async (req, res, next) => {
    try {
      const result = await causaService.listPorResolver(req.query, req.user);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/resoluciones/:id/cambio-extraordinario
   */
  cambioExtraordinario = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await causaService.cambioExtraordinario(id, req.body, req.user);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new CausasController();
