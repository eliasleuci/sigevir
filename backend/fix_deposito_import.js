import fs from 'fs';

const filePath = 'c:/Users/Elias/sigevir/backend/src/services/retencion.service.js';
let content = fs.readFileSync(filePath, 'latin1'); // Read as latin1 to preserve weird chars

const target = `const { Retencion, Vehiculo, Institucion, Usuario, VehicleStatusLog, FotoRetencion, HistorialMovimiento, ResolucionJudicial } = db;`;
const replacement = `const { Retencion, Vehiculo, Institucion, Usuario, VehicleStatusLog, FotoRetencion, HistorialMovimiento, ResolucionJudicial, Deposito } = db;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'latin1');
  console.log('File updated successfully');
} else {
  console.log('Target not found! Check if already updated.');
}
