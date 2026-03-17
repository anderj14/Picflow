using Picflow.Core.Entities;

namespace Picflow.Core.Interfaces.Services;

public interface ITokenService
{
    string GenerarToken(Usuario usuario);
}
