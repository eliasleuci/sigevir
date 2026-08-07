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
    allowNull: true,
    unique: true,
    field: 'nro_expediente'
  },
  dominio: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  tipo_vehiculo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nro_motor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nro_cuadro: {
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
  titular_domicilio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Remove vehiculo_id reference
  // vehiculo_id: {
  //   type: DataTypes.UUID,
  //   allowNull: false
  // },

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
  pdf_url: {
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
  },

  // ── Datos del procedimiento policial ──────────────────────────────────
  numero_comision: { type: DataTypes.STRING, allowNull: true },
  numero_movil: { type: DataTypes.STRING, allowNull: true },
  colaboracion_especial: {
    // Array de strings: ['BOMBEROS', 'DIV_CANES', 'INFANTERIA', 'SEOM', 'CABALLERIA', 'DEFENSA_CIVIL', 'OTRO']
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  coopera_policia_judicial: { type: DataTypes.BOOLEAN, allowNull: true },

  // ── Consigna (policía que queda en el lugar) ──────────────────────────
  queda_consigna: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
  consigna_nombre: { type: DataTypes.STRING, allowNull: true },
  consigna_cargo: { type: DataTypes.STRING, allowNull: true },
  consigna_dependencia: { type: DataTypes.STRING, allowNull: true },
  consigna_telefono: { type: DataTypes.STRING, allowNull: true },

  // ── Traslado del vehículo ──────────────────────────────────────────────
  tipo_traslado: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isIn: [['PROPIOS_MEDIOS', 'GRUA', null]] }
  },
  grua_dominio: { type: DataTypes.STRING, allowNull: true },
  grua_empresa: { type: DataTypes.STRING, allowNull: true },

  // ── Declaración en unidad judicial ─────────────────────────────────────
  hora_hecho: { type: DataTypes.DATE, allowNull: true },
  numero_hecho: { type: DataTypes.STRING, allowNull: true },
  mecanica_hecho: { type: DataTypes.TEXT, allowNull: true },

  // ── Entorno del lugar ───────────────────────────────────────────────────
  tiene_camaras_privadas: { type: DataTypes.BOOLEAN, allowNull: true },
  tiene_carteles_nomenclatura: { type: DataTypes.BOOLEAN, allowNull: true },
  tiene_reductores_velocidad: { type: DataTypes.BOOLEAN, allowNull: true },
  estado_iluminacion: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isIn: [['BUENA', 'REGULAR', 'MALA', 'SIN_ILUMINACION', null]] }
  },
  estado_calzada: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isIn: [['SECA', 'MOJADA', 'DETERIORADA', 'EN_OBRA', null]] }
  },

  // ── Documentos adicionales ──────────────────────────────────────────────
  croquis_url: { type: DataTypes.STRING, allowNull: true },
  acta_inspeccion_url: { type: DataTypes.STRING, allowNull: true },
  deposito_institucion_id: { type: DataTypes.UUID, allowNull: true },

  // ── Inventario de Vehículo ──────────────────────────────────────────────
  inventario: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  sequelize,
  modelName: 'Retencion',
  tableName: 'retenciones',
  paranoid: true,
  indexes: [
    { fields: ['nro_expediente'] },

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

