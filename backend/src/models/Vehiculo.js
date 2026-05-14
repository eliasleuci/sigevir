import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Vehiculo extends Model {}

Vehiculo.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  dominio: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('dominio', value ? value.toUpperCase().trim() : null);
    },
    validate: {
      notEmpty: { msg: 'El dominio (patente) es requerido' }
    }
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo_vehiculo: {
    type: DataTypes.STRING,
    allowNull: false // Auto, Moto, Camioneta, etc.
  },
  numero_motor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numero_cuadro: {
    type: DataTypes.STRING,
    allowNull: true
  },
  danios_visibles: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Vehiculo',
  tableName: 'vehiculos',
  indexes: [
    { unique: true, fields: ['dominio'] },
    { fields: ['numero_motor'] },
    { fields: ['numero_cuadro'] }
  ]
});

export default Vehiculo;
