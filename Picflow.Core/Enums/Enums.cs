namespace Picflow.Core.Enums;

public enum EstadoCita
{
    Pendiente,
    Confirmada,
    EnProceso,
    Completada,
    Cancelada
}

public enum EstadoFactura
{
    Pendiente,
    PagoParcial,
    Pagada,
    Anulada
}

public enum MetodoPago
{
    Efectivo,
    Tarjeta,
    Transferencia,
    Otro
}

public enum RolUsuario
{
    Administrador,
    Fotografo,
    Recepcionista
}
