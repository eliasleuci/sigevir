# SIGEVIR - Sistema Integral de Gestión de Vehículos Retenidos

Plataforma web moderna para gestionar el ciclo de vida completo de vehículos retenidos en contextos judiciales.

## 🏗️ Stack Tecnológico

- **Frontend:** React 18 + Vite + TailwindCSS + Framer Motion
- **Backend:** Node.js + Express + Sequelize (PostgreSQL)
- **Autenticación:** Supabase Auth (email/password + Google OAuth)
- **Base de datos:** PostgreSQL (vía Sequelize para datos de negocio) + Supabase (perfiles, RLS)
- **WebSockets:** Socket.IO
- **Almacenamiento:** AWS S3 / Cloudflare R2
- **Notificaciones:** Email (SendGrid) + Tiempo real (Socket.IO)

## 🚀 Inicio rápido

### Requisitos previos
- Node.js 18+
- PostgreSQL 13+
- Git
- npm o yarn
- Proyecto en [Supabase](https://supabase.com) (opcional para desarrollo)

### Instalación

1. **Clonar repositorio**
   `ash
   git clone https://github.com/eliasleuci/sigevir.git
   cd sigevir
   `

2. **Instalar dependencias - Backend**
   `ash
   cd backend
   npm install
   cp .env.example .env
   # Editar .env con tus variables
   `

3. **Instalar dependencias - Frontend**
   `ash
   cd frontend
   npm install
   cp .env.example .env
   # Editar .env con tus variables de Supabase
   `

4. **Configurar Base de Datos**
   `ash
   createdb sigevir
   psql -U postgres -d sigevir -f database/schema.sql
   `

5. **Configurar Supabase** (ver docs/CONFIGURACION_SUPABASE.md)
   - Crear proyecto en [supabase.com](https://supabase.com)
   - Ejecutar database/supabase_setup.sql en SQL Editor
   - Configurar Auth providers (email + Google)
   - Copiar URL y keys a .env

### Ejecutar en desarrollo

**Terminal 1 - Backend:**
`ash
cd backend
npm run dev
# Backend corriendo en http://localhost:3001
`

**Terminal 2 - Frontend:**
`ash
cd frontend
npm run dev
# Frontend corriendo en http://localhost:5173
`

## 📁 Estructura de carpetas

`
sigevir/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── config/             # Configuración (database, supabase)
│   │   ├── middleware/          # auth, errorHandler, supabaseAuth
│   │   ├── models/             # Modelos Sequelize
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── services/           # Servicios reutilizables
│   │   ├── routes/             # Definición de rutas
│   │   └── utils/              # Utilidades
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── config/             # Supabase client
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Páginas principales
│   │   │   ├── admin/          # GestionUsuariosPage
│   │   │   ├── deposito/
│   │   │   └── judicial/
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── services/           # API client, etc.
│   │   └── utils/              # Constantes, validadores
│   ├── package.json
│   └── .env
│
├── database/
│   ├── schema.sql              # Esquema Sequelize
│   └── supabase_setup.sql      # Esquema Supabase (perfiles, RLS)
│
├── docs/
│   └── CONFIGURACION_SUPABASE.md
├── README.md
└── package.json
`

## 👥 Sistema de Roles

| Rol            | Tipo de personal                    | Color   | Permisos principales                              |
|----------------|-------------------------------------|---------|---------------------------------------------------|
| agente_campo   | Policía, Inspector de tránsito      | Azul    | Registrar retenciones, cargar fotos, generar PDF/QR |
| deposito       | Responsable de depósito             | Verde   | Gestionar ingreso/egreso, inventario              |
| fiscal_juez    | Juez, Fiscal, Secretario judicial   | Violeta | Ver historial, emitir resoluciones                |
| admin          | Administrador del sistema           | Dorado  | Acceso total, gestión de usuarios                 |

> **Importante:** El usuario nunca elige su rol directamente. Selecciona su tipo de personal y el sistema asigna el rol automáticamente.

## 🔐 Seguridad

- **Autenticación:** Supabase Auth (JWT gestionado por Supabase)
- **RLS:** Row Level Security en tabla perfiles
- **RBAC:** Middleware de autorización por rol en backend
- **Validación:** Joi en backend, Zod en frontend
- **Auditoría:** Log append-only de todas las acciones
- **Multi-institución:** Separación de datos por institución

## 🔌 Variables de Entorno

### Backend (.env)
`
PORT=3001
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sigevir
SUPABASE_URL=tu_url
SUPABASE_SERVICE_ROLE_KEY=tu_key
`

### Frontend (.env)
`
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key
`

## 📚 Documentación adicional

- docs/CONFIGURACION_SUPABASE.md — Guía completa de configuración de Supabase
- database/supabase_setup.sql — Script SQL para crear tablas y RLS

## 📱 Módulos principales

1. **Autenticación** — Login, registro, Google OAuth, verificación email
2. **Registro** — Crear retención, cargar fotos, generar PDF/QR
3. **Depósito** — Confirmar ingreso, egreso, inventario
4. **Judicial** — Búsqueda de causas, historial, resoluciones
5. **Búsqueda** — Multicriterio (dominio, motor, DNI, etc.)
6. **Administración** — CRUD usuarios, roles, instituciones
7. **Notificaciones** — WebSocket en tiempo real + email

## 📜 Licencia

ISC © 2026
