using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Picflow.Core.DTOs.Request;
using Picflow.Core.Enums;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;

namespace Picflow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        return Ok(result);
    }

    [HttpPost("register")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Register([FromBody] CreateUsuarioRequest request)
    {
        var result = await authService.RegisterAsync(request);
        return CreatedAtAction(nameof(Register), result);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuariosController(IUsuarioRepository usuarioRepo) : ControllerBase
{
    [HttpGet("fotografos")]
    public async Task<IActionResult> GetFotografos()
    {
        var fotografos = await usuarioRepo.GetByRolAsync(RolUsuario.Fotografo);
        var admins = await usuarioRepo.GetByRolAsync(RolUsuario.Administrador);
        var todos = fotografos.Concat(admins).Select(u => new
        {
            id = u.Id,
            nombre = u.Nombre,
            email = u.Email,
            rol = u.Rol.ToString()
        });
        return Ok(todos);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class ClientesController(IClienteService clienteService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await clienteService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) =>
        Ok(await clienteService.GetByIdAsync(id));

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q) =>
        Ok(await clienteService.SearchAsync(q));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClienteRequest request)
    {
        var result = await clienteService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateClienteRequest request) =>
        Ok(await clienteService.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        await clienteService.DeleteAsync(id);
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class CitasController(ICitaService citaService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await citaService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) =>
        Ok(await citaService.GetByIdAsync(id));

    [HttpGet("cliente/{clienteId}")]
    public async Task<IActionResult> GetByCliente(string clienteId) =>
        Ok(await citaService.GetByClienteAsync(clienteId));

    [HttpGet("rango")]
    public async Task<IActionResult> GetByFecha(
        [FromQuery] DateTime desde, [FromQuery] DateTime hasta) =>
        Ok(await citaService.GetByFechaAsync(desde, hasta));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCitaRequest request)
    {
        var result = await citaService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateCitaRequest request) =>
        Ok(await citaService.UpdateAsync(id, request));

    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> CambiarEstado(string id, [FromBody] string estado) =>
        Ok(await citaService.CambiarEstadoAsync(id, estado));

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> Delete(string id)
    {
        await citaService.DeleteAsync(id);
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class FotografiasController(IFotografiaService fotografiaService) : ControllerBase
{
    [HttpGet("cita/{citaId}")]
    public async Task<IActionResult> GetByCita(string citaId) =>
        Ok(await fotografiaService.GetByCitaAsync(citaId));

    [HttpGet("cliente/{clienteId}")]
    public async Task<IActionResult> GetByCliente(string clienteId) =>
        Ok(await fotografiaService.GetByClienteAsync(clienteId));

    [HttpPost("upload")]
    [Authorize(Roles = "Administrador,Fotografo")]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile archivo,
        [FromForm] string clienteId,
        [FromForm] string titulo,
        [FromForm] string? citaId = null,
        [FromForm] string? descripcion = null)
    {
        using var stream = archivo.OpenReadStream();
        var request = new UploadFotografiaRequest(
            citaId ?? string.Empty,
            clienteId,
            stream,
            archivo.FileName,
            titulo,
            descripcion ?? string.Empty
        );
        var result = await fotografiaService.UploadAsync(request);
        return Ok(result);
    }

    [HttpPatch("entregar")]
    [Authorize(Roles = "Administrador,Fotografo")]
    public async Task<IActionResult> MarcarEntregadas([FromBody] List<string> ids)
    {
        await fotografiaService.MarcarEntregadasAsync(ids);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador,Fotografo")]
    public async Task<IActionResult> Delete(string id)
    {
        await fotografiaService.DeleteAsync(id);
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class FacturasController(IFacturaService facturaService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await facturaService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) =>
        Ok(await facturaService.GetByIdAsync(id));

    [HttpGet("cliente/{clienteId}")]
    public async Task<IActionResult> GetByCliente(string clienteId) =>
        Ok(await facturaService.GetByClienteAsync(clienteId));

    [HttpGet("pendientes")]
    public async Task<IActionResult> GetPendientes() =>
        Ok(await facturaService.GetPendientesAsync());

    [HttpPost]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> Create([FromBody] CreateFacturaRequest request)
    {
        var result = await facturaService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{facturaId}/pagos")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> RegistrarPago(
        string facturaId, [FromBody] CreatePagoRequest request) =>
        Ok(await facturaService.RegistrarPagoAsync(facturaId, request));
}
