# Google OAuth con correos institucionales — SIGEVIR

Guía para que los usuarios ingresen con su cuenta de **Google Workspace** (ej. `nombre@policia.gob.ar`), no con Gmail personal.

---

## Cómo funciona en SIGEVIR

1. El usuario hace clic en **Continuar con correo institucional (Google)** en `/login`.
2. Supabase redirige a Google OAuth.
3. Google devuelve a Supabase → tu app en `/auth/callback`.
4. Se valida el dominio del email (si configuraste `VITE_ALLOWED_EMAIL_DOMAINS`).
5. Se carga el perfil en la tabla `perfiles` y entra al dashboard.

**No necesitás** `VITE_GOOGLE_CLIENT_ID` en el frontend: las credenciales OAuth van en **Supabase**, no en React.

---

## Requisitos de la institución

| Requisito | Detalle |
|-----------|---------|
| Google Workspace | Correos `@tudominio.gob.ar` administrados por la institución |
| Proyecto Google Cloud | OAuth Client ID tipo **Aplicación web** |
| Proyecto Supabase | Provider **Google** habilitado |
| Dominio permitido | Variable `VITE_ALLOWED_EMAIL_DOMAINS` en producción |

Los usuarios con `@gmail.com` **no** deberían poder entrar si restringís dominios.

---

## Paso 1 — Google Cloud Console

1. [console.cloud.google.com](https://console.cloud.google.com) → proyecto de la institución (o uno dedicado a SIGEVIR).
2. **APIs y servicios → Pantalla de consentimiento OAuth**
   - Tipo: **Interno** (solo usuarios de tu Google Workspace) **recomendado para instituciones**
   - O **Externo** + dominios verificados si varias instituciones comparten la app
3. **Credenciales → Crear credenciales → ID de cliente de OAuth**
   - Tipo: **Aplicación web**
   - **URIs de redirección autorizados** (obligatorio):

     ```
     https://<TU-PROYECTO>.supabase.co/auth/v1/callback
     ```

     Ejemplo: `https://abcdefghij.supabase.co/auth/v1/callback`

4. Copiá **Client ID** y **Client secret**.

### Producción (cuando despliegues el frontend)

En Google Cloud, agregá también la URL de tu app si usás redirect adicional; con Supabase el callback principal es el de Supabase.

En **Supabase → Authentication → URL Configuration**:

- **Site URL:** `https://tu-dominio.gob.ar` (o `http://localhost:5173` en dev)
- **Redirect URLs:** `http://localhost:5173/auth/callback`, `https://tu-dominio.gob.ar/auth/callback`

---

## Paso 2 — Supabase

1. **Authentication → Providers → Google** → Activar
2. Pegar **Client ID** y **Client Secret** de Google Cloud
3. Guardar

---

## Paso 3 — Variables de entorno (frontend)

Archivo `frontend/.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Dominios institucionales permitidos (separados por coma)
VITE_ALLOWED_EMAIL_DOMAINS=policia.gob.ar,fiscalia.gob.ar,jus.gob.ar
```

- Con **un solo** dominio, Google muestra preferentemente cuentas de ese dominio (`hd`).
- Con **varios** dominios, la validación estricta ocurre en `/auth/callback` al volver de Google.

Backend (`backend/.env`):

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=http://localhost:5173
```

---

## Paso 4 — SQL en Supabase

Ejecutá una vez `database/supabase_setup.sql` en el SQL Editor. El trigger `handle_new_user` crea el registro en `perfiles` cuando alguien entra por primera vez con Google.

**Importante:** el primer login con Google crea perfil con rol por defecto `agente_campo`. El usuario debe **completar registro** (tipo de personal, institución) o un **admin** debe ajustar el rol en `perfiles`.

---

## Paso 5 — Probar

1. `npm run dev` (raíz) o backend + frontend por separado
2. Abrí `http://localhost:5173/login`
3. Clic en **Continuar con correo institucional (Google)**
4. Elegí cuenta `@tu-dominio.institucional`
5. Deberías volver a `/auth/callback` y luego `/dashboard`

---

## Seguridad recomendada

1. **Google Workspace "Interno"** en consent screen → solo cuentas de la organización.
2. **`VITE_ALLOWED_EMAIL_DOMAINS`** en producción → rechaza otros dominios aunque pasen Google.
3. **Confirm email** en Supabase para registro con contraseña; OAuth de Google ya verifica el email.
4. Revisar usuarios en **Supabase → Authentication → Users** y tabla `perfiles`.

---

## Errores frecuentes

| Error | Solución |
|-------|----------|
| `redirect_uri_mismatch` | La URI en Google debe ser exactamente `https://XXX.supabase.co/auth/v1/callback` |
| Botón Google no hace nada | Falta `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` |
| "Solo correos institucionales" | El email no está en `VITE_ALLOWED_EMAIL_DOMAINS` |
| Usuario sin acceso a rutas | Perfil sin `tipo_personal_id` → completar en `/register` |
| Backend 401 | Usuario existe en Supabase pero no en tabla `usuarios` de PostgreSQL local |

---

## Archivos del código relacionados

| Archivo | Rol |
|---------|-----|
| `frontend/src/context/AuthContext.jsx` | `signInWithOAuth({ provider: 'google' })` |
| `frontend/src/pages/AuthCallbackPage.jsx` | Valida dominio y perfil tras el redirect |
| `frontend/src/utils/emailDomains.js` | Lista de dominios permitidos |
| `frontend/src/pages/Login.jsx` | Botón de login Google |
| `database/supabase_setup.sql` | Trigger `perfiles` al crear usuario |

---

## Referencias

- [Supabase — Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth hd parameter](https://developers.google.com/identity/protocols/oauth2/openid-connect#hd-parameter)
