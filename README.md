# Picflow

Sistema de gestión digital para **Acción Fotovídeo**, Santiago de los Caballeros, RD.

Permite administrar clientes, citas, fotografías, facturas, reportes y usuarios desde una interfaz web con control de acceso por roles. Incluye un sitio público con agenda de citas online y confirmación por correo electrónico.

---

## Capturas de pantalla

### Público

| Pantalla | Vista previa |
|----------|-------------|
| Home | <img src="screenshots/home.png" width="200" alt="Home"> |
| Login | <img src="screenshots/login.png" width="200" alt="Login"> |

### Agenda de citas (público)

| Paso | Vista previa |
|------|-------------|
| Selección de fecha | <img src="screenshots/agendar-cita-seleccion-fecha.png" width="200" alt="Seleccionar fecha"> |
| Selección de hora | <img src="screenshots/agendar-cita-seleccion-hora.png" width="200" alt="Seleccionar hora"> |
| Información del cliente | <img src="screenshots/agendar-cita-ingreso-informacion-cliente.png" width="200" alt="Información del cliente"> |
| Confirmación | <img src="screenshots/agendar-cita-confirmacion.png" width="200" alt="Confirmación"> |

### Confirmación por correo

| Pantalla | Vista previa |
|----------|-------------|
| Cita confirmada | <img src="screenshots/confirmacion-cita-confirmada.png" width="200" alt="Cita confirmada"> |
| Correo Gmail | <img src="screenshots/confirmacion-cita-gmail.png" width="200" alt="Correo de confirmación"> |

### Dashboard

| Pantalla | Vista previa |
|----------|-------------|
| Dashboard | <img src="screenshots/dashboard.png" width="200" alt="Dashboard"> |

### Clientes

| Pantalla | Vista previa |
|----------|-------------|
| Lista de clientes | <img src="screenshots/lista-cliente.png" width="200" alt="Lista de clientes"> |
| Información del cliente | <img src="screenshots/info-cliente.png" width="200" alt="Información del cliente"> |
| Imágenes del cliente | <img src="screenshots/imagenes-clientes.png" width="200" alt="Imágenes del cliente"> |

### Citas (interno)

| Pantalla | Vista previa |
|----------|-------------|
| Lista de citas | <img src="screenshots/citas-lista.png" width="200" alt="Lista de citas"> |
| Calendario de citas | <img src="screenshots/citas-calendario.png" width="200" alt="Calendario de citas"> |

### Facturación

| Pantalla | Vista previa |
|----------|-------------|
| Facturación | <img src="screenshots/facturacion.png" width="200" alt="Facturación"> |

### Reportes

| Pantalla | Vista previa |
|----------|-------------|
| Reportes | <img src="screenshots/reporte.png" width="200" alt="Reportes"> |

### Usuarios

| Pantalla | Vista previa |
|----------|-------------|
| Usuarios | <img src="screenshots/usuarios.png" width="200" alt="Usuarios"> |

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular 21 (Standalone Components) |
| Estilos | Tailwind CSS 4 + SCSS |
| Backend | ASP.NET Core 9 Web API |
| Autenticación | JWT Bearer |
| Base de datos | MongoDB Atlas |
| Almacenamiento de medios | Cloudinary |
| Correo electrónico | SMTP Gmail (confirmación de citas) |
| Despliegue | Azure App Service |

---

## Estructura del proyecto

