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
    [HttpGet]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> GetAll()
    {
        var usuarios = await usuarioRepo.GetAllAsync();
        var result = usuarios.Select(u => new
        {
            id = u.Id,
            nombre = u.Nombre,
            email = u.Email,
            rol = u.Rol.ToString(),
            activo = u.Activo,
            creadoEn = u.CreadoEn
        });
        return Ok(result);
    }

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

    [HttpPatch("{id}/rol")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> UpdateRol(string id, [FromBody] UpdateRolUsuarioRequest request)
    {
        var usuario = await usuarioRepo.GetByIdAsync(id);
        if (usuario is null) return NotFound();
        usuario.Rol = request.Rol;
        await usuarioRepo.UpdateAsync(id, usuario);
        return Ok(new { id = usuario.Id, rol = usuario.Rol.ToString() });
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

    [HttpPost("{id}/opciones-impresion")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> AgregarOpcionImpresion(
        string id, [FromBody] AgregarOpcionImpresionRequest request) =>
        Ok(await fotografiaService.AgregarOpcionImpresionAsync(id, request));

    [HttpDelete("{id}/opciones-impresion/{subCategoriaId}")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> EliminarOpcionImpresion(string id, string subCategoriaId) =>
        Ok(await fotografiaService.EliminarOpcionImpresionAsync(id, subCategoriaId));

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

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class PagosController(IPagoService pagoService) : ControllerBase
{
    [HttpGet("cliente/{clienteId}")]
    public async Task<IActionResult> GetHistorialByCliente(string clienteId) =>
        Ok(await pagoService.GetHistorialByClienteAsync(clienteId));
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class CategoriasController(ICategoriaService categoriaService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await categoriaService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) =>
        Ok(await categoriaService.GetByIdAsync(id));

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Create([FromBody] CreateCategoriaRequest request)
    {
        var result = await categoriaService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateCategoriaRequest request) =>
        Ok(await categoriaService.UpdateAsync(id, request));

    [HttpPost("{id}/subcategorias")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> AgregarSubCategoria(
        string id, [FromBody] CreateSubCategoriaRequest request) =>
        Ok(await categoriaService.AgregarSubCategoriaAsync(id, request));

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        await categoriaService.DeleteAsync(id);
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class ServiciosController(IServicioService servicioService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await servicioService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) =>
        Ok(await servicioService.GetByIdAsync(id));

    [HttpGet("categoria/{categoriaId}")]
    public async Task<IActionResult> GetByCategoria(string categoriaId) =>
        Ok(await servicioService.GetByCategoriaAsync(categoriaId));

    [HttpGet("barcode/{codigo}")]
    public async Task<IActionResult> GetByCodigoBarras(string codigo)
    {
        var result = await servicioService.GetByCodigoBarrasAsync(codigo);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Create([FromBody] CreateServicioRequest request)
    {
        var result = await servicioService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateServicioRequest request) =>
        Ok(await servicioService.UpdateAsync(id, request));

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(string id)
    {
        await servicioService.DeleteAsync(id);
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class PreOrdenesController(IPreOrdenService preOrdenService) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) =>
        Ok(await preOrdenService.GetByIdAsync(id));

    [HttpGet("cliente/{clienteId}")]
    public async Task<IActionResult> GetByCliente(string clienteId) =>
        Ok(await preOrdenService.GetByClienteAsync(clienteId));

    [HttpGet("pendientes")]
    public async Task<IActionResult> GetPendientes() =>
        Ok(await preOrdenService.GetPendientesAsync());

    [HttpPost]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> Create([FromBody] CreatePreOrdenRequest request)
    {
        var result = await preOrdenService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPatch("{id}/confirmar")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> Confirmar(string id) =>
        Ok(await preOrdenService.ConfirmarAsync(id));

    [HttpPost("{id}/convertir")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> ConvertirAFactura(
        string id, [FromBody] ConvertirPreOrdenRequest request) =>
        Ok(await preOrdenService.ConvertirAFacturaAsync(id, request));

    [HttpPatch("{id}/cancelar")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    public async Task<IActionResult> Cancelar(string id)
    {
        await preOrdenService.CancelarAsync(id);
        return NoContent();
    }
}
