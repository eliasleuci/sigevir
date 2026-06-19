import sequelize from '../config/database.js';

// Importar Modelos
import Institucion from './Institucion.js';
import Usuario from './Usuario.js';
import Retencion from './Retencion.js';
import VehicleStatusLog from './VehicleStatusLog.js';
import Deposito from './Deposito.js';
import ResolucionJudicial from './ResolucionJudicial.js';
import FotoRetencion from './FotoRetencion.js';
import Notificacion from './Notificacion.js';
import HistorialMovimiento from './HistorialMovimiento.js';

// Definir Asociaciones

// 1. Institucion <-> Usuario (1:N)
Institucion.hasMany(Usuario, { foreignKey: 'institucion_id', as: 'usuarios' });
Usuario.belongsTo(Institucion, { foreignKey: 'institucion_id', as: 'institucion' });

// 2. Institucion <-> Retencion (1:N)
Institucion.hasMany(Retencion, { foreignKey: 'institucion_id', as: 'retenciones' });
Retencion.belongsTo(Institucion, { foreignKey: 'institucion_id', as: 'institucion' });

// 3. Usuario (Agente) <-> Retencion (1:N)
Usuario.hasMany(Retencion, { foreignKey: 'agente_id', as: 'retenciones_generadas' });
Retencion.belongsTo(Usuario, { foreignKey: 'agente_id', as: 'agente' });


// 5. Retencion <-> VehicleStatusLog (1:N)
Retencion.hasMany(VehicleStatusLog, { foreignKey: 'retencion_id', as: 'status_logs' });
VehicleStatusLog.belongsTo(Retencion, { foreignKey: 'retencion_id', as: 'retencion' });

// 6. Usuario <-> VehicleStatusLog (1:N)
Usuario.hasMany(VehicleStatusLog, { foreignKey: 'usuario_id', as: 'status_logs_creados' });
VehicleStatusLog.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// 7. Retencion <-> HistorialMovimiento (1:N)
Retencion.hasMany(HistorialMovimiento, { foreignKey: 'retencion_id', as: 'movimientos' });
HistorialMovimiento.belongsTo(Retencion, { foreignKey: 'retencion_id', as: 'retencion' });

// 8. Usuario <-> HistorialMovimiento (1:N)
Usuario.hasMany(HistorialMovimiento, { foreignKey: 'usuario_id', as: 'movimientos_generados' });
HistorialMovimiento.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// 9. Retencion <-> FotoRetencion (1:N)
Retencion.hasMany(FotoRetencion, { foreignKey: 'retencion_id', as: 'fotos' });
FotoRetencion.belongsTo(Retencion, { foreignKey: 'retencion_id', as: 'retencion' });

// 10. Retencion <-> ResolucionJudicial (1:1)
Retencion.hasOne(ResolucionJudicial, { foreignKey: 'retencion_id', as: 'resolucion_judicial' });
ResolucionJudicial.belongsTo(Retencion, { foreignKey: 'retencion_id', as: 'retencion' });

// 11. Deposito <-> Retencion (1:1 via retencion_id, 1:N via deposito_id)
Deposito.belongsTo(Retencion, { foreignKey: 'retencion_id', as: 'retencion' });
Retencion.hasOne(Deposito, { foreignKey: 'retencion_id', as: 'deposito_activo' });

// 11b. Deposito <-> Retencion (1:N)
Deposito.hasMany(Retencion, { foreignKey: 'deposito_id', as: 'retenciones_albergadas' });
// Agregar deposito_id a Retencion si no estaba explicito (Sequelize lo maneja si se define aqui)
Retencion.belongsTo(Deposito, { foreignKey: 'deposito_id', as: 'deposito' });

// 12. Usuario <-> Notificacion (1:N)
Usuario.hasMany(Notificacion, { foreignKey: 'destinatario_id', as: 'notificaciones_recibidas' });
Notificacion.belongsTo(Usuario, { foreignKey: 'destinatario_id', as: 'destinatario' });

// 13. Retencion <-> Notificacion (1:N)
Retencion.hasMany(Notificacion, { foreignKey: 'retencion_id', as: 'notificaciones_generadas' });
Notificacion.belongsTo(Retencion, { foreignKey: 'retencion_id', as: 'retencion' });

const db = {
  sequelize,
  Institucion,
  Usuario,
  Retencion,
  VehicleStatusLog,
  Deposito,
  ResolucionJudicial,
  FotoRetencion,
  Notificacion,
  HistorialMovimiento
};

export default db;
