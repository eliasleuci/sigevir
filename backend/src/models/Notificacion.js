import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Notificacion extends Model {}

Notificacion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Usuario que recibe la notificación
  destinatario_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // Retención relacionada con la notificación
  retencion_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM(
      'NUEVA_RETENCION',      // Un agente registró una nueva retención
      'CAMBIO_ESTADO',        // El vehículo cambió de estado
      'INGRESO_DEPOSITO',     // El vehículo ingresó al depósito
      'RESOLUCION_JUDICIAL',  // Se emitió una resolución judicial
      'ALERTA_TIEMPO',        // El vehículo lleva más de X días retenido
      'DOC_DISPONIBLE'        // Documento generado listo para descargar
    ),
    allowNull: false,
    validate: {
      isIn: {
        args: [['NUEVA_RETENCION', 'CAMBIO_ESTADO', 'INGRESO_DEPOSITO', 'RESOLUCION_JUDICIAL', 'ALERTA_TIEMPO', 'DOC_DISPONIBLE']],
        msg: 'Tipo de notificación no válido'
      }
    }
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // Control de envío por email
  enviado_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_enviado_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Control de lectura y confirmación en la app
  leida_at: {
    type: DataTypes.DATE,
    allowNull: true // Null = no leída
  },
  confirmada_at: {
    type: DataTypes.DATE,
    allowNull: true // Null = no confirmada (para notificaciones críticas)
  }
}, {
  sequelize,
  modelName: 'Notificacion',
  tableName: 'notificaciones',
  updatedAt: false,
  indexes: [
    { fields: ['destinatario_id'] },
    { fields: ['retencion_id'] },
    { fields: ['leida_at'] } // Para consultas "sin leer" eficientes
  ]
});

export default Notificacion;
