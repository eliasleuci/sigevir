import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * TABLA APPEND-ONLY: No se permiten updates ni deletes.
 * Registra cada cambio de estado de una retención.
 */
class VehicleStatusLog extends Model {
  // Override update para impedir modificaciones
  static async update() {
    throw new Error('VehicleStatusLog es append-only. No se permiten actualizaciones.');
  }
  // Override destroy para impedir eliminaciones
  static async destroy() {
    throw new Error('VehicleStatusLog es append-only. No se permiten eliminaciones.');
  }
}

VehicleStatusLog.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  retencion_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // Estado al que se transitó
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [['RETENIDO', 'EN_DEPOSITO', 'RESOLUCION_PENDIENTE', 'EN_TRAMITE', 'LIBERADO', 'SUBASTADO', 'COMPACTADO']],
        msg: 'Estado de vehículo no válido'
      }
    }
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false // Quién registró el cambio de estado
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // URL de un documento extraordinario asociado al cambio de estado (ej: acta de liberación)
  doc_extraordinario_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'VehicleStatusLog',
  tableName: 'vehicle_status_log',
  timestamps: false, // Gestión manual con el campo timestamp
  indexes: [
    { fields: ['retencion_id'] },
    { fields: ['timestamp'] } // BRIN en la BD real, aquí se define el campo para sincronización
  ]
});

// Bloquear también a nivel de instancia
VehicleStatusLog.prototype.update = async function () {
  throw new Error('VehicleStatusLog es append-only. No se permiten actualizaciones.');
};
VehicleStatusLog.prototype.destroy = async function () {
  throw new Error('VehicleStatusLog es append-only. No se permiten eliminaciones.');
};

export default VehicleStatusLog;
