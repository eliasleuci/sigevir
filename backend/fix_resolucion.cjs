const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'src/services/retencion.service.js');
let serviceContent = fs.readFileSync(servicePath, 'latin1');

// Add ResolucionJudicial to include
serviceContent = serviceContent.replace(
  `        { model: FotoRetencion, as: 'fotos', attributes: ['id', 'url_s3', 'descripcion', 'orden'], order: [['orden', 'ASC']] },\r\n        {`,
  `        { model: FotoRetencion, as: 'fotos', attributes: ['id', 'url_s3', 'descripcion', 'orden'], order: [['orden', 'ASC']] },\r\n        { model: ResolucionJudicial, as: 'resolucion_judicial' },\r\n        {`
);
serviceContent = serviceContent.replace(
  `        { model: FotoRetencion, as: 'fotos', attributes: ['id', 'url_s3', 'descripcion', 'orden'], order: [['orden', 'ASC']] },\n        {`,
  `        { model: FotoRetencion, as: 'fotos', attributes: ['id', 'url_s3', 'descripcion', 'orden'], order: [['orden', 'ASC']] },\n        { model: ResolucionJudicial, as: 'resolucion_judicial' },\n        {`
);

fs.writeFileSync(servicePath, serviceContent, 'latin1');
console.log('ResolucionJudicial added');
