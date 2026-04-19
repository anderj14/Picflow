namespace Picflow.Core.Enums;

public enum EstadoPreOrden
{
    Borrador,
    Confirmada,
    Convertida,
    Cancelada
}

public enum TipoSubCategoria
{
    Tamanio,
    TipoAcabado
}

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
