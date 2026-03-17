using Picflow.Core.Common;
using Picflow.Core.Enums;

namespace Picflow.Core.Entities;

public class Factura : BaseEntity
{
    public string ClienteId { get; set; } = string.Empty;
    public string CitaId { get; set; } = string.Empty;
    public string NumeroFactura { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public List<ItemFactura> Items { get; set; } = [];
    public decimal Subtotal { get; set; }
    public decimal Impuesto { get; set; }
    public decimal Total { get; set; }
    public decimal TotalPagado { get; set; }
    public EstadoFactura Estado { get; set; } = EstadoFactura.Pendiente;
    public string Notas { get; set; } = string.Empty;
}

public class ItemFactura
{
    public string Descripcion { get; set; } = string.Empty;
    public int Cantidad { get; set; } = 1;
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal => Cantidad * PrecioUnitario;
}

public class Pago : BaseEntity
{
    public string FacturaId { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public decimal Monto { get; set; }
    public MetodoPago Metodo { get; set; }
    public string Referencia { get; set; } = string.Empty;
    public string Notas { get; set; } = string.Empty;
}
