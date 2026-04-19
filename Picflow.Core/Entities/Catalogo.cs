using Picflow.Core.Common;
using Picflow.Core.Enums;

namespace Picflow.Core.Entities;

public class Categoria : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public List<SubCategoria> SubCategorias { get; set; } = [];
    public bool Activa { get; set; } = true;
}

public class SubCategoria
{
    public string Id { get; set; } = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
    public string Nombre { get; set; } = string.Empty;
    public TipoSubCategoria Tipo { get; set; }
}

public class Servicio : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string CategoriaId { get; set; } = string.Empty;
    public string SubCategoriaId { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
    public string CodigoBarras { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
}

public class PreOrden : BaseEntity
{
    public string ClienteId { get; set; } = string.Empty;
    public string CitaId { get; set; } = string.Empty;
    public string NumeroPreOrden { get; set; } = string.Empty;
    public List<ItemPreOrden> Items { get; set; } = [];
    public decimal Subtotal { get; set; }
    public decimal Impuesto { get; set; }
    public decimal Total { get; set; }
    public EstadoPreOrden Estado { get; set; } = EstadoPreOrden.Borrador;
    public string? FacturaId { get; set; }
    public string Notas { get; set; } = string.Empty;
}

public class ItemPreOrden
{
    public string ServicioId { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string CodigoBarras { get; set; } = string.Empty;
    public int Cantidad { get; set; } = 1;
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal => Cantidad * PrecioUnitario;
    public OpcionImpresion? OpcionImpresion { get; set; }
}
