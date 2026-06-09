import depositoService from '../services/deposito.service.js';

class DepositosController {
  confirmarIngreso = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await depositoService.confirmarIngreso(id, req.body, req.user);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  uploadFotoIngreso = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await depositoService.uploadFotoIngreso(id, req.file, req.user);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getPendientes = async (req, res, next) => {
    try {
      const result = await depositoService.listPendientes(req.query, req.user);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  };

  getPendientesEgreso = async (req, res, next) => {
    try {
      const result = await depositoService.listPendientesEgreso(req.query, req.user);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  };

  getPendientesTramite = async (req, res, next) => {
    try {
      const result = await depositoService.listPendientesTramite(req.query, req.user);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  };

  iniciarTramite = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await depositoService.iniciarTramite(id, req.body, req.user);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };
  getPendientesEgreso = async (req, res, next) => {
    try {
      const result = await depositoService.listPendientesEgreso(req.query, req.user);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  };

  getDeposito = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await depositoService.getDeposito(id, req.user);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  listDepositos = async (req, res, next) => {
    try {
      const result = await depositoService.listDepositos(req.query, req.user);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  };

  registrarEgreso = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await depositoService.registrarEgreso(id, req.body, req.user);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  };

  getConstanciaEntrega = async (req, res, next) => {
    try {
      const { id } = req.params;
      const pdfBuffer = await depositoService.generarConstanciaEntrega(id, req.user);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=constancia_entrega_' + id + '.pdf');
      res.send(pdfBuffer);
    } catch (error) { next(error); }
  };
}

export default new DepositosController();

