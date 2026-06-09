const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'src/services/retencion.service.js');
let serviceContent = fs.readFileSync(servicePath, 'latin1');

// Fix obtenerRetencion
serviceContent = serviceContent.replace(
  `{ model: Vehiculo, as: 'vehiculo' },\r\n        { model: Institucion, as: 'institucion', attributes: ['id', 'nombre', 'tipo'] },`,
  `{ model: Institucion, as: 'institucion', attributes: ['id', 'nombre', 'tipo'] },`
);
serviceContent = serviceContent.replace(
  `{ model: Vehiculo, as: 'vehiculo' },\n        { model: Institucion, as: 'institucion', attributes: ['id', 'nombre', 'tipo'] },`,
  `{ model: Institucion, as: 'institucion', attributes: ['id', 'nombre', 'tipo'] },`
);

// Fix listarRetenciones
serviceContent = serviceContent.replace(
  `{ model: Vehiculo, as: 'vehiculo', attributes: ['dominio', 'marca', 'modelo', 'color'] },\r\n        { model: Institucion, as: 'institucion', attributes: ['id', 'nombre'] }`,
  `{ model: Institucion, as: 'institucion', attributes: ['id', 'nombre'] }`
);
serviceContent = serviceContent.replace(
  `{ model: Vehiculo, as: 'vehiculo', attributes: ['dominio', 'marca', 'modelo', 'color'] },\n        { model: Institucion, as: 'institucion', attributes: ['id', 'nombre'] }`,
  `{ model: Institucion, as: 'institucion', attributes: ['id', 'nombre'] }`
);

serviceContent = serviceContent.replace(
  `dominio: r.vehiculo?.dominio,\n        marca: r.vehiculo?.marca,\n        modelo: r.vehiculo?.modelo,`,
  `dominio: r.dominio,\n        marca: r.marca,\n        modelo: r.modelo,`
);
serviceContent = serviceContent.replace(
  `dominio: r.vehiculo?.dominio,\r\n        marca: r.vehiculo?.marca,\r\n        modelo: r.vehiculo?.modelo,`,
  `dominio: r.dominio,\r\n        marca: r.marca,\r\n        modelo: r.modelo,`
);

fs.writeFileSync(servicePath, serviceContent, 'latin1');

// Fix retenciones.controller.js
const controllerPath = path.join(__dirname, 'src/controllers/retenciones.controller.js');
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

controllerContent = controllerContent.replace(
  `        vehiculo: {
          dominio: retencionCompleta.vehiculo?.dominio,
          marca: retencionCompleta.vehiculo?.marca,
          modelo: retencionCompleta.vehiculo?.modelo,
          anio: retencionCompleta.vehiculo?.anio,
          color: retencionCompleta.vehiculo?.color,
          tipo_vehiculo: retencionCompleta.vehiculo?.tipo_vehiculo,
          numero_motor: retencionCompleta.vehiculo?.numero_motor,
          numero_cuadro: retencionCompleta.vehiculo?.numero_cuadro,
          danios_visibles: retencionCompleta.vehiculo?.danios_visibles
        },`,
  `        vehiculo: {
          dominio: retencionCompleta.dominio,
          marca: retencionCompleta.marca,
          modelo: retencionCompleta.modelo,
          color: retencionCompleta.color,
          tipo_vehiculo: retencionCompleta.tipo_vehiculo,
          numero_motor: retencionCompleta.nro_motor,
          numero_cuadro: retencionCompleta.nro_cuadro,
          danios_visibles: null
        },`
);
fs.writeFileSync(controllerPath, controllerContent, 'utf8');

console.log('Backend fixes applied');
