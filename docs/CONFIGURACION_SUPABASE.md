# 🚀 Configuración de Supabase para SIGEVIR

Guía paso a paso para configurar Supabase como sistema de autenticación y perfiles.

---

## 📋 Requisitos

- Una cuenta en [Supabase](https://supabase.com) (plan Free suficiente para desarrollo)
- Proyecto SIGEVIR configurado localmente

---

## 1️⃣ Crear proyecto en Supabase

1. Ingresá a [https://supabase.com](https://supabase.com) e iniciá sesión
2. Hacé clic en **"New project"**
3. Completá:
   - **Name:** sigevir
   - **Database Password:** (generar o crear una segura)
   - **Region:** Elegí la más cercana (US East, South America, etc.)
   - **Pricing Plan:** Free
4. Esperá a que termine la creación (~2 minutos)

---

## 2️⃣ Ejecutar SQL de configuración

1. En el dashboard de Supabase, andá a **SQL Editor**
2. Hacé clic en **"New query"**
3. Copiá y pegá el contenido de database/supabase_setup.sql
4. Ejecutá el script (botón **"Run"**)

Esto creará:
- ✅ Tabla 	ipos_personal con seed data
- ✅ Tabla perfiles vinculada a uth.users
- ✅ Trigger handle_new_user() para crear perfil automáticamente
- ✅ Índices en campos clave
- ✅ Row Level Security (RLS) con políticas por rol
- ✅ Tabla uditoria_perfiles

---

## 3️⃣ Configurar autenticación

### Email/Password

1. Andá a **Authentication → Providers**
2. Asegurate de que **Email** esté habilitado
3. Configuración recomendada:
   - **Confirm email:** ON (los usuarios deben verificar su email)
   - **Secure email change:** ON
   - **Minimum password length:** 8

### Google OAuth (correos institucionales)

Para que los usuarios entren con `@tu-institucion.gob.ar` (Google Workspace), seguí la guía detallada:

**→ [docs/GOOGLE_OAUTH_INSTITUCIONAL.md](./GOOGLE_OAUTH_INSTITUCIONAL.md)**

Resumen rápido:

1. En **Authentication → Providers**, habilitá **Google**
2. En [Google Cloud Console](https://console.cloud.google.com): OAuth **Interno** (Workspace) + Client ID web
3. Redirect URI: `https://<tu-proyecto>.supabase.co/auth/v1/callback`
4. En `frontend/.env`: `VITE_ALLOWED_EMAIL_DOMAINS=dominio1.gob.ar,dominio2.gob.ar`
5. En Supabase **URL Configuration**: agregar `http://localhost:5173/auth/callback` (dev)

---

## 4️⃣ Obtener credenciales

En el dashboard de Supabase, andá a **Project Settings → API**:

| Variable | Dónde encontrarla |
|----------|------------------|
| VITE_SUPABASE_URL | **Project URL** (ej: https://abc123.supabase.co) |
| VITE_SUPABASE_ANON_KEY | **anon public** (puede exponerse en frontend) |
| SUPABASE_SERVICE_ROLE_KEY | **service_role secret** (⚠️ NUNCA en frontend) |

---

## 5️⃣ Configurar variables de entorno

### Frontend (rontend/.env)

`env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ALLOWED_EMAIL_DOMAINS=policia.gob.ar,fiscalia.gob.ar
`

### Backend (ackend/.env)

`env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
`

---

## 6️⃣ Verificar funcionamiento

### Probar registro

1. Iniciá el frontend y backend
2. Andá a http://localhost:5173/register
3. Completá el formulario de registro
4. Verificá que:
   - [ ] Se crea el usuario en Supabase Auth
   - [ ] Se envía email de verificación (si está habilitado)
   - [ ] Se crea el perfil automáticamente en tabla perfiles

### Probar login

1. Andá a http://localhost:5173/login
2. Iniciá sesión con el usuario creado
3. Verificá que:
   - [ ] La sesión se inicia correctamente
   - [ ] El perfil se carga desde Supabase
   - [ ] Las rutas protegidas funcionan

### Probar RLS

1. En el SQL Editor de Supabase, ejecutá:
   `sql
   SELECT * FROM perfiles;
   `
2. Verificá que solo veas los perfiles según tu rol:
   - dmin → todos
   - iscal_juez → todos
   - gente_campo → solo su institución
   - deposito → solo su institución

---

## 🔧 Troubleshooting

### Error: "Supabase no configurado"

Las variables de entorno no están configuradas. Verificá:
- VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en frontend
- SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en backend

### Error: "Token inválido o expirado"

- El token JWT de Supabase expiró. El frontend debería renovarlo automáticamente
- Verificá que el reloj del sistema esté sincronizado

### Error: "No se crea el perfil automáticamente"

- Revisá que el trigger handle_new_user() esté creado:
  `sql
  SELECT * FROM information_schema.triggers 
  WHERE event_object_table = 'users' AND trigger_schema = 'auth';
  `
- Verificá los logs de Supabase: **Database → Logs**

### Error en Google OAuth

- Verificá la URI de redirección en Google Cloud Console
- Asegurate de que el provider esté habilitado en Supabase
- Probá el flujo completo: login → redirect → callback

---

## 🧪 Modo desarrollo sin Supabase

Si todavía no creaste el proyecto de Supabase, podés trabajar en el frontend y backend parcialmente:

- **Frontend:** La app detecta que Supabase no está configurado y muestra un mensaje. Podés seguir desarrollando UI/UX
- **Backend:** Las rutas protegidas devuelven 503 "Supabase no configurado". La lógica de negocio (retenciones, etc.) sigue funcionando si se accede directamente
- **Registro/Login:** No funcionarán hasta configurar Supabase

---

## 📚 Referencias

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Google OAuth with Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)
