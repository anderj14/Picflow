using Picflow.Core.DTOs.Request;
using Picflow.Core.DTOs.Response;
using Picflow.Core.Entities;
using Picflow.Core.Exceptions;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Core.Services;

public class AuthService(
    IUsuarioRepository usuarioRepo,
    ITokenService tokenService) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var usuario = await usuarioRepo.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedException("Credenciales inválidas.");

        if (!usuario.Activo)
            throw new UnauthorizedException("Usuario inactivo.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
            throw new UnauthorizedException("Credenciales inválidas.");

        var token = tokenService.GenerarToken(usuario);
        var expira = DateTime.UtcNow.AddHours(8);

        return new AuthResponse(token, usuario.Id, usuario.Nombre, usuario.Email, usuario.Rol, expira);
    }

    public async Task<UsuarioResponse> RegisterAsync(CreateUsuarioRequest request)
    {
        var existe = await usuarioRepo.GetByEmailAsync(request.Email);
        if (existe is not null)
            throw new ConflictException($"Ya existe un usuario con el email '{request.Email}'.");

        var usuario = new Usuario
        {
            Nombre = request.Nombre,
            Email = request.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Rol = request.Rol,
            Activo = true
        };

        var creado = await usuarioRepo.CreateAsync(usuario);
        return new UsuarioResponse(creado.Id, creado.Nombre, creado.Email, creado.Rol, creado.Activo, creado.CreadoEn);
    }
}

public class JwtSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiresInMinutes { get; set; } = 480;
}
