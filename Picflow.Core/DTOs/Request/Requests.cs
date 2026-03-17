using Picflow.Core.Enums;

namespace Picflow.Core.DTOs.Request;

public record LoginRequest(string Email, string Password);

public record CreateUsuarioRequest(
    string Nombre,
    string Email,
    string Password,
    RolUsuario Rol
);

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

public record CreateFacturaRequest(
    string ClienteId,
    string CitaId,
    List<ItemFacturaRequest> Items,
    decimal Impuesto,
    string Notas
);

public record ItemFacturaRequest(
    string Descripcion,
    int Cantidad,
    decimal PrecioUnitario
);

public record CreatePagoRequest(
    decimal Monto,
    MetodoPago Metodo,
    string Referencia,
    string Notas
);
