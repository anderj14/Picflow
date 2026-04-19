using Picflow.Core.DTOs.Request;
using Picflow.Core.DTOs.Response;
using Picflow.Core.Entities;
using Picflow.Core.Exceptions;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Core.Services;

public class ServicioService(IServicioRepository repo, ICategoriaRepository categoriaRepo) : IServicioService
{
    public async Task<ServicioResponse> GetByIdAsync(string id)
    {
        var servicio = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Servicio", id);
        return await MapToResponseAsync(servicio);
    }

    public async Task<IEnumerable<ServicioResponse>> GetAllAsync()
    {
        var servicios = await repo.GetActivosAsync();
        var responses = new List<ServicioResponse>();
        foreach (var s in servicios)
            responses.Add(await MapToResponseAsync(s));
        return responses;
    }

    public async Task<IEnumerable<ServicioResponse>> GetByCategoriaAsync(string categoriaId)
    {
        var servicios = await repo.GetByCategoriaIdAsync(categoriaId);
        var responses = new List<ServicioResponse>();
        foreach (var s in servicios)
            responses.Add(await MapToResponseAsync(s));
        return responses;
    }

    public async Task<ServicioResponse?> GetByCodigoBarrasAsync(string codigoBarras)
    {
        var servicio = await repo.GetByCodigoBarrasAsync(codigoBarras);
        return servicio is null ? null : await MapToResponseAsync(servicio);
    }

    public async Task<ServicioResponse> CreateAsync(CreateServicioRequest request)
    {
        _ = await categoriaRepo.GetByIdAsync(request.CategoriaId)
            ?? throw new NotFoundException("Categoria", request.CategoriaId);

        var servicio = new Servicio
        {
            Nombre = request.Nombre.Trim(),
            Descripcion = request.Descripcion.Trim(),
            CategoriaId = request.CategoriaId,
            SubCategoriaId = request.SubCategoriaId,
            PrecioBase = request.PrecioBase,
            CodigoBarras = request.CodigoBarras.Trim()
        };

        var creado = await repo.CreateAsync(servicio);
        return await MapToResponseAsync(creado);
    }

    public async Task<ServicioResponse> UpdateAsync(string id, UpdateServicioRequest request)
    {
        var servicio = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Servicio", id);

        _ = await categoriaRepo.GetByIdAsync(request.CategoriaId)
            ?? throw new NotFoundException("Categoria", request.CategoriaId);

        servicio.Nombre = request.Nombre.Trim();
        servicio.Descripcion = request.Descripcion.Trim();
        servicio.CategoriaId = request.CategoriaId;
        servicio.SubCategoriaId = request.SubCategoriaId;
        servicio.PrecioBase = request.PrecioBase;
        servicio.CodigoBarras = request.CodigoBarras.Trim();
        servicio.ActualizadoEn = DateTime.UtcNow;

        await repo.UpdateAsync(id, servicio);
        return await MapToResponseAsync(servicio);
    }

    public async Task DeleteAsync(string id)
    {
        _ = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Servicio", id);
        await repo.DeleteAsync(id);
    }

    private async Task<ServicioResponse> MapToResponseAsync(Servicio s)
    {
        var categoria = await categoriaRepo.GetByIdAsync(s.CategoriaId);
        var nombreCategoria = categoria?.Nombre ?? string.Empty;
        var subCategoria = categoria?.SubCategorias.FirstOrDefault(sc => sc.Id == s.SubCategoriaId);
        var nombreSubCategoria = subCategoria?.Nombre ?? string.Empty;

        return new ServicioResponse(
            s.Id, s.Nombre, s.Descripcion,
            s.CategoriaId, nombreCategoria,
            s.SubCategoriaId, nombreSubCategoria,
            s.PrecioBase, s.CodigoBarras, s.Activo, s.CreadoEn);
    }
}
