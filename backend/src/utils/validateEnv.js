/**
 * Verifica que todas las variables de entorno críticas estén configuradas.
 * Si alguna falta, el servidor NO arranca. Previene deployar con config incompleta.
 */
const VARS_REQUERIDAS_PROD = [
  'NODE_ENV',
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'FRONTEND_URL',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
];

const VARS_REQUERIDAS_DEV = [
  'NODE_ENV',
  'PORT',
];

export const validateEnv = () => {
  const vars = process.env.NODE_ENV === 'production'
    ? VARS_REQUERIDAS_PROD
    : VARS_REQUERIDAS_DEV;

  const faltantes = vars.filter(v => !process.env[v]);

  if (faltantes.length > 0) {
    console.error('❌ Variables de entorno faltantes:');
    faltantes.forEach(v => console.error(`   - ${v}`));
    console.error('\n⚠️  El servidor no puede arrancar sin estas variables.');
    process.exit(1);
  }

  // Validaciones adicionales
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET?.length < 32) {
      console.error('❌ JWT_SECRET debe tener al menos 32 caracteres en producción');
      process.exit(1);
    }
    if (process.env.SUPABASE_URL?.includes('your_supabase')) {
      console.error('❌ SUPABASE_URL tiene valor placeholder. Configurar el valor real.');
      process.exit(1);
    }
  }

  console.log('✅ Variables de entorno validadas correctamente');
};