```
Picflow/
├── Picflow.sln
│
├── Picflow.API/                  ← Capa de presentación (REST)
│   ├── Controllers/              ← Endpoints por módulo (Controllers.cs)
│   ├── Middleware/               ← ExceptionMiddleware global
│   ├── Program.cs                ← Entry point y configuración DI
│   └── appsettings.json
│
├── Picflow.Core/                 ← Dominio y lógica de negocio
│   ├── Entities/                 ← Modelos: Usuario, Cliente, Cita, Fotografia, Factura
│   ├── Interfaces/
│   │   ├── Repositories/         ← Contratos de acceso a datos
│   │   └── Services/             ← Contratos de servicios
│   ├── Services/                 ← AuthService, CitaService, ClienteService, EmailService,
│   │                               FotografiaService, PublicReservaService, UsuarioService
│   ├── DTOs/
│   │   ├── Request/              ← Entrada de datos
│   │   └── Response/             ← Salida de datos
│   ├── Enums/                    ← RolUsuario, EstadoCita, EstadoFactura
│   ├── Exceptions/
│   └── Common/                   ← BaseEntity
│
├── Picflow.Infrastructure/       ← Acceso a datos e integraciones externas
│   ├── Repositories/             ← Implementaciones MongoDB (CRUD + índices)
│   ├── Services/                 ← JwtTokenService, CloudinaryMediaService
│   ├── Persistence/              ← PicflowDbContext (6 colecciones)
│   └── Configuration/            ← Serialización BSON, MongoDbConfiguration
│
├── picflow-frontend/             ← Angular SPA
│   ├── public/                   ← Imágenes públicas del sitio
│   └── src/app/
│       ├── core/
│       │   ├── services/         ← api.service.ts, auth.service.ts, theme.service.ts
│       │   ├── guards/           ← auth.guard.ts, admin.guard.ts
│       │   ├── interceptors/     ← auth.interceptor.ts (adjunta JWT)
│       │   └── models/           ← Interfaces TypeScript de cada entidad
│       ├── public/               ← Páginas públicas (sin autenticación)
│       │   ├── home/             ← Landing page con galería de servicios
│       │   ├── services/         ← Listado de servicios del estudio
│       │   ├── booking/          ← Agenda de citas online (3 pasos)
│       │   └── public-layout/    ← Layout público con header/footer
│       ├── features/
│       │   ├── auth/login/       ← Pantalla de inicio de sesión
│       │   ├── dashboard/        ← Panel principal con métricas
│       │   ├── clients/          ← Gestión de clientes
│       │   ├── appointments/     ← Gestión de citas
│       │   ├── assets/           ← Biblioteca de fotografías
│       │   ├── invoices/         ← Facturas y pagos
│       │   ├── reports/          ← Reportes y analítica
│       │   └── users/            ← Gestión de usuarios (admin)
│       └── shared/components/
│           ├── layout/           ← Contenedor principal autenticado
│           ├── sidebar/          ← Navegación lateral
│           └── header/           ← Barra superior
│
├── screenshots/                  ← Capturas de pantalla de la aplicación
└── .gitignore
```

---

## Dependencias entre capas (backend)

```
API ──► Core ◄── Infrastructure
```

- **Core** no referencia proyectos externos — solo el JWT SDK para generación de tokens.
- **Infrastructure** implementa las interfaces definidas en Core.
- **API** orquesta: registra servicios en DI y expone los endpoints.

---

## Módulos del frontend

### Rutas públicas

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/` | Home | Landing page con galería de servicios |
| `/servicios` | Services | Listado de servicios del estudio |
| `/agendar` | Booking | Agenda de cita online (3 pasos) |
| `/login` | Auth | Inicio de sesión |

### Rutas privadas (requieren autenticación)

Todas bajo el prefijo `/app`.

| Ruta | Módulo | Descripción | Acceso |
|------|--------|-------------|--------|
| `/app/dashboard` | Dashboard | Métricas y resumen general | Autenticado |
| `/app/clients` | Clients | Alta, edición y búsqueda de clientes | Autenticado |
| `/app/appointments` | Appointments | Agenda y gestión de citas | Autenticado |
| `/app/assets` | Assets | Subida y visualización de fotografías | Autenticado |
| `/app/invoices` | Invoices | Emisión de facturas y registro de pagos | Autenticado |
| `/app/reports` | Reports | Reportes de ingresos y actividad | Autenticado |
| `/app/users` | Users | Gestión de usuarios del sistema | Administrador |

> Todas las rutas privadas usan `authGuard`. La ruta `/app/users` requiere además `adminGuard`. Los módulos se cargan de forma diferida (lazy loading).

---

## API — Endpoints principales

### Auth

| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/register` | Administrador |

### Usuarios

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/usuarios/fotografos` | Autenticado |
| GET | `/api/usuarios` | Administrador |
| PATCH | `/api/usuarios/{id}/rol` | Administrador |
| PATCH | `/api/usuarios/{id}/toggle` | Administrador |

### Clientes

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/clientes` | Autenticado |
| GET | `/api/clientes/{id}` | Autenticado |
| GET | `/api/clientes/search?q=texto` | Autenticado |
| POST | `/api/clientes` | Autenticado |
| PUT | `/api/clientes/{id}` | Autenticado |
| DELETE | `/api/clientes/{id}` | Administrador |

### Citas

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/citas` | Autenticado |
| GET | `/api/citas/{id}` | Autenticado |
| GET | `/api/citas/cliente/{clienteId}` | Autenticado |
| GET | `/api/citas/rango?desde=&hasta=` | Autenticado |
| POST | `/api/citas` | Autenticado |
| PUT | `/api/citas/{id}` | Autenticado |
| PATCH | `/api/citas/{id}/estado` | Autenticado |
| DELETE | `/api/citas/{id}` | Administrador / Recepcionista |

### Fotografías

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/fotografias/cita/{citaId}` | Autenticado |
| GET | `/api/fotografias/cliente/{clienteId}` | Autenticado |
| POST | `/api/fotografias/upload` | Administrador / Fotógrafo |
| PATCH | `/api/fotografias/entregar` | Administrador / Fotógrafo |
| DELETE | `/api/fotografias/{id}` | Administrador / Fotógrafo |

