# 📑 Índice de archivos SIGEVIR — Actualizado

**Última actualización:** Mayo 2026 | **Estado:** Fases 0-6 implementadas

## 🏗️ Estructura de carpetas

sigevir/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── config/database.js
│   │   ├── middleware/ (auth.js, errorHandler.js, requestLogger.js)
│   │   ├── models/ (10 modelos Sequelize)
│   │   ├── controllers/ (retenciones, depositos, causas, busqueda, notificaciones)
│   │   ├── services/ (retencion, pdf, qr, deposito, causa, socket)
│   │   └── routes/ (todas las rutas de la API)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── config/supabase.js       ← Supabase client + mock data
│   │   ├── context/AuthContext.jsx  ← Auth con modo mock + Supabase
│   │   ├── context/NotificationContext.jsx
│   │   ├── hooks/ (useAuth, useNotifications)
│   │   ├── components/
│   │   │   ├── common/ (ProtectedRoute, Layout, Navbar)
│   │   │   ├── registro/ (Formulario, CargaFotos, PreviewActa, MuestraQR)
│   │   │   ├── deposito/ (ScannerQR, FormularioConfirmacion, Egreso, Inventario)
│   │   │   ├── judicial/ (Buscador, Historial, Galeria, Timeline, Resolucion)
│   │   │   ├── busqueda/ (Filtros, TablaResultados)
│   │   │   └── admin/ (GestionUsuarios, GestionTipos)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         ← Con credenciales demo
│   │   │   ├── RegisterPage.jsx      ← 3 pasos con preview de rol
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BusquedaPage.jsx
│   │   │   ├── AdministracionPage.jsx
│   │   │   ├── UnauthorizedPage.jsx  ← Nueva
│   │   │   ├── AuthCallbackPage.jsx
│   │   │   ├── deposito/ (ConfirmarIngreso, RegistrarEgreso)
│   │   │   ├── judicial/ (GestionCausas)
│   │   │   └── admin/ (GestionRolesPage)
│   │   ├── services/apiClient.js
│   │   └── styles/index.css
│   └── package.json
│
├── database/
│   ├── schema.sql          ← Esquema PostgreSQL original
│   └── supabase_setup.sql  ← SQL para ejecutar en Supabase cuando esté listo
│
├── docs/
│   └── COMO_CONECTAR_SUPABASE.md
│
├── usuarios.txt            ← Credenciales demo (roles en minúscula)
├── README.md
├── PROGRESO.md
├── INDEX.md
└── package.json
