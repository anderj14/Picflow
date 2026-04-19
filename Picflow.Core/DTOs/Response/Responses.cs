using Picflow.Core.Enums;

namespace Picflow.Core.DTOs.Response;

public record AuthResponse(
    string Token,
    string UserId,
    string Nombre,
    string Email,
    RolUsuario Rol,
    DateTime Expira
);

public record UsuarioResponse(
    string Id,
    string Nombre,
    string Email,
    RolUsuario Rol,
    bool Activo,
    DateTime CreadoEn
);

public record ClienteResponse(
    string Id,
    string Nombre,
    string Telefono,
    string Email,
    string Cedula,
    string Direccion,
    string Notas,
    DateTime FechaRegistro,
    decimal SaldoFavor
);

public record CitaResponse(
    string Id,
    string ClienteId,
    string NombreCliente,
    string FotografoId,
    string NombreFotografo,
    DateTime FechaHora,
    int DuracionMinutos,
    string Servicio,
    EstadoCita Estado,
    string Notas,
    string Ubicacion,
    DateTime CreadoEn
);

public record FotografiaResponse(
    string Id,
    string CitaId,
    string ClienteId,
    string UrlCloudinary,
    string PublicId,
    string Titulo,
    string Descripcion,
    bool Entregada,
    long TamanioBytes,
    string Formato,
    DateTime FechaSubida,
    List<OpcionImpresionResponse> OpcionesImpresion
);

public record OpcionImpresionResponse(
    string CategoriaId,
    string NombreCategoria,
    string SubCategoriaId,
    string NombreSubCategoria,
    string ServicioId,
    string Tamanio,
    string TipoAcabado,
    int Cantidad,
    decimal PrecioUnitario
);

public record FacturaResponse(
    string Id,
    string NumeroFactura,
    string ClienteId,
    string NombreCliente,
    string CitaId,
    DateTime Fecha,
    List<ItemFacturaResponse> Items,
    decimal Subtotal,
    decimal Impuesto,
    decimal Total,
    decimal TotalPagado,
    decimal SaldoPendiente,
    decimal SaldoFavorAplicado,
    EstadoFactura Estado,
    string? PreOrdenId,
    string Notas,
    List<PagoResponse> Pagos
);

public record ItemFacturaResponse(
    string ServicioId,
    string Descripcion,
    string CodigoBarras,
    int Cantidad,
    decimal PrecioUnitario,
    decimal Subtotal
);

public record PagoResponse(
    string Id,
    string FacturaId,
    DateTime Fecha,
    decimal Monto,
    MetodoPago Metodo,
    string Referencia,
    string Notas
);

// Categoria
public record CategoriaResponse(
    string Id,
    string Nombre,
    string Descripcion,
    List<SubCategoriaResponse> SubCategorias,
    bool Activa,
    DateTime CreadoEn
);

public record SubCategoriaResponse(
    string Id,
    string Nombre,
    TipoSubCategoria Tipo
);

// Servicio
public record ServicioResponse(
    string Id,
    string Nombre,
    string Descripcion,
    string CategoriaId,
    string NombreCategoria,
    string SubCategoriaId,
    string NombreSubCategoria,
    decimal PrecioBase,
    string CodigoBarras,
    bool Activo,
    DateTime CreadoEn
);

// PreOrden
public record PreOrdenResponse(
    string Id,
    string NumeroPreOrden,
    string ClienteId,
    string NombreCliente,
    string CitaId,
    List<ItemPreOrdenResponse> Items,
    decimal Subtotal,
    decimal Impuesto,
    decimal Total,
    EstadoPreOrden Estado,
    string? FacturaId,
    string Notas,
    DateTime CreadoEn
);

public record ItemPreOrdenResponse(
    string ServicioId,
    string Descripcion,
    string CodigoBarras,
    int Cantidad,
    decimal PrecioUnitario,
    decimal Subtotal,
    OpcionImpresionResponse? OpcionImpresion
);

// Historial de pagos
public record HistorialPagosResponse(
    string ClienteId,
    string NombreCliente,
    decimal SaldoFavor,
    List<PagoDetalleResponse> Pagos
);

public record PagoDetalleResponse(
    string Id,
    string FacturaId,
    string NumeroFactura,
    DateTime Fecha,
    decimal Monto,
    MetodoPago Metodo,
    string Referencia,
    string Notas
);

public record ReporteIngresosResponse(
    DateTime Desde,
    DateTime Hasta,
    decimal TotalIngresos,
    decimal TotalPendiente,
    int TotalFacturas,
    int FacturasPagadas,
    int FacturasPendientes,
    int TotalCitas,
    List<IngresoMensualResponse> DesgloseMensual
);

public record IngresoMensualResponse(
    int Anio,
    int Mes,
    decimal Total,
    int CantidadFacturas
);
