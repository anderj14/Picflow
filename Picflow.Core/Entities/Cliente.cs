using Picflow.Core.Common;

namespace Picflow.Core.Entities;

public class Cliente : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Cedula { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;
    public string Notas { get; set; } = string.Empty;
}
