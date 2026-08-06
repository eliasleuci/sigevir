import db from './src/models/index.js';

async function main() {
  // Alter table perfiles default value of activo to false
  await db.sequelize.query('ALTER TABLE perfiles ALTER COLUMN activo SET DEFAULT false;');
  await db.sequelize.query('ALTER TABLE perfiles ALTER COLUMN aprobado SET DEFAULT false;');
  console.log('✅ perfiles.activo y aprobado ahora tienen DEFAULT false en PostgreSQL.');

  // Create or replace trigger function to handle new users from Supabase Auth / Google OAuth / Sign up
  const sqlFunction = `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    DECLARE
      v_domain text;
      v_tipo_id uuid;
      v_rol text := 'agente_campo';
    BEGIN
      -- Extraer dominio del email
      v_domain := lower(split_part(NEW.email, '@', 2));

      -- Buscar si existe un tipo de personal con ese dominio_email
      SELECT id, COALESCE(rol, 'agente_campo')
      INTO v_tipo_id, v_rol
      FROM public.tipos_personal
      WHERE LOWER(REPLACE(dominio_email, '@', '')) = v_domain AND activo = true
      LIMIT 1;

      -- Insertar en la tabla perfiles con activo = false (espera de aprobación del admin)
      INSERT INTO public.perfiles (
        id,
        email,
        nombre_completo,
        dni,
        telefono,
        cargo,
        institucion,
        rol,
        tipo_personal_id,
        activo,
        aprobado,
        avatar_url,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'dni',
        NEW.raw_user_meta_data->>'telefono',
        NEW.raw_user_meta_data->>'cargo',
        NEW.raw_user_meta_data->>'institucion',
        COALESCE((NEW.raw_user_meta_data->>'rol'), v_rol, 'agente_campo'),
        COALESCE((NEW.raw_user_meta_data->>'tipo_personal_id')::uuid, v_tipo_id),
        false, -- Siempre pendiente de aprobación del administrador
        false,
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nombre_completo = COALESCE(EXCLUDED.nombre_completo, public.perfiles.nombre_completo),
        updated_at = NOW();

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  await db.sequelize.query(sqlFunction);
  console.log('✅ Función PL/pgSQL handle_new_user() actualizada.');

  // Check if trigger exists on auth.users
  const sqlTrigger = `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
      ) THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      END IF;
    END
    $$;
  `;
  await db.sequelize.query(sqlTrigger);
  console.log('✅ Trigger on_auth_user_created configurado en auth.users.');

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
