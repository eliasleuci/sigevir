# SIGEVIR Backend - API REST

Sistema Integral de Gestión de Vehículos Retenidos. Backend desarrollado con Node.js, Express y PostgreSQL.

## 🚀 Tecnologías
- **Node.js 18+** (ES Modules)
- **Express.js** 4.19+
- **Sequelize** (ORM para PostgreSQL)
- **PostgreSQL** (Base de datos)
- **JWT + Google OAuth** (Autenticación)
- **Winston + Morgan** (Logging profesional)
- **Joi** (Validación de esquemas)

## 📁 Estructura del Proyecto
```text
/src
├─ /config          (Conexión a BD, variables env)
├─ /middleware      (Auth, RBAC, Error Handling, Multi-tenant)
├─ /models          (Modelos de Sequelize)
├─ /routes          (Rutas divididas por módulos)
├─ /controllers     (Lógica de negocio por módulo)
├─ /services        (Servicios compartidos y utilidades pesadas)
├─ /utils           (Helpers, logger, validaciones)
├─ /types           (Definiciones de TypeScript/Interfaces)
└─ app.js           (Entrada principal y configuración de Express)
```

## 🛠️ Configuración Inicial

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env` y completa los valores necesarios:
   ```bash
   cp .env.example .env
   ```

3. **Ejecutar en desarrollo (con nodemon):**
   ```bash
   npm run dev
   ```

4. **Ejecutar en producción:**
   ```bash
   npm start
   ```

## 🛡️ Características Implementadas
- **Seguridad:** Uso de `helmet` para headers y `cors` configurado.
- **Base de Datos:** Pool de conexiones optimizado y configuración de zona horaria UTC.
- **Autenticación:** Soporte híbrido para JWT y Google OAuth.
- **RBAC:** Middleware para control de acceso basado en roles.
- **Multi-tenant:** Filtrado automático por `institucion_id` integrado en middleware.
- **Manejo de Errores:** Sistema global de captura de errores con logs de auditoría automáticos.
- **Logging:** Rotación de logs y salida a consola/archivo mediante Winston.

## 📝 Scripts Disponibles
- `npm run dev`: Inicia el servidor con recarga automática.
- `npm start`: Inicia el servidor en modo producción.
- `npm test`: Ejecuta los tests unitarios (Jest).
- `npm run lint`: Ejecuta el linter para mantener la calidad del código.
