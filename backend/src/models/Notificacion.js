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
      'NUEVA_RETENCION',      // Agente registró una retención → avisa a Depósito
      'CAMBIO_ESTADO',        // Vehículo egresado/entregado → avisa a todos
      'INGRESO_DEPOSITO',     // Depósito confirmó ingreso → avisa a Judicial + Admin
      'RESOLUCION_JUDICIAL',  // Juez emitió resolución → avisa a Depósito + Agente
      'ALERTA_TIEMPO',        // Permanencia prolongada → avisa a Admin + Judicial
      'DOC_DISPONIBLE',       // Documento listo → avisa al solicitante
      'USUARIO_PENDIENTE',    // ← NUEVO: usuario espera aprobación → avisa a Admin
      'EGRESO_VEHICULO'       // ← NUEVO: vehículo egresado → avisa a Agente + Admin
    ),
    allowNull: false,
    validate: {
      isIn: {
        args: [['NUEVA_RETENCION', 'CAMBIO_ESTADO', 'INGRESO_DEPOSITO', 'RESOLUCION_JUDICIAL', 'ALERTA_TIEMPO', 'DOC_DISPONIBLE', 'USUARIO_PENDIENTE', 'EGRESO_VEHICULO']],
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
