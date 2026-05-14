import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Institucion extends Model {}

Institucion.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'El nombre de la institución ya existe'
    },
    validate: {
      notEmpty: { msg: 'El nombre no puede estar vacío' }
    }
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [['POLICIAL', 'JUDICIAL', 'MUNICIPAL', 'NACIONAL', 'OTRO']],
        msg: 'Tipo de institución no válido'
      }
    }
  },
  jurisdiccion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: { msg: 'Logo URL debe ser una URL válida' }
    }
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Institucion',
  tableName: 'instituciones',
  paranoid: true, // Soft delete
  scopes: {
    active: {
      where: { activa: true }
    }
  }
});

export default Institucion;
