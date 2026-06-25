using Picflow.Core.DTOs.Request;
using Picflow.Core.DTOs.Response;
using Picflow.Core.Entities;
using Picflow.Core.Enums;
using Picflow.Core.Exceptions;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Core.Services;

public class PublicReservaService(
    ICitaRepository citaRepo,
    IClienteRepository clienteRepo,
    IEmailService emailService) : IPublicReservaService
{
    // Horario de atención: 9 AM – 5 PM (hora local)
    private static readonly int[] HorasNegocio = [9, 10, 11, 12, 13, 14, 15, 16, 17];

    public async Task<IEnumerable<SlotDisponibilidadResponse>> GetDisponibilidadAsync(DateTime fecha)
    {
        var inicio = fecha.Date;
        var fin    = inicio.AddDays(1).AddTicks(-1);

        var citasDelDia = (await citaRepo.GetByFechaAsync(inicio, fin))
            .Where(c => c.Estado != EstadoCita.Cancelada)
            .ToList();

        var slots = HorasNegocio.Select(h =>
        {
            var slotStart = inicio.AddHours(h);
            var slotEnd   = slotStart.AddHours(1);

            var ocupado = citasDelDia.Any(c =>
            {
                var citaStart = c.FechaHora;
                var citaEnd   = citaStart.AddMinutes(c.DuracionMinutos);
                return citaStart < slotEnd && citaEnd > slotStart;
            });

            return new SlotDisponibilidadResponse(
                Hora: slotStart.ToString("hh:mm tt"),
                FechaHora: slotStart,
                Disponible: !ocupado && slotStart > DateTime.Now
            );
        });

        return slots;
    }

    public async Task<ReservaConfirmadaResponse> ReservarAsync(ReservaPublicaRequest request)
    {
        if (request.FechaHora <= DateTime.Now)
            throw new ValidationException("La fecha y hora seleccionada ya pasó.");

        // Buscar o crear cliente
        var existentes = await clienteRepo.SearchAsync(request.Email);
        var cliente = existentes.FirstOrDefault(c =>
            c.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase));

        if (cliente is null)
        {
            cliente = await clienteRepo.CreateAsync(new Cliente
            {
                Nombre     = request.Nombre.Trim(),
                Email      = request.Email.Trim().ToLower(),
                Telefono   = request.Telefono.Trim(),
                Cedula     = request.Cedula?.Trim() ?? string.Empty,
                Direccion  = string.Empty,
                Notas      = string.Empty,
            });
        }

        // Verificar que el slot sigue disponible
        var slotStart = request.FechaHora;
        var slotEnd   = slotStart.AddMinutes(request.DuracionMinutos > 0 ? request.DuracionMinutos : 60);
        var citasRango = (await citaRepo.GetByFechaAsync(slotStart.AddMinutes(-1), slotEnd.AddMinutes(1)))
            .Where(c => c.Estado != EstadoCita.Cancelada);

        var hayConflicto = citasRango.Any(c =>
        {
            var citaEnd = c.FechaHora.AddMinutes(c.DuracionMinutos);
            return c.FechaHora < slotEnd && citaEnd > slotStart;
        });

        if (hayConflicto)
            throw new ValidationException("El horario seleccionado ya no está disponible. Por favor elige otro.");

        var cita = await citaRepo.CreateAsync(new Cita
        {
            ClienteId       = cliente.Id,
            FotografoId     = string.Empty,
            FechaHora       = request.FechaHora,
            DuracionMinutos = request.DuracionMinutos > 0 ? request.DuracionMinutos : 60,
            Servicio        = request.Servicio.Trim(),
            Notas           = request.Notas?.Trim() ?? string.Empty,
            Ubicacion       = request.Ubicacion?.Trim() ?? string.Empty,
            Estado          = EstadoCita.Pendiente,
        });

        // Enviar email de confirmación (no bloqueante para el response)
        _ = emailService.SendConfirmacionCitaAsync(
            cliente.Email, cliente.Nombre, cita.FechaHora, cita.Servicio, cita.Id)
            .ContinueWith(t => { /* silenciar errores de email */ }, TaskContinuationOptions.OnlyOnFaulted);

        return new ReservaConfirmadaResponse(
            CitaId:        cita.Id,
            NombreCliente: cliente.Nombre,
            Email:         cliente.Email,
            FechaHora:     cita.FechaHora,
            Servicio:      cita.Servicio,
            Estado:        cita.Estado.ToString(),
            Mensaje:       "Tu solicitud de cita fue recibida. Te confirmaremos por correo electrónico en breve."
        );
    }
}
