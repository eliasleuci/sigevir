import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class FotoRetencion extends Model {}

FotoRetencion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  retencion_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // URL del archivo en S3
  url_s3: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true // Ej: "Frente", "Lateral derecho", "Daños en guardabarros"
  },
  // Orden de visualización en el acta/expediente
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'FotoRetencion',
  tableName: 'fotos_retenciones',
  updatedAt: false, // Las fotos no se editan, se reemplazan
  indexes: [
    { fields: ['retencion_id'] }
  ]
});

export default FotoRetencion;
