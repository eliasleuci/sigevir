# SIGEVIR - Sistema Integral de Gestión de Vehículos Retenidos

Plataforma web moderna para gestionar el ciclo de vida completo de vehículos retenidos en contextos judicales.

## 📋 Descripción del Proyecto

SIGEVIR es un sistema multi-rol diseñado para:
- Registrar vehículos retenidos en el lugar del hecho
- Gestionar el traslado y depósito de vehículos
- Facilitar la intervención judicial (resoluciones)
- Mantener una cadena de custodia legal inmutable
- Generar reportes y estadísticas

**Arquitectura:** Node.js + React.js + PostgreSQL

## 🚀 Inicio rápido

### Requisitos previos
- Node.js 18+
- PostgreSQL 13+
- Git
- npm o yarn

### Instalación

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/eliasleuci/sigevir.git
   cd sigevir-app
   ```

2. **Instalar dependencias - Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Editar .env con tus variables
   ```

3. **Instalar dependencias - Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Editar .env con tus variables
   ```

4. **Configurar Base de Datos**
   ```bash
   # Crear BD
   createdb sigevir
   
   # Importar esquema
   psql -U postgres -d sigevir -f database/schema.sql
   ```

### Ejecutar en desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend corriendo en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend corriendo en http://localhost:3000
```

Abre http://localhost:3000 en tu navegador.

## 📁 Estructura de carpetas

```
sigevir-app/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── app.js             # Aplicación Express
│   │   ├── config/            # Configuraciones
│   │   ├── middleware/        # Middlewares (auth, errorHandler, etc)
│   │   ├── models/            # Modelos Sequelize
│   │   ├── controllers/       # Lógica de negocios
│   │   ├── services/          # Servicios reutilizables
│   │   ├── routes/            # Definición de rutas
│   │   └── utils/             # Utilidades
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # App React + Vite
│   ├── src/
│   │   ├── App.jsx            # Componente raíz
│   │   ├── main.jsx           # Entry point
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas principales
│   │   ├── hooks/             # Custom React hooks
│   │   ├── context/           # Context API
│   │   ├── services/          # Servicios (API, WebSocket, etc)
│   │   ├── utils/             # Utilidades
│   │   └── styles/            # CSS y Tailwind
│   ├── package.json
│   └── .env.example
│
├── database/                   # SQL schemas
│   └── schema.sql             # Esquema completo
│
├── README.md
├── PROGRESO.md               # Tracking del desarrollo
└── INDEX.md                  # Índice de archivos generados
```

## 🔌 Variables de Entorno

### Backend (.env)
```
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sigevir
JWT_SECRET=tu_secret_muy_seguro
GOOGLE_CLIENT_ID=tu_google_client_id
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_SOCKET_URL=http://localhost:3001
```

## 🧪 Testing

**Tests unitarios (Backend):**
```bash
cd backend
npm test
```

**Tests E2E (Frontend):**
```bash
cd frontend
npm run test:e2e
```

## 📊 Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login con credenciales |
| POST | `/api/auth/google` | Login con Google |
| POST | `/api/retenciones` | Crear retención |
| GET | `/api/retenciones/:id` | Obtener retención |
| POST | `/api/depositos/confirmar-ingreso` | Confirmar ingreso al depósito |
| POST | `/api/resoluciones` | Emitir resolución judicial |
| GET | `/api/busqueda/avanzada` | Búsqueda multicriterio |

Documentación completa: GET `http://localhost:3001/api/docs`

## 🔐 Seguridad

- **Autenticación:** JWT + Google OAuth
- **RBAC:** Control de acceso basado en roles
- **Validación:** Joi en backend, Zod en frontend
- **Encriptación:** Contraseñas con bcrypt, datos en HTTPS
- **Auditoría:** Log append-only de todas las acciones
- **Cadena de custodia:** Estados inmutables en BD

## 📱 Módulos principales

1. **Autenticación** - Login, Google OAuth, password recovery
2. **Registro** - Crear retención, cargar fotos, generar PDF/QR
3. **Depósito** - Confirmar ingreso (escaneo QR), egreso
4. **Judicial** - Búsqueda de causas, historial, resoluciones
5. **Búsqueda** - Multicriterio (dominio, motor, cuadro, DNI, etc)
6. **Administración** - CRUD usuarios, instituciones
7. **Notificaciones** - WebSocket en tiempo real + email

## 🚀 Deploy a Producción

Instrucciones en `DEPLOYMENT.md`

```bash
# Build
npm run build

# Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Soporte y Contacto

- **Email:** soporte@sigevir.com
- **Issues:** [GitHub Issues](https://github.com/eliasleuci/sigevir/issues)
- **Documentación:** [Wiki del Proyecto](https://github.com/eliasleuci/sigevir/wiki)

## 📜 Licencia

ISC © 2026

---

**¿Necesitas ayuda?** Consulta el archivo `PROGRESO.md` para ver el estado actual del desarrollo.
