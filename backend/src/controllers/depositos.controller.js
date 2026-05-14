import depositoService from '../services/deposito.service.js';

class DepositosController {
  /**
   * POST /api/depositos/confirmar-ingreso
   */
  confirmarIngreso = async (req, res, next) => {
    try {
      const result = await depositoService.confirmarIngreso(req.body, req.user);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/depositos/:id/foto-ingreso
   */
  uploadFotoIngreso = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await depositoService.uploadFotoIngreso(id, req.file, req.user);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/depositos/pendientes
   */
  getPendientes = async (req, res, next) => {
    try {
      const result = await depositoService.listPendientes(req.query, req.user);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/depositos/:id
   */
  getDeposito = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await depositoService.getDeposito(id, req.user);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/depositos
   */
  listDepositos = async (req, res, next) => {
    try {
      const result = await depositoService.listDepositos(req.query, req.user);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/depositos/:id/registrar-egreso
   */
  registrarEgreso = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await depositoService.registrarEgreso(id, req.body, req.user);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new DepositosController();
