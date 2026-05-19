import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

class Usuario extends Model {
  // Método para verificar password
  async checkPassword(password) {
    if (!this.password_hash) return false;
    return await bcrypt.compare(password, this.password_hash);
  }
}

Usuario.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  institucion_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  nombre_completo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Debe ser un email válido' }
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true // Puede ser nulo si usa Google OAuth
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  rol: {
    type: DataTypes.ENUM('admin', 'ADMIN_INSTITUCION', 'fiscal_juez', 'agente_campo', 'deposito', 'CONTROLADOR'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['admin', 'ADMIN_INSTITUCION', 'fiscal_juez', 'agente_campo', 'deposito', 'CONTROLADOR']],
        msg: 'Rol no válido'
      }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true
  },
  intentos_fallidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bloqueado_hasta: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reset_password_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Usuario',
  tableName: 'usuarios',
  paranoid: true, // Soft delete
  hooks: {
    beforeSave: async (usuario) => {
      // Validar que tenga password O google_id
      if (!usuario.password_hash && !usuario.google_id) {
        throw new Error('El usuario debe tener una contraseña o un ID de Google');
      }
      // Hashear password si cambió
      if (usuario.changed('password_hash') && usuario.password_hash) {
        const salt = await bcrypt.genSalt(10);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    }
  },
  scopes: {
    active: {
      where: { activo: true }
    }
  }
});

export default Usuario;
