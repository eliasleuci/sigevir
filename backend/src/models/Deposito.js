import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Deposito extends Model {}

Deposito.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Relación 1:1 con Retencion — una retención tiene un único depósito activo
  retencion_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  institucion_id: {
    type: DataTypes.UUID,
    allowNull: false // Institución dueña del depósito físico
  },
  responsable_id: {
    type: DataTypes.UUID,
    allowNull: false // Usuario con rol DEPOSITO que realizó el ingreso
  },
  // Ubicación física dentro del depósito
  sector: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fila: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numero_espacio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  foto_ingreso_url: {
    type: DataTypes.STRING,
    allowNull: true // Foto tomada al ingresar el vehículo al depósito
  },
  // JSON con inventario de objetos encontrados dentro del vehículo
  inventario_objetos: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  fecha_hora_ingreso: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_hora_egreso: {
    type: DataTypes.DATE,
    allowNull: true // Null mientras el vehículo esté en el depósito
  },
  razon_egreso: {
    type: DataTypes.TEXT,
    allowNull: true // Motivo de salida: liberación, subasta, traslado, etc.
  }
}, {
  sequelize,
  modelName: 'Deposito',
  tableName: 'depositos',
  indexes: [
    { fields: ['institucion_id'] },
    { fields: ['responsable_id'] },
    { unique: true, fields: ['retencion_id'] },
    { fields: ['fecha_hora_ingreso'] },
    { fields: ['fecha_hora_egreso'] }
  ]
});

export default Deposito;
