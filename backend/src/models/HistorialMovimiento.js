import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * TABLA APPEND-ONLY: No se permiten updates ni deletes.
 * Registra el historial de movimientos físicos/lógicos de la retención.
 */
class HistorialMovimiento extends Model {
  // Sobrescribir métodos estáticos para prevenir updates/deletes a nivel de modelo
  static update() {
    throw new Error('Operación no permitida: HistorialMovimiento es append-only');
  }

  static destroy() {
    throw new Error('Operación no permitida: HistorialMovimiento es append-only');
  }

  // Sobrescribir métodos de instancia
  async update() {
    throw new Error('Operación no permitida: HistorialMovimiento es append-only');
  }

  async destroy() {
    throw new Error('Operación no permitida: HistorialMovimiento es append-only');
  }
}

HistorialMovimiento.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  retencion_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tipo_movimiento: {
    type: DataTypes.STRING,
    allowNull: false,
    // Ejemplos: 'INGRESO_DEPOSITO', 'TRASLADO', 'LIBERACION', 'ASIGNACION_JUDICIAL'
  },
  origen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  destino: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'HistorialMovimiento',
  tableName: 'historial_movimientos',
  timestamps: false, // Es append-only, la fecha_hora es suficiente
  indexes: [
    { fields: ['retencion_id'] },
    { fields: ['usuario_id'] },
    { fields: ['fecha_hora'] }
  ]
});

export default HistorialMovimiento;
