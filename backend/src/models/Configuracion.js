import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Configuracion extends Model {
    static associate(models) {
      // Sin asociaciones
    }
  }

  Configuracion.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    valor: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'string', // 'string', 'number', 'boolean', 'json'
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'GENERAL', // 'GENERAL', 'VALORES', 'MANTENIMIENTO'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Configuracion',
    tableName: 'configuraciones',
    timestamps: true,
    underscored: true,
  });

  return Configuracion;
};
