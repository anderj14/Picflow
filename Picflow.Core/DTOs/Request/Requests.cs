using Picflow.Core.Enums;

namespace Picflow.Core.DTOs.Request;

public record LoginRequest(string Email, string Password);

public record CreateUsuarioRequest(
    string Nombre,
    string Email,
    string Password,
    RolUsuario Rol
);

public record UpdateRolUsuarioRequest(RolUsuario Rol);

public record CreateClienteRequest(
    string Nombre,
    string Telefono,
    string Email,
    string Cedula,
    string Direccion,
    string Notas
);

public record UpdateClienteRequest(
    string Nombre,
    string Telefono,
    string Email,
    string Direccion,
    string Notas
);

public record CreateCitaRequest(
    string ClienteId,
    string FotografoId,
    DateTime FechaHora,
    int DuracionMinutos,
    string Servicio,
    string Notas,
    string Ubicacion
);

public record UpdateCitaRequest(
    string FotografoId,
    DateTime FechaHora,
    int DuracionMinutos,
    string Servicio,
    string Notas,
    string Ubicacion
);

public record UploadFotografiaRequest(
    string CitaId,
    string ClienteId,
    Stream FileStream,
    string FileName,
    string Titulo,
    string Descripcion
);

public record AgregarOpcionImpresionRequest(
    string CategoriaId,
    string SubCategoriaId,
    string ServicioId,
    string Tamanio,
    string TipoAcabado,
    int Cantidad,
    decimal PrecioUnitario
);

public record CreateFacturaRequest(
    string ClienteId,
    string CitaId,
    List<ItemFacturaRequest> Items,
    decimal Impuesto,
    string Notas,
    bool AplicarSaldoFavor = false,
    string? PreOrdenId = null
);

public record ItemFacturaRequest(
    string Descripcion,
    int Cantidad,
    decimal PrecioUnitario,
    string ServicioId = "",
    string CodigoBarras = ""
);

public record CreatePagoRequest(
    decimal Monto,
    MetodoPago Metodo,
    string Referencia,
    string Notas
);

// Categorias
public record CreateCategoriaRequest(
    string Nombre,
    string Descripcion,
    List<CreateSubCategoriaRequest> SubCategorias
);

public record CreateSubCategoriaRequest(
    string Nombre,
    TipoSubCategoria Tipo
);

public record UpdateCategoriaRequest(
    string Nombre,
    string Descripcion
);

// Servicios
public record CreateServicioRequest(
    string Nombre,
    string Descripcion,
    string CategoriaId,
    string SubCategoriaId,
    decimal PrecioBase,
    string CodigoBarras
);

public record UpdateServicioRequest(
    string Nombre,
    string Descripcion,
    string CategoriaId,
    string SubCategoriaId,
    decimal PrecioBase,
    string CodigoBarras
);

// PreOrden
public record CreatePreOrdenRequest(
    string ClienteId,
    string CitaId,
    List<ItemPreOrdenRequest> Items,
    decimal Impuesto,
    string Notas
);

public record ItemPreOrdenRequest(
    string ServicioId,
    string Descripcion,
    string CodigoBarras,
    int Cantidad,
    decimal PrecioUnitario,
    AgregarOpcionImpresionRequest? OpcionImpresion = null
);

public record ConvertirPreOrdenRequest(
    decimal Impuesto,
    string Notas,
    bool AplicarSaldoFavor = false
);
