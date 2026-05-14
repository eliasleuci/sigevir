import retencionService from '../services/retencion.service.js';
import pdfService from '../services/pdfService.js';
import db from '../models/index.js';

class RetencionesController {
  /**
   * POST /api/retenciones
   * Crea una nueva retención de vehículo.
   */
  createRetencion = async (req, res, next) => {
    try {
      // 1. Crear registro base en BD
      const result = await retencionService.crearRetencion(req.body, req.user);
      
      // 2. Obtener datos completos para el acta (incluyendo relaciones)
      const retencionCompleta = await retencionService.obtenerRetencion(result.id, req.user);

      // 3. Generar Acta PDF con QR
      // Mapeamos los datos al formato que espera el pdfService
      const pdfData = {
        numero_expediente: retencionCompleta.numero_expediente,
        qr_url: retencionCompleta.qr_url,
        fecha_hora: retencionCompleta.fecha_hora,
        provincia: retencionCompleta.provincia,
        localidad: retencionCompleta.localidad,
        calle_direccion: retencionCompleta.calle_direccion,
        motivo_retencion: retencionCompleta.motivo_retencion,
        versus: retencionCompleta.versus,
        vehiculo: {
          dominio: retencionCompleta.vehiculo?.dominio,
          marca: retencionCompleta.vehiculo?.marca,
          modelo: retencionCompleta.vehiculo?.modelo,
          anio: retencionCompleta.vehiculo?.anio,
          color: retencionCompleta.vehiculo?.color,
          tipo_vehiculo: retencionCompleta.vehiculo?.tipo_vehiculo,
          numero_motor: retencionCompleta.vehiculo?.numero_motor,
          numero_cuadro: retencionCompleta.vehiculo?.numero_cuadro,
          danios_visibles: retencionCompleta.vehiculo?.danios_visibles
        },
        institucion: {
          nombre: retencionCompleta.institucion?.nombre,
          logo_url: process.env.SIGEVIR_LOGO_URL || 'https://sigevir.dominio.com/logo.png',
          tipo: retencionCompleta.institucion?.tipo,
          jurisdiccion: retencionCompleta.institucion?.jurisdiccion || 'Córdoba, Capital'
        },
        agente: {
          nombre_completo: `${retencionCompleta.agente?.nombre} ${retencionCompleta.agente?.apellido}`,
          dni: req.user.dni || 'N/A', // Asumiendo que el DNI viene en el token o lo sacamos del agente
          seccion: req.user.seccion || 'División Tránsito'
        },
        titular: {
          nombre: retencionCompleta.titular_nombre || 'N/A',
          dni: retencionCompleta.titular_dni || 'N/A',
          contacto: retencionCompleta.titular_contacto || 'N/A'
        },
        fotos: (retencionCompleta.fotos || []).map(f => f.url_s3)
      };

      const pdfBuffer = await pdfService.generateActaRetencion(pdfData);

      // 4. Subir a S3
      const actaUrl = await pdfService.uploadPdfToS3(pdfBuffer, retencionCompleta.numero_expediente);

      // 5. Actualizar URL del acta en la BD
      await db.Retencion.update(
        { acta_pdf_url: actaUrl },
        { where: { id: retencionCompleta.id } }
      );

      res.status(201).json({
        success: true,
        data: {
          ...result,
          acta_pdf_url: actaUrl
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/retenciones/:id/fotos
   * Carga fotos vinculadas a una retención.
   */
  uploadFotos = async (req, res, next) => {
    try {
      const { id } = req.params;

      // Descripciones vienen como JSON string o array
      let descripciones = [];
      if (req.body.descripciones) {
        descripciones = typeof req.body.descripciones === 'string'
          ? JSON.parse(req.body.descripciones)
          : req.body.descripciones;
      }

      const fotos = await retencionService.subirFotos(id, req.files, descripciones, req.user);

      res.status(201).json({
        success: true,
        data: { fotos }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/retenciones/:id
   * Obtiene los detalles completos de una retención.
   */
  getRetencion = async (req, res, next) => {
    try {
      const { id } = req.params;
      const retencion = await retencionService.obtenerRetencion(id, req.user);

      res.status(200).json({
        success: true,
        data: retencion
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/retenciones
   * Lista retenciones con filtros y paginación.
   */
  listRetenciones = async (req, res, next) => {
    try {
      const result = await retencionService.listarRetenciones(req.query, req.user);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/retenciones/:id
   * Edita una retención (solo si estado = RETENIDO y usuario autorizado).
   */
  updateRetencion = async (req, res, next) => {
    try {
      const { id } = req.params;
      const retencion = await retencionService.editarRetencion(id, req.body, req.user);

      res.status(200).json({
        success: true,
        data: retencion
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new RetencionesController();
