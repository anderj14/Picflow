using Picflow.Core.Common;

namespace Picflow.Core.Entities;

public class Fotografia : BaseEntity
{
    public string CitaId { get; set; } = string.Empty;
    public string ClienteId { get; set; } = string.Empty;
    public string UrlCloudinary { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public bool Entregada { get; set; } = false;
    public long TamanioBytes { get; set; }
    public string Formato { get; set; } = string.Empty;
    public List<OpcionImpresion> OpcionesImpresion { get; set; } = [];
}

public class OpcionImpresion
{
    public string CategoriaId { get; set; } = string.Empty;
    public string NombreCategoria { get; set; } = string.Empty;
    public string SubCategoriaId { get; set; } = string.Empty;
    public string NombreSubCategoria { get; set; } = string.Empty;
    public string ServicioId { get; set; } = string.Empty;
    public string Tamanio { get; set; } = string.Empty;
    public string TipoAcabado { get; set; } = string.Empty;
    public int Cantidad { get; set; } = 1;
    public decimal PrecioUnitario { get; set; }
}
