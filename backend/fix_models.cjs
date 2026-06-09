const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'src/models/index.js');
let indexContent = fs.readFileSync(indexPath, 'utf8');

indexContent = indexContent.replace(
  `// 2. Institucion <-> Retencion (1:N)
Retencion.belongsTo(Institucion, { foreignKey: 'institucion_id', as: 'institucion' });
Usuario.hasMany(VehicleStatusLog, { foreignKey: 'usuario_id', as: 'status_logs_creados' });
VehicleStatusLog.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });`,
  `// 2. Institucion <-> Retencion (1:N)
Retencion.belongsTo(Institucion, { foreignKey: 'institucion_id', as: 'institucion' });

// 3. Usuario <-> Retencion (1:N para Agente)
Usuario.hasMany(Retencion, { foreignKey: 'agente_id', as: 'retenciones_registradas' });
Retencion.belongsTo(Usuario, { foreignKey: 'agente_id', as: 'agente' });

Usuario.hasMany(VehicleStatusLog, { foreignKey: 'usuario_id', as: 'status_logs_creados' });
VehicleStatusLog.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });`
);

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('Fixed models/index.js associations');
