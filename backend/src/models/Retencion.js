import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Retencion extends Model {}

Retencion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  numero_expediente: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  vehiculo_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  institucion_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  agente_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  fecha_hora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  provincia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  localidad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  calle_direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  longitud: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  motivo_retencion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  versus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  num_cooperacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  num_sumario: {
    type: DataTypes.STRING,
    allowNull: true
  },
  num_sac: {
    type: DataTypes.STRING,
    allowNull: true
  },
  titular_nombre: {
    type: DataTypes.STRING,
    allowNull: true
  },
  titular_dni: {
    type: DataTypes.STRING,
    allowNull: true
  },
  titular_contacto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deposito_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  qr_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  acta_pdf_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado_actual: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'RETENIDO',
    validate: {
      isIn: [['RETENIDO', 'EN_DEPOSITO', 'RESOLUCION_PENDIENTE', 'EN_TRAMITE', 'LIBERADO', 'SUBASTADO', 'COMPACTADO']]
    }
  }
}, {
  sequelize,
  modelName: 'Retencion',
  tableName: 'retenciones',
  paranoid: true,
  indexes: [
    { fields: ['numero_expediente'] },
    { fields: ['vehiculo_id'] },
    { fields: ['institucion_id'] },
    { fields: ['fecha_hora'] },
    { fields: ['estado_actual'] }
  ],
  scopes: {
    pendiente: {
      where: { estado_actual: 'RETENIDO' }
    }
  }
});

export default Retencion;

