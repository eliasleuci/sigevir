const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'src/services/retencion.service.js');
let serviceContent = fs.readFileSync(servicePath, 'latin1');

serviceContent = serviceContent.replace(
  `const { Retencion, Vehiculo, Institucion, Usuario, VehicleStatusLog, FotoRetencion, HistorialMovimiento } = db;`,
  `const { Retencion, Vehiculo, Institucion, Usuario, VehicleStatusLog, FotoRetencion, HistorialMovimiento, ResolucionJudicial } = db;`
);

fs.writeFileSync(servicePath, serviceContent, 'latin1');
console.log('ResolucionJudicial destructured');
