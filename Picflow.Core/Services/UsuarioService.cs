using Picflow.Core.DTOs.Response;
using Picflow.Core.Entities;
using Picflow.Core.Enums;
using Picflow.Core.Exceptions;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Core.Services;

public class UsuarioService(IUsuarioRepository repo) : IUsuarioService
{
    public async Task<IEnumerable<UsuarioResponse>> GetAllAsync()
    {
        var usuarios = await repo.GetAllAsync();
        return usuarios.Select(MapToResponse).OrderBy(u => u.Nombre);
    }

    public async Task<UsuarioResponse> UpdateRolAsync(string id, RolUsuario rol)
    {
        var usuario = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Usuario", id);
        usuario.Rol = rol;
        usuario.ActualizadoEn = DateTime.UtcNow;
        await repo.UpdateAsync(id, usuario);
        return MapToResponse(usuario);
    }

    public async Task<UsuarioResponse> ToggleActivoAsync(string id)
    {
        var usuario = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Usuario", id);
        usuario.Activo = !usuario.Activo;
        usuario.ActualizadoEn = DateTime.UtcNow;
        await repo.UpdateAsync(id, usuario);
        return MapToResponse(usuario);
    }

    private static UsuarioResponse MapToResponse(Usuario u) =>
        new(u.Id, u.Nombre, u.Email, u.Rol, u.Activo, u.CreadoEn);
}
