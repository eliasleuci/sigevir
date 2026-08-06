import db from './src/models/index.js';

async function seedRecentAuditLogs() {
  const [retenciones] = await db.sequelize.query(
    "SELECT id, nro_expediente, dominio FROM retenciones WHERE dominio = 'TEST999' LIMIT 1"
  );
  const ret = retenciones[0] || { id: 'ea516f00-cb51-4cdd-809c-59406098c67c', nro_expediente: 'RET-2026-000008', dominio: 'TEST999' };

  const logs = [
    {
      accion: 'RETENCION_CREADA',
      entidad: 'retencion',
      entidad_id: ret.id,
      usuario_email: 'contacto@sigevir.com.ar',
      usuario_nombre: 'Administrador Total SIGEVIR',
      detalle: { nro_expediente: ret.nro_expediente, dominio: ret.dominio, motivo: 'Falta de casco y documentación' },
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      accion: 'INGRESO_DEPOSITO',
      entidad: 'deposito',
      entidad_id: ret.id,
      usuario_email: 'contacto@sigevir.com.ar',
      usuario_nombre: 'Administrador Total SIGEVIR',
      detalle: { nro_expediente: ret.nro_expediente, sector: 'Sector A', fila: '1', espacio: '05' },
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
    },
    {
      accion: 'RESOLUCION',
      entidad: 'causa',
      entidad_id: ret.id,
      usuario_email: 'contacto@sigevir.com.ar',
      usuario_nombre: 'Administrador Total SIGEVIR',
      detalle: { nro_expediente: ret.nro_expediente, tipo: 'LIBERACION', fundamentos: 'Acredita titularidad y pago' },
      created_at: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      accion: 'INICIAR_TRAMITE',
      entidad: 'deposito',
      entidad_id: ret.id,
      usuario_email: 'contacto@sigevir.com.ar',
      usuario_nombre: 'Administrador Total SIGEVIR',
      detalle: { nro_expediente: ret.nro_expediente, quien_retira: 'Juan Pérez', dni: '30123456' },
      created_at: new Date(Date.now() - 3600000 * 0.5).toISOString()
    },
    {
      accion: 'REGISTRAR_EGRESO',
      entidad: 'deposito',
      entidad_id: ret.id,
      usuario_email: 'contacto@sigevir.com.ar',
      usuario_nombre: 'Administrador Total SIGEVIR',
      detalle: { nro_expediente: ret.nro_expediente, estado_final: 'LIBERADO' },
      created_at: new Date().toISOString()
    }
  ];

  for (const log of logs) {
    await db.sequelize.query(`
      INSERT INTO audit_logs (id, created_at, usuario_email, usuario_nombre, accion, entidad, entidad_id, detalle, origen)
      VALUES (gen_random_uuid(), :created_at, :usuario_email, :usuario_nombre, :accion, :entidad, :entidad_id, :detalle, 'web')
    `, { replacements: { ...log, detalle: JSON.stringify(log.detalle) } });
  }

  console.log('✅ Se crearon 5 registros de auditoría para el flujo completado.');
  process.exit(0);
}

seedRecentAuditLogs().catch(e => { console.error(e); process.exit(1); });
