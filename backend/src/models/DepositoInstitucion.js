import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Representa el DEPOSITO FISICO como lugar (no confundir con el modelo
 * `Deposito.js` que registra el ingreso de UN vehiculo especifico).
 * Este modelo es el catalogo de depositos disponibles para elegir.
 */
class DepositoInstitucion extends Model {}

DepositoInstitucion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  institucion_id: { type: DataTypes.UUID, allowNull: false },
  nombre: { type: DataTypes.STRING, allowNull: false },
  direccion: { type: DataTypes.STRING, allowNull: false },
  latitud: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  longitud: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
  capacidad_maxima: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 50 },
  telefono_contacto: { type: DataTypes.STRING, allowNull: true },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  modelName: 'DepositoInstitucion',
  tableName: 'depositos_instituciones',
  timestamps: true,
  underscored: true,
});

export default DepositoInstitucion;
