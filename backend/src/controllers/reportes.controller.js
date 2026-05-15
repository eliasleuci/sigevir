import reportesService from '../services/reportes.service.js';

class ReportesController {
  getEstadisticas = async (req, res, next) => {
    try {
      const data = await reportesService.obtenerEstadisticas(req.query, req.user);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export default new ReportesController();
