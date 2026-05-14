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
  // Usuario con rol FISCAL_JUEZ que emitió la resolución
  usuario_judicial_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // Tipo determina el destino final del vehículo
  tipo: {
    type: DataTypes.ENUM('LIBERACION', 'SUBASTA', 'COMPACTACION'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['LIBERACION', 'SUBASTA', 'COMPACTACION']],
        msg: 'Tipo de resolución no válido. Valores permitidos: LIBERACION, SUBASTA, COMPACTACION'
      }
    }
  },
  // URL al documento firmado en S3
  documento_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_emision: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'ResolucionJudicial',
  tableName: 'resoluciones_judiciales',
  updatedAt: false // Las resoluciones no se editan después de emitidas
});

export default ResolucionJudicial;
