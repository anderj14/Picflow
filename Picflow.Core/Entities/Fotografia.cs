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
}
