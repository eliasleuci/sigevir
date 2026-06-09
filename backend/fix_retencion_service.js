import fs from 'fs';

const filePath = 'c:/Users/Elias/sigevir/backend/src/services/retencion.service.js';
let content = fs.readFileSync(filePath, 'latin1'); // Read as latin1 to preserve weird chars

const target = `{ model: ResolucionJudicial, as: 'resolucion_judicial' },`;
const replacement = `{ model: ResolucionJudicial, as: 'resolucion_judicial' },\n          { model: Deposito, as: 'deposito_activo' },`;

if (content.includes(target) && !content.includes('deposito_activo')) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'latin1');
  console.log('File updated successfully');
} else {
  console.log('Target not found or already updated');
}
