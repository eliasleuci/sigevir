# Plan de diagnóstico y corrección del login con Google

## Objetivo
Resolver el problema que impide iniciar sesión mediante Google OAuth, que actualmente muestra un error y no redirige al dashboard.

## Pasos a seguir
1. **Reproducir el error y capturar logs**
   - Abrir la consola del navegador (F12) antes de pulsar "Iniciar sesión con Google".
   - Capturar cualquier mensaje de error en la consola y en la pestaña "Network".
2. **Verificar variables de entorno**
   - Comprobar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están definidas y son correctas.
   - Asegurarse de que `SUPABASE_READY` sea `true` (ver `frontend/src/config/supabase.js`).
3. **Comprobar URL de redirección en Supabase**
   - En el panel de Supabase > Authentication > Settings > Redirect URLs, asegurarse de que la URL usada por Vite (por ejemplo `http://localhost:5173/auth/callback`) está listada.
   - Si Vite usa otro puerto, actualizar la variable o crear `VITE_SUPABASE_REDIRECT_URL` y usarla en `loginWithGoogle`.
4. **Añadir logs detallados**
   - En `loginWithGoogle` (AuthContext) registrar `hostedDomain` y la respuesta completa de `supabase.auth.signInWithOAuth`.
   - En `AuthCallbackPage.jsx` registrar `session`, `error` y la URL completa recibida.
5. **Asegurar que el parámetro `hd` (hosted domain) es correcto**
   - Si `VITE_ALLOWED_EMAIL_DOMAINS` está vacío, `getPrimaryHostedDomain` devuelve `null`; si contiene varios dominios, no se envía `hd`. Verificar que la lógica coincide con lo esperado.
6. **Prueba iterativa**
   - Ejecutar `npm run dev` y, si corresponde, `npm run approve:dev`.
   - Intentar login con Google y observar la consola.
   - Si el error persiste, copiar el mensaje exacto y compartirlo.
7. **Mejorar manejo de errores en UI**
   - Actualizar `AuthCallbackPage` para mostrar el mensaje de error al usuario en lugar de simplemente redirigir a `/login`.

## Verificación
- El flujo debe: pulsar botón → popup de Google → redirección a `/auth/callback` → `AuthCallbackPage` procesa sesión → redirige a `/dashboard` sin errores.
- La consola no debe mostrar errores de red o de Supabase.
- En Supabase, la tabla `perfiles` debe contener al usuario con los campos correctos.

## Preguntas al usuario
- ¿Cuál es el mensaje exacto que aparece en la consola después de intentar iniciar sesión con Google?
- ¿Qué puerto muestra Vite al iniciar (`npm run dev`), y cuál es la URL de redirección configurada en Supabase?
- ¿Hay algún dominio permitido en `VITE_ALLOWED_EMAIL_DOMAINS` o está vacío?
