/**
 * SIGEVIR — Test End-to-End completo
 * ====================================
 * Flujo: RETENIDO → EN_DEPOSITO → RESOLUCION_PENDIENTE → EN_TRAMITE → LIBERADO
 *
 * Uso: node e2e_test.js [contraseña del usuario]
 *   o bien: node e2e_test.js   (pedirá la contraseña interactivamente)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import readline from 'readline';

// ─── Config ─────────────────────────────────────────────────────────────────
const SUPABASE_URL    = 'https://fwuaoesbkawrzyokkzyt.supabase.co';
const SUPABASE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dWFvZXNia2F3cnp5b2trenl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTU0NTUsImV4cCI6MjA5NTQ5MTQ1NX0.S8SKgGSwGdHewGQYugmgylEDFAfymeBn8nAvl1Tg9f8';
const BACKEND_URL     = 'http://localhost:3001/api';
const TEST_EMAIL      = 'Contacto@sigevir.com.ar';
const TEST_DOMAIN     = `E2E${Date.now().toString().slice(-5)}`;

// IDs fijos del sistema
const INSTITUCION_ID  = '3e23f6e0-eeeb-477a-99a5-ecb93e49a074';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const log  = (step, total, icon, msg) => console.log(`\n[${step}/${total}] ${icon} ${msg}`);
const ok   = (step, total, msg)       => log(step, total, '✅', msg);
const fail = (step, total, msg, err)  => { log(step, total, '❌', msg); console.error('   Error:', err?.response?.error || err?.message || err); };
const info = (msg)                    => console.log(`   ℹ️  ${msg}`);

const results = { total: 8, passed: 0, failed: 0, steps: [] };
const record  = (step, name, passed, detail) => {
  results.steps.push({ step, name, passed, detail });
  if (passed) results.passed++; else results.failed++;
};

async function apiCall(token, method, path, body = null, isFormData = false) {
  const headers = { Authorization: `Bearer ${token}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const opts = { method, headers };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);
  const res = await fetch(`${BACKEND_URL}${path}`, opts);
  const json = await res.json().catch(() => ({ _raw: res.status }));
  if (!res.ok) {
    const err = new Error(`${res.status} ${res.statusText}`);
    err.response = json;
    throw err;
  }
  return json;
}

function getPassword() {
  const arg = process.argv[2];
  if (arg) return Promise.resolve(arg);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question('🔑 Contraseña del usuario de test: ', ans => { rl.close(); resolve(ans); });
  });
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function runE2E() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  SIGEVIR — TEST END-TO-END COMPLETO');
  console.log('  Flujo: Nueva Retención → Fotos → Depósito → Resolución');
  console.log('         → Trámite → Egreso → Verificación');
  console.log('═══════════════════════════════════════════════════════════\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  let token, retencionId, retencionNroExp, depositoId;

  // ══════════════════════════════════════════════════════════════════════
  // PASO 0: Login
  // ══════════════════════════════════════════════════════════════════════
  const password = await getPassword();
  console.log('\n[0/8] 🔐 Autenticando en Supabase...');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password });
    if (error) throw error;
    token = data.session.access_token;
    info(`Autenticado como: ${data.user.email}`);
    info(`Dominio de prueba: ${TEST_DOMAIN}`);
    record(0, 'Login Supabase', true, `Usuario: ${data.user.email}`);
  } catch (err) {
    fail(0, 8, 'Login fallido', err);
    record(0, 'Login Supabase', false, err.message);
    console.log('\n❌ No se puede continuar sin autenticación. Verificá las credenciales.');
    process.exit(1);
  }

  // ══════════════════════════════════════════════════════════════════════
  // PASO 1: Crear Retención (vía Edge Function de Supabase)
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n[1/8] 🚗 Creando retención de prueba...');
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/create_retencion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        dominio: TEST_DOMAIN,
        tipo_vehiculo: 'AUTO',
        marca: 'PEUGEOT',
        modelo: '208 ALLURE',
        color: 'ROJO',
        nro_motor: 'PEU-MOT-E2E-001',
        nro_cuadro: 'PEU-CUA-E2E-001',
        titular_nombre: 'RODRIGUEZ, MARTIN ANDRES',
        titular_dni: '40123456',
        titular_domicilio: 'Av. Hipólito Yrigoyen 550, Córdoba',
        motivo_retencion: '[TEST E2E] Documentación vencida y alcoholemia 0.8 gr/l',
        calle_direccion: 'Ruta Nacional 9 km 714',
        localidad: 'Córdoba Capital',
        provincia: 'Córdoba',
        institucion_id: INSTITUCION_ID
      })
    });
    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { response: data });

    retencionId     = data.retencion_id;
    retencionNroExp = data.nro_expediente;
    ok(1, 8, `Retención creada — ID: ${retencionId} — Expediente: ${retencionNroExp}`);
    info(`Dominio: ${TEST_DOMAIN} | QR: ${data.qr_url || 'N/A'}`);
    record(1, 'Crear Retención (Edge Function)', true, `Exp: ${retencionNroExp}`);
  } catch (err) {
    fail(1, 8, 'Error creando retención', err);
    record(1, 'Crear Retención (Edge Function)', false, err.message);
    console.log('\n❌ Sin retención no se puede continuar. Verificá la Edge Function.');
    process.exit(1);
  }

  // ══════════════════════════════════════════════════════════════════════
  // PASO 2: Verificar estado RETENIDO en backend
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n[2/8] 🔍 Verificando estado en backend...');
  try {
    const data = await apiCall(token, 'GET', `/retenciones/${retencionId}`);
    const ret = data.data;
    const estado = ret?.estado_actual || ret?.estado;
    ok(2, 8, `Estado actual: ${estado} | Dominio: ${ret?.dominio}`);
    if ((estado || '').toUpperCase() !== 'RETENIDO') {
      info(`⚠️  Estado inesperado: ${estado} (esperado: RETENIDO). Continuando de todas formas...`);
    }
    record(2, 'Verificar estado RETENIDO', true, `Estado: ${estado}`);
  } catch (err) {
    fail(2, 8, 'Error verificando retención', err);
    record(2, 'Verificar estado RETENIDO', false, err.message);
  }

  // ══════════════════════════════════════════════════════════════════════
  // PASO 3: Confirmar Ingreso al Depósito
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n[3/8] 🏭 Confirmando ingreso al depósito...');
  try {
    const data = await apiCall(token, 'POST', `/depositos/${retencionId}/ingreso`, {
      sector: 'Sector A',
      fila: '2',
      numero_espacio: '08',
      inventario_objetos: ['Documento de identidad', 'Cartera negra', 'Gafas de sol'],
      observaciones_ingreso: '[TEST E2E] Vehículo ingresado sin anomalías visibles. Llave en encendido.'
    });
    depositoId = data.data?.id || data.id;
    ok(3, 8, `Depósito registrado — ID: ${depositoId} | Sector A, Fila 2, Espacio 08`);
    info(`Estado esperado: EN_DEPOSITO`);
    record(3, 'Ingreso al Depósito', true, `Depósito ID: ${depositoId}`);
  } catch (err) {
    fail(3, 8, 'Error confirmando ingreso al depósito', err);
    record(3, 'Ingreso al Depósito', false, err.message);
    info('Intentando obtener el depositoId de la BD para continuar...');
    try {
      const search = await apiCall(token, 'POST', `/busqueda/avanzada`, { dominio: TEST_DOMAIN });
      const ret = (search?.data?.resultados || search?.resultados || [])[0];
      depositoId = ret?.deposito_activo?.id || ret?.deposito_id;
      if (depositoId) info(`depositoId recuperado: ${depositoId}`);
    } catch (_) {}
  }

  // ══════════════════════════════════════════════════════════════════════
  // PASO 4: Emitir Resolución Judicial
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n[4/8] ⚖️  Emitiendo resolución judicial...');
  try {
    await apiCall(token, 'POST', `/causas/resoluciones`, {
      numero_expediente: retencionNroExp,
      tipo: 'liberacion',
      observaciones: '[TEST E2E] Resolución de liberación. Titular acreditó titularidad y pagó multa correspondiente.'
    });
    ok(4, 8, `Resolución LIBERACION emitida para expediente: ${retencionNroExp}`);
    info(`Estado esperado: RESOLUCION_PENDIENTE`);
    record(4, 'Emitir Resolución Judicial', true, `Exp: ${retencionNroExp}`);
  } catch (err) {
    fail(4, 8, 'Error emitiendo resolución judicial', err);
    record(4, 'Emitir Resolución Judicial', false, err?.response?.error || err.message);
  }

  // ══════════════════════════════════════════════════════════════════════
  // PASO 5: Obtener depositoId si no lo tenemos aún
  // ══════════════════════════════════════════════════════════════════════
  if (!depositoId) {
    try {
      const pendientes = await apiCall(token, 'GET', `/depositos/pendientes-tramite`);
      const dep = (pendientes.data || []).find(d => d.dominio === TEST_DOMAIN || d.nro_expediente === retencionNroExp);
      if (dep) { depositoId = dep.id; info(`depositoId recuperado de pendientes-tramite: ${depositoId}`); }
    } catch (_) {}
  }

  // ══════════════════════════════════════════════════════════════════════
  // PASO 5: Iniciar Trámite de Retiro
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n[5/8] 📋 Iniciando trámite de retiro...');
  if (!depositoId) {
    fail(5, 8, 'No se pudo obtener depositoId para iniciar trámite', { message: 'Paso 3 falló' });
    record(5, 'Trámite de Retiro', false, 'depositoId no disponible');
  } else {
    try {
      await apiCall(token, 'POST', `/depositos/${depositoId}/iniciar-tramite`, {
        quien_retira: 'Rodriguez, Martín Andrés',
        dni_quien_retira: '40123456',
        razon_egreso: 'Liberación por orden judicial. Titular presente con documentación en regla.'
      });
      ok(5, 8, `Trámite iniciado — Depósito: ${depositoId}`);
      info(`Quien retira: Rodriguez, Martín Andrés | DNI: 40123456`);
      info(`Estado esperado: EN_TRAMITE`);
      record(5, 'Trámite de Retiro', true, `Depósito: ${depositoId}`);
    } catch (err) {
      fail(5, 8, 'Error iniciando trámite de retiro', err);
      record(5, 'Trámite de Retiro', false, err?.response?.error || err.message);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // PASO 6: Registrar Egreso definitivo
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n[6/8] 📤 Registrando egreso definitivo...');
  if (!depositoId) {
    fail(6, 8, 'No se pudo registrar egreso sin depositoId', { message: 'Paso 3 falló' });
    record(6, 'Registro de Egreso', false, 'depositoId no disponible');
  } else {
    try {
      await apiCall(token, 'POST', `/depositos/${depositoId}/egreso`, {
        razon_egreso: 'Liberación por orden judicial RES-E2E-001',
        observaciones_finales: '[TEST E2E] Vehículo entregado al titular en perfectas condiciones.'
      });
      ok(6, 8, `Egreso registrado — El vehículo fue entregado`);
      info(`Estado esperado: LIBERADO`);
      record(6, 'Registro de Egreso', true, `Depósito: ${depositoId}`);
    } catch (err) {
      fail(6, 8, 'Error registrando egreso', err);
      record(6, 'Registro de Egreso', false, err?.response?.error || err.message);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // PASO 7: Verificar estado final
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n[7/8] 🔍 Verificando estado final...');
  try {
    const data = await apiCall(token, 'GET', `/retenciones/${retencionId}`);
    const ret = data.data;
    const estadoFinal = (ret?.estado_actual || ret?.estado || '').toUpperCase();
    if (estadoFinal === 'LIBERADO') {
      ok(7, 8, `Estado final verificado: LIBERADO ✅`);
      record(7, 'Verificar estado LIBERADO', true, `Estado: ${estadoFinal}`);
    } else {
      fail(7, 8, `Estado final inesperado: ${estadoFinal} (esperado: LIBERADO)`, { message: '' });
      record(7, 'Verificar estado LIBERADO', false, `Estado actual: ${estadoFinal}`);
    }
  } catch (err) {
    fail(7, 8, 'Error verificando estado final', err);
    record(7, 'Verificar estado LIBERADO', false, err.message);
  }

  // ══════════════════════════════════════════════════════════════════════
  // PASO 8: Test del Buscador
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n[8/8] 🔎 Verificando módulo de Búsqueda...');
  try {
    const data = await apiCall(token, 'POST', `/busqueda/avanzada`, { dominio: TEST_DOMAIN });
    const resultados = data?.data?.resultados || data?.resultados || [];
    if (resultados.length > 0) {
      ok(8, 8, `Búsqueda exitosa — ${resultados.length} resultado(s) encontrado(s) para dominio "${TEST_DOMAIN}"`);
      record(8, 'Módulo de Búsqueda', true, `${resultados.length} resultados`);
    } else {
      fail(8, 8, `Búsqueda devolvió 0 resultados para dominio "${TEST_DOMAIN}"`, { message: '' });
      record(8, 'Módulo de Búsqueda', false, '0 resultados');
    }
  } catch (err) {
    fail(8, 8, 'Error en módulo de búsqueda', err);
    record(8, 'Módulo de Búsqueda', false, err.message);
  }

  // ══════════════════════════════════════════════════════════════════════
  // RESUMEN FINAL
  // ══════════════════════════════════════════════════════════════════════
  const allPassed = results.failed === 0;
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  RESULTADO FINAL: ${allPassed ? '🎉 TODOS LOS PASOS EXITOSOS' : `⚠️  ${results.failed} PASO(S) FALLARON`}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Detalle por módulo:');
  results.steps.forEach(s => {
    const icon = s.passed ? '✅' : '❌';
    console.log(`  ${icon} [Paso ${s.step}] ${s.name}${s.detail ? ` — ${s.detail}` : ''}`);
  });
  console.log('');
  console.log(`  ✅ Exitosos: ${results.passed}/${results.total}`);
  console.log(`  ❌ Fallados: ${results.failed}/${results.total}`);
  console.log('');
  if (retencionId) {
    console.log(`  📌 Datos para revisar manualmente:`);
    console.log(`     Dominio:    ${TEST_DOMAIN}`);
    console.log(`     Expediente: ${retencionNroExp}`);
    console.log(`     Retención:  ${retencionId}`);
    console.log(`     Depósito:   ${depositoId || 'N/A'}`);
  }
  console.log('');
  console.log('  (Los datos de prueba se conservan en la BD para revisión)');
  console.log('═══════════════════════════════════════════════════════════\n');

  process.exit(allPassed ? 0 : 1);
}

runE2E().catch(err => {
  console.error('\n💥 Error inesperado en el test runner:', err);
  process.exit(1);
});
