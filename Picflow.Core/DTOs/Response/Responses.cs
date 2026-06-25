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
    DateTime FechaRegistro
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
    DateTime FechaSubida
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
    EstadoFactura Estado,
    string Notas,
    List<PagoResponse> Pagos
);

public record ItemFacturaResponse(
    string Descripcion,
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

public record SlotDisponibilidadResponse(
    string Hora,
    DateTime FechaHora,
    bool Disponible
);

public record ReservaConfirmadaResponse(
    string CitaId,
    string NombreCliente,
    string Email,
    DateTime FechaHora,
    string Servicio,
    string Estado,
    string Mensaje
);
