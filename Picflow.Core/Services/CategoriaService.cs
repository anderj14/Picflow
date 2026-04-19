using Picflow.Core.DTOs.Request;
using Picflow.Core.DTOs.Response;
using Picflow.Core.Entities;
using Picflow.Core.Exceptions;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Core.Services;

public class CategoriaService(ICategoriaRepository repo) : ICategoriaService
{
    public async Task<CategoriaResponse> GetByIdAsync(string id)
    {
        var categoria = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Categoria", id);
        return MapToResponse(categoria);
    }

    public async Task<IEnumerable<CategoriaResponse>> GetAllAsync()
    {
        var categorias = await repo.GetAllAsync();
        return categorias.Select(MapToResponse);
    }

    public async Task<CategoriaResponse> CreateAsync(CreateCategoriaRequest request)
    {
        var categoria = new Categoria
        {
            Nombre = request.Nombre.Trim(),
            Descripcion = request.Descripcion.Trim(),
            SubCategorias = request.SubCategorias.Select(s => new SubCategoria
            {
                Nombre = s.Nombre.Trim(),
                Tipo = s.Tipo
            }).ToList()
        };

        var creada = await repo.CreateAsync(categoria);
        return MapToResponse(creada);
    }

    public async Task<CategoriaResponse> UpdateAsync(string id, UpdateCategoriaRequest request)
    {
        var categoria = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Categoria", id);

        categoria.Nombre = request.Nombre.Trim();
        categoria.Descripcion = request.Descripcion.Trim();
        categoria.ActualizadoEn = DateTime.UtcNow;

        await repo.UpdateAsync(id, categoria);
        return MapToResponse(categoria);
    }

    public async Task<CategoriaResponse> AgregarSubCategoriaAsync(string id, CreateSubCategoriaRequest request)
    {
        var categoria = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Categoria", id);

        categoria.SubCategorias.Add(new SubCategoria
        {
            Nombre = request.Nombre.Trim(),
            Tipo = request.Tipo
        });
        categoria.ActualizadoEn = DateTime.UtcNow;

        await repo.UpdateAsync(id, categoria);
        return MapToResponse(categoria);
    }

    public async Task DeleteAsync(string id)
    {
        _ = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Categoria", id);
        await repo.DeleteAsync(id);
    }

    private static CategoriaResponse MapToResponse(Categoria c) =>
        new(c.Id, c.Nombre, c.Descripcion,
            c.SubCategorias.Select(s => new SubCategoriaResponse(s.Id, s.Nombre, s.Tipo)).ToList(),
            c.Activa, c.CreadoEn);
}
