import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Deposito extends Model {}

Deposito.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // RelaciÃ³n 1:1 con Retencion â€” una retenciÃ³n tiene un Ãºnico depÃ³sito activo
  retencion_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  institucion_id: {
    type: DataTypes.UUID,
    allowNull: false // InstituciÃ³n dueÃ±a del depÃ³sito fÃ­sico
  },
  responsable_id: {
    type: DataTypes.UUID,
    allowNull: false // Usuario con rol DEPOSITO que realizÃ³ el ingreso
  },
  // UbicaciÃ³n fÃ­sica dentro del depÃ³sito
  sector: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fila: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numero_espacio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  foto_ingreso_url: {
    type: DataTypes.STRING,
    allowNull: true // Foto tomada al ingresar el vehÃ­culo al depÃ³sito
  },
  // JSON con inventario de objetos encontrados dentro del vehÃ­culo
  inventario_objetos: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  fecha_hora_ingreso: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_hora_egreso: {
    type: DataTypes.DATE,
    allowNull: true // Null mientras el vehÃ­culo estÃ© en el depÃ³sito
  },
  documentos_egreso: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  quien_retira: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dni_quien_retira: {
    type: DataTypes.STRING,
    allowNull: true
  },
  razon_egreso: {
    type: DataTypes.TEXT,
    allowNull: true // Motivo de salida: liberaciÃ³n, subasta, traslado, etc.
  }
}, {
  sequelize,
  modelName: 'Deposito',
  tableName: 'depositos',
  indexes: [
    { fields: ['institucion_id'] },
    { fields: ['responsable_id'] },
    { unique: true, fields: ['retencion_id'] },
    { fields: ['fecha_hora_ingreso'] },
    { fields: ['fecha_hora_egreso'] }
  ]
});

export default Deposito;

