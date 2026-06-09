import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ResolucionJudicial extends Model {}

ResolucionJudicial.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Relación 1:1 con Retencion — una retención tiene una única resolución judicial final
  retencion_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  // Usuario con rol fiscal_juez que emitió la resolución
  usuario_judicial_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'magistrado_id'
  },
  // Tipo determina el destino final del vehículo
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'tipo_resolucion'
  },
  // URL al documento firmado en S3
  documento_url: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'archivo_url'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'descripcion'
  },
  fecha_emision: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'fecha_resolucion'
  }
}, {
  sequelize,
  modelName: 'ResolucionJudicial',
  tableName: 'resoluciones_judiciales',
  updatedAt: false, // Las resoluciones no se editan después de emitidas
  createdAt: false
});

export default ResolucionJudicial;