### Facturas

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/facturas` | Autenticado |
| GET | `/api/facturas/{id}` | Autenticado |
| GET | `/api/facturas/cliente/{clienteId}` | Autenticado |
| GET | `/api/facturas/pendientes` | Autenticado |
| POST | `/api/facturas` | Administrador / Recepcionista |
| POST | `/api/facturas/{id}/pagos` | Administrador / Recepcionista |

### Público (sin autenticación)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/public/disponibilidad?fecha=` | Horarios disponibles para una fecha |
| POST | `/api/public/reservar` | Registrar cita desde el sitio público |

---

## Roles y permisos

| Rol | Permisos |
|-----|---------|
| `Administrador` | Acceso total |
| `Fotografo` | Ver todo, subir/gestionar fotos, ver y actualizar sus citas |
| `Recepcionista` | Gestionar clientes, citas y facturación |

---

## Base de datos (MongoDB)

| Colección | Descripción |
|-----------|-------------|
| `usuarios` | Usuarios del sistema con rol y credenciales |
| `clientes` | Datos de clientes del estudio |
| `citas` | Citas vinculadas a clientes y fotógrafos |
| `fotografias` | Metadatos de fotos almacenadas en Cloudinary |
| `facturas` | Facturas con detalle de servicios y estado de pago |
| `pagos` | Registros de pago por factura |

Los números de factura se generan automáticamente con el formato `PF-YYYY-NNNN` y se reinician por año fiscal.

---

## Configuración inicial

### Backend

#### 1. Restaurar dependencias

```bash
git clone <repo-url>
cd Picflow
dotnet restore
```

#### 2. Configurar secrets locales

```bash
cd Picflow.API

dotnet user-secrets set "MongoDB:ConnectionString" "mongodb+srv://user:pass@cluster.mongodb.net/"
dotnet user-secrets set "MongoDB:DatabaseName" "picflow_dev"
dotnet user-secrets set "Cloudinary:CloudName" "tu-cloud-name"
dotnet user-secrets set "Cloudinary:ApiKey" "tu-api-key"
dotnet user-secrets set "Cloudinary:ApiSecret" "tu-api-secret"
dotnet user-secrets set "Jwt:SecretKey" "clave-secreta-de-32-o-mas-caracteres"
dotnet user-secrets set "Jwt:Issuer" "picflow-api"
dotnet user-secrets set "Jwt:Audience" "picflow-frontend"
dotnet user-secrets set "Email:FromAddress" "tucorreo@gmail.com"
dotnet user-secrets set "Email:FromPassword" "contraseña-app-gmail"
```

> Para el envío de correos se usa SMTP de Gmail. Debes usar una [contraseña de aplicación](https://support.google.com/accounts/answer/185833) (no la contraseña normal).

#### 3. Ejecutar

```bash
dotnet run --project Picflow.API
```

La API queda disponible en `http://localhost:5000` y la documentación Swagger en `/swagger`.

#### 4. Crear el primer administrador

La primera vez, desactiva temporalmente el `[Authorize]` en el endpoint `POST /api/auth/register`, crea el usuario administrador y vuelve a activarlo.

---

### Frontend

#### 1. Instalar dependencias

```bash
cd picflow-frontend
npm install
```

#### 2. Ejecutar en desarrollo

```bash
npm start
```

La app queda disponible en `http://localhost:4200`.

> El frontend usa la ruta relativa `/api` gracias al proxy de Angular CLI definido en `angular.json`. En desarrollo, las peticiones se redirigen al backend en `http://localhost:5000`.

#### 3. Build para producción

```bash
npm run build
```

Los artefactos se generan directamente en `Picflow.API/wwwroot/` para que el backend de ASP.NET los sirva como archivos estáticos.



---

## Despliegue en Azure

### Backend — App Service

```bash
# 1. Build del frontend (se copia automáticamente a wwwroot)
cd picflow-frontend
npm run build

# 2. Publicar el backend (incluye wwwroot con el frontend)
cd ..
dotnet publish Picflow.API -c Release -o ./publish
```

Configurar en **Azure Portal → App Service → Configuration → Application settings**:

```
MongoDB__ConnectionString
MongoDB__DatabaseName
Cloudinary__CloudName
Cloudinary__ApiKey
Cloudinary__ApiSecret
Jwt__SecretKey
Jwt__Issuer
Jwt__Audience
Email__FromAddress
Email__FromPassword
```