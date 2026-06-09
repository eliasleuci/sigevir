const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'src/services/retencion.service.js');
let serviceContent = fs.readFileSync(servicePath, 'latin1');

serviceContent = serviceContent.replace(
  `attributes: ['id', 'nombre', 'apellido', 'email']`,
  `attributes: ['id', 'nombre_completo', 'email']`
);
serviceContent = serviceContent.replace(
  `attributes: ['id', 'nombre', 'apellido']`,
  `attributes: ['id', 'nombre_completo']`
);

fs.writeFileSync(servicePath, serviceContent, 'latin1');
console.log('Fixed Usuario attributes in retencion.service.js');
