import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class PersonaInvolucrada extends Model {}

PersonaInvolucrada.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  retencion_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  rol: {
    // Rol de la persona en el hecho
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['CONDUCTOR', 'ACOMPANANTE', 'PEATON', 'TESTIGO', 'OTRO']]
    }
  },
  nombre_completo: { type: DataTypes.STRING, allowNull: false },
  edad: { type: DataTypes.INTEGER, allowNull: true },
  dni: { type: DataTypes.STRING, allowNull: true },
  domicilio: { type: DataTypes.STRING, allowNull: true },
  telefono: { type: DataTypes.STRING, allowNull: true },
  es_lesionado: { type: DataTypes.BOOLEAN, defaultValue: false },
  tipo_lesion: { type: DataTypes.STRING, allowNull: true },
  nosocomio_traslado: { type: DataTypes.STRING, allowNull: true },
}, {
  sequelize,
  modelName: 'PersonaInvolucrada',
  tableName: 'personas_involucradas',
  timestamps: true,
  underscored: true,
});

export default PersonaInvolucrada;
