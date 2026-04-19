using Picflow.Core.DTOs.Request;
using Picflow.Core.DTOs.Response;
using Picflow.Core.Entities;
using Picflow.Core.Exceptions;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Core.Services;

public class ClienteService(IClienteRepository repo) : IClienteService
{
    public async Task<ClienteResponse> GetByIdAsync(string id)
    {
        var cliente = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Cliente", id);
        return MapToResponse(cliente);
    }

    public async Task<IEnumerable<ClienteResponse>> GetAllAsync()
    {
        var clientes = await repo.GetAllAsync();
        return clientes.Select(MapToResponse);
    }

    public async Task<IEnumerable<ClienteResponse>> SearchAsync(string termino)
    {
        var clientes = await repo.SearchAsync(termino);
        return clientes.Select(MapToResponse);
    }

    public async Task<ClienteResponse> CreateAsync(CreateClienteRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.Cedula))
        {
            var existente = await repo.GetByCedulaAsync(request.Cedula);
            if (existente is not null)
                throw new ConflictException($"Ya existe un cliente con la cédula '{request.Cedula}'.");
        }

        var cliente = new Cliente
        {
            Nombre = request.Nombre.Trim(),
            Telefono = request.Telefono.Trim(),
            Email = request.Email.ToLower().Trim(),
            Cedula = request.Cedula.Trim(),
            Direccion = request.Direccion.Trim(),
            Notas = request.Notas
        };

        var creado = await repo.CreateAsync(cliente);
        return MapToResponse(creado);
    }

    public async Task<ClienteResponse> UpdateAsync(string id, UpdateClienteRequest request)
    {
        var cliente = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Cliente", id);

        cliente.Nombre = request.Nombre.Trim();
        cliente.Telefono = request.Telefono.Trim();
        cliente.Email = request.Email.ToLower().Trim();
        cliente.Direccion = request.Direccion.Trim();
        cliente.Notas = request.Notas;
        cliente.ActualizadoEn = DateTime.UtcNow;

        await repo.UpdateAsync(id, cliente);
        return MapToResponse(cliente);
    }

    public async Task DeleteAsync(string id)
    {
        var existe = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Cliente", id);
        await repo.DeleteAsync(id);
    }

    private static ClienteResponse MapToResponse(Cliente c) =>
        new(c.Id, c.Nombre, c.Telefono, c.Email, c.Cedula,
            c.Direccion, c.Notas, c.CreadoEn, c.SaldoFavor);
}
