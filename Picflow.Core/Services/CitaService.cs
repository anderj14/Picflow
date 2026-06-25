using Picflow.Core.DTOs.Request;
using Picflow.Core.DTOs.Response;
using Picflow.Core.Entities;
using Picflow.Core.Enums;
using Picflow.Core.Exceptions;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Core.Services;

public class CitaService(
    ICitaRepository citaRepo,
    IClienteRepository clienteRepo,
    IUsuarioRepository usuarioRepo,
    IEmailService emailService) : ICitaService
{
    public async Task<CitaResponse> GetByIdAsync(string id)
    {
        var cita = await citaRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Cita", id);
        return await MapToResponseAsync(cita);
    }

    public async Task<IEnumerable<CitaResponse>> GetAllAsync()
    {
        var citas = await citaRepo.GetAllAsync();
        return await MapManyAsync(citas);
    }

    public async Task<IEnumerable<CitaResponse>> GetByClienteAsync(string clienteId)
    {
        var citas = await citaRepo.GetByClienteIdAsync(clienteId);
        return await MapManyAsync(citas);
    }

    public async Task<IEnumerable<CitaResponse>> GetByFechaAsync(DateTime desde, DateTime hasta)
    {
        var citas = await citaRepo.GetByFechaAsync(desde, hasta);
        return await MapManyAsync(citas);
    }

    public async Task<CitaResponse> CreateAsync(CreateCitaRequest request)
    {
        _ = await clienteRepo.GetByIdAsync(request.ClienteId)
            ?? throw new NotFoundException("Cliente", request.ClienteId);

        _ = await usuarioRepo.GetByIdAsync(request.FotografoId)
            ?? throw new NotFoundException("Fotógrafo", request.FotografoId);

        if (request.FechaHora < DateTime.UtcNow)
            throw new ValidationException("La fecha de la cita no puede ser en el pasado.");

        var cita = new Cita
        {
            ClienteId = request.ClienteId,
            FotografoId = request.FotografoId,
            FechaHora = request.FechaHora,
            DuracionMinutos = request.DuracionMinutos,
            Servicio = request.Servicio.Trim(),
            Notas = request.Notas,
            Ubicacion = request.Ubicacion,
            Estado = EstadoCita.Pendiente
        };

        var creada = await citaRepo.CreateAsync(cita);
        return await MapToResponseAsync(creada);
    }

    public async Task<CitaResponse> UpdateAsync(string id, UpdateCitaRequest request)
    {
        var cita = await citaRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Cita", id);

        if (cita.Estado == EstadoCita.Cancelada)
            throw new ValidationException("No se puede modificar una cita cancelada.");

        cita.FotografoId = request.FotografoId;
        cita.FechaHora = request.FechaHora;
        cita.DuracionMinutos = request.DuracionMinutos;
        cita.Servicio = request.Servicio.Trim();
        cita.Notas = request.Notas;
        cita.Ubicacion = request.Ubicacion;
        cita.ActualizadoEn = DateTime.UtcNow;

        await citaRepo.UpdateAsync(id, cita);
        return await MapToResponseAsync(cita);
    }

    public async Task<CitaResponse> CambiarEstadoAsync(string id, string estado)
    {
        var cita = await citaRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Cita", id);

        if (!Enum.TryParse<EstadoCita>(estado, true, out var nuevoEstado))
            throw new ValidationException($"Estado '{estado}' no válido.");

        cita.Estado = nuevoEstado;
        cita.ActualizadoEn = DateTime.UtcNow;

        await citaRepo.UpdateAsync(id, cita);

        if (nuevoEstado == EstadoCita.Confirmada)
        {
            var cliente = await clienteRepo.GetByIdAsync(cita.ClienteId);
            if (cliente is not null && !string.IsNullOrWhiteSpace(cliente.Email))
            {
                _ = emailService.SendCitaConfirmadaAsync(
                    cliente.Email, cliente.Nombre, cita.FechaHora,
                    cita.Servicio, cita.Ubicacion, cita.Id)
                    .ContinueWith(t => { }, TaskContinuationOptions.OnlyOnFaulted);
            }
        }

        return await MapToResponseAsync(cita);
    }

    public async Task DeleteAsync(string id)
    {
        _ = await citaRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Cita", id);
        await citaRepo.DeleteAsync(id);
    }

    private async Task<CitaResponse> MapToResponseAsync(Cita c)
    {
        var cliente = await clienteRepo.GetByIdAsync(c.ClienteId);
        var fotografo = await usuarioRepo.GetByIdAsync(c.FotografoId);
        return new CitaResponse(
            c.Id, c.ClienteId, cliente?.Nombre ?? "-",
            c.FotografoId, fotografo?.Nombre ?? "-",
            c.FechaHora, c.DuracionMinutos, c.Servicio,
            c.Estado, c.Notas, c.Ubicacion, c.CreadoEn);
    }

    private async Task<IEnumerable<CitaResponse>> MapManyAsync(IEnumerable<Cita> citas)
    {
        var tasks = citas.Select(MapToResponseAsync);
        return await Task.WhenAll(tasks);
    }
}
