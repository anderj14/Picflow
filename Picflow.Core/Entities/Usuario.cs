using Picflow.Core.Common;
using Picflow.Core.Enums;

namespace Picflow.Core.Entities;

public class Usuario : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; } = RolUsuario.Recepcionista;
    public bool Activo { get; set; } = true;
}
