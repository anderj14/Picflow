# Picflow API — Backend

Sistema de gestión digital para **Acción Fotovídeo**, Santiago de los Caballeros, RD.

## Stack

| Capa | Tecnología |
|------|-----------|
| API | ASP.NET Core 9 Web API |
| Autenticación | JWT Bearer |
| Base de datos | MongoDB Atlas |
| Almacenamiento | Cloudinary |
| Despliegue | Azure App Service |

## Estructura del proyecto

```
Picflow/
├── Picflow.sln
├── Picflow.API/              ← Capa de presentación
│   ├── Controllers/          ← Endpoints REST
│   ├── Middleware/           ← ExceptionMiddleware
│   ├── Program.cs            ← Entry point y configuración
│   └── appsettings.json
│
├── Picflow.Core/             ← Dominio y lógica de negocio
│   ├── Entities/             ← Modelos del dominio
│   ├── Interfaces/
│   │   ├── Repositories/     ← Contratos de acceso a datos
│   │   └── Services/         ← Contratos de servicios
│   ├── Services/             ← Implementaciones de lógica
│   ├── DTOs/
│   │   ├── Request/          ← Entrada de datos
│   │   └── Response/         ← Salida de datos
│   ├── Enums/
│   ├── Exceptions/
│   └── Common/               ← BaseEntity
│
└── Picflow.Infrastructure/   ← Acceso a datos e integraciones
    ├── Repositories/         ← Implementaciones MongoDB
    ├── Services/             ← CloudinaryMediaService
    ├── Persistence/          ← DbContext e índices
    └── Configuration/        ← Serialización BSON
```

## Dependencias entre capas

```
API ──► Core ◄── Infrastructure
```

- **Core** no referencia nada externo — solo `System.IdentityModel.Tokens.Jwt` para generar tokens.
- **Infrastructure** implementa las interfaces definidas en Core.
- **API** orquesta: registra todo en DI y expone los endpoints.

## Configuración inicial

### 1. Clonar y restaurar paquetes

```bash
git clone https://github.com/tu-org/picflow-api.git
cd picflow-api
dotnet restore
```

### 2. Configurar secrets locales (no usar appsettings para credenciales)

```bash
cd Picflow.API

dotnet user-secrets set "MongoDB:ConnectionString" "mongodb+srv://user:pass@cluster.mongodb.net/"
dotnet user-secrets set "MongoDB:DatabaseName" "picflow_dev"
dotnet user-secrets set "Cloudinary:CloudName" "tu-cloud-name"
dotnet user-secrets set "Cloudinary:ApiKey" "tu-api-key"
dotnet user-secrets set "Cloudinary:ApiSecret" "tu-api-secret"
dotnet user-secrets set "Jwt:SecretKey" "una-clave-muy-segura-de-32-o-mas-caracteres"
```

### 3. Ejecutar en desarrollo

```bash
dotnet run --project Picflow.API
```

La API queda disponible en `https://localhost:7xxx` y Swagger en `/swagger`.

### 4. Crear el primer usuario administrador

```bash
# Con la API corriendo, hacer POST a /api/auth/register
# (Este endpoint requiere rol Administrador — ver sección Bootstrap)
```

> **Bootstrap:** La primera vez, desactiva temporalmente el `[Authorize]` en el endpoint `register`, crea el admin, y vuelve a activarlo. O usa un seed script.

---

## Endpoints principales

### Auth
| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/register` | Admin |

### Clientes
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/clientes` | Autenticado |
| GET | `/api/clientes/{id}` | Autenticado |
| GET | `/api/clientes/search?q=texto` | Autenticado |
| POST | `/api/clientes` | Autenticado |
| PUT | `/api/clientes/{id}` | Autenticado |
| DELETE | `/api/clientes/{id}` | Admin |

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
| DELETE | `/api/citas/{id}` | Admin / Recepcionista |

### Fotografías
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/fotografias/cita/{citaId}` | Autenticado |
| GET | `/api/fotografias/cliente/{clienteId}` | Autenticado |
| POST | `/api/fotografias/upload` | Admin / Fotógrafo |
| PATCH | `/api/fotografias/entregar` | Admin / Fotógrafo |
| DELETE | `/api/fotografias/{id}` | Admin / Fotógrafo |

### Facturas
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/facturas/{id}` | Autenticado |
| GET | `/api/facturas/cliente/{clienteId}` | Autenticado |
| GET | `/api/facturas/pendientes` | Autenticado |
| POST | `/api/facturas` | Admin / Recepcionista |
| POST | `/api/facturas/{id}/pagos` | Admin / Recepcionista |

---

## Roles y permisos

| Rol | Permisos |
|-----|---------|
| `Administrador` | Acceso total |
| `Fotografo` | Ver todo, subir/gestionar fotos, ver/actualizar sus citas |
| `Recepcionista` | Gestionar clientes, citas y facturación |

---

## Despliegue en Azure

### App Service (backend)

```bash
# Build para producción
dotnet publish Picflow.API -c Release -o ./publish

# Configurar variables de entorno en Azure Portal
# App Service > Configuration > Application settings:
# MongoDB__ConnectionString
# MongoDB__DatabaseName
# Cloudinary__CloudName
# Cloudinary__ApiKey
# Cloudinary__ApiSecret
# Jwt__SecretKey
# Jwt__Issuer
# Jwt__Audience
```

### GitHub Actions (CI/CD)

Crear `.github/workflows/deploy-api.yml` y configurar el secreto `AZURE_WEBAPP_PUBLISH_PROFILE`.

---

## Números de factura

El sistema genera números automáticos con formato:

```
PF-2025-0001
PF-2025-0002
...
```

Se reinician por año fiscal.

---

## Próximos pasos sugeridos

- [ ] Agregar `ReporteService` (ingresos, cuentas pendientes)
- [ ] Seed de datos iniciales (primer admin)
- [ ] Validaciones con FluentValidation
- [ ] Tests unitarios (xUnit + Moq)
- [ ] Rate limiting en endpoints públicos
- [ ] Logging estructurado con Serilog → Azure Application Insights
