# Picflow

Sistema de gestión digital para **Acción Fotovídeo**, Santiago de los Caballeros, RD.

Permite administrar clientes, citas, fotografías, facturas y reportes desde una interfaz web con control de acceso por roles.

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
| Despliegue | Azure App Service |

---

## Estructura del proyecto

```
Picflow/
├── Picflow.sln
│
├── Picflow.API/                  ← Capa de presentación (REST)
│   ├── Controllers/              ← Endpoints por módulo
│   ├── Middleware/               ← ExceptionMiddleware global
│   ├── Program.cs                ← Entry point y configuración DI
│   └── appsettings.json
│
├── Picflow.Core/                 ← Dominio y lógica de negocio
│   ├── Entities/                 ← Modelos: Usuario, Cliente, Cita, Fotografia, Factura, Pago
│   ├── Interfaces/
│   │   ├── Repositories/         ← Contratos de acceso a datos
│   │   └── Services/             ← Contratos de servicios
│   ├── Services/                 ← AuthService, ClienteService, CitaService, etc.
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
└── picflow-frontend/             ← Angular SPA
    └── src/app/
        ├── core/
        │   ├── services/         ← api.service.ts, auth.service.ts
        │   ├── guards/           ← auth.guard.ts
        │   ├── interceptors/     ← auth.interceptor.ts (adjunta JWT)
        │   └── models/           ← Interfaces TypeScript de cada entidad
        ├── features/
        │   ├── auth/login/       ← Pantalla de inicio de sesión
        │   ├── dashboard/        ← Panel principal con métricas
        │   ├── clients/          ← Gestión de clientes
        │   ├── appointments/     ← Gestión de citas
        │   ├── assets/           ← Biblioteca de fotografías
        │   ├── invoices/         ← Facturas y pagos
        │   └── reports/          ← Reportes y analítica
        └── shared/components/
            ├── layout/           ← Contenedor principal autenticado
            ├── sidebar/          ← Navegación lateral
            └── header/           ← Barra superior
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

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/login` | Auth | Autenticación pública |
| `/dashboard` | Dashboard | Métricas y resumen general |
| `/clients` | Clients | Alta, edición y búsqueda de clientes |
| `/appointments` | Appointments | Agenda y gestión de citas |
| `/assets` | Assets | Subida y visualización de fotografías |
| `/invoices` | Invoices | Emisión de facturas y registro de pagos |
| `/reports` | Reports | Reportes de ingresos y actividad |

Todas las rutas excepto `/login` requieren autenticación (`authGuard`). Los módulos se cargan de forma diferida (lazy loading).

---

## API — Endpoints principales

### Auth

| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/register` | Administrador |

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
| GET | `/api/facturas/{id}` | Autenticado |
| GET | `/api/facturas/cliente/{clienteId}` | Autenticado |
| GET | `/api/facturas/pendientes` | Autenticado |
| POST | `/api/facturas` | Administrador / Recepcionista |
| POST | `/api/facturas/{id}/pagos` | Administrador / Recepcionista |

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
```

#### 3. Ejecutar

```bash
dotnet run --project Picflow.API
```

La API queda disponible en `https://localhost:7xxx` y la documentación Swagger en `/swagger`.

#### 4. Crear el primer administrador

La primera vez, desactiva temporalmente el `[Authorize]` en el endpoint `POST /api/auth/register`, crea el usuario administrador y vuelve a activarlo.

---

### Frontend

#### 1. Instalar dependencias

```bash
cd picflow-frontend
npm install
```

#### 2. Configurar el entorno

Edita `src/environments/environment.ts` y define la URL de la API:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7xxx/api'
};
```

#### 3. Ejecutar en desarrollo

```bash
npm start
```

La app queda disponible en `http://localhost:4200`.

#### 4. Build para producción

```bash
npm run build
```

Los artefactos se generan en `dist/picflow-frontend/`.

---

## Despliegue en Azure

### Backend — App Service

```bash
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
```

### CI/CD con GitHub Actions

Crear `.github/workflows/deploy-api.yml` y agregar el secreto `AZURE_WEBAPP_PUBLISH_PROFILE` en el repositorio.

---

## Próximos pasos sugeridos

- [ ] Seed de datos iniciales (primer administrador)
- [ ] Validaciones con FluentValidation
- [ ] Tests unitarios — xUnit + Moq (backend) / Vitest (frontend)
- [ ] Rate limiting en endpoints públicos
- [ ] Logging estructurado con Serilog → Azure Application Insights
- [ ] Notificaciones por correo al confirmar/cancelar citas
