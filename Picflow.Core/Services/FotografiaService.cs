using Picflow.Core.DTOs.Request;
using Picflow.Core.DTOs.Response;
using Picflow.Core.Entities;
using Picflow.Core.Exceptions;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Core.Services;

public class FotografiaService(
    IFotografiaRepository repo,
    IMediaService mediaService) : IFotografiaService
{
    public async Task<FotografiaResponse> GetByIdAsync(string id)
    {
        var foto = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Fotografía", id);
        return MapToResponse(foto);
    }

    public async Task<IEnumerable<FotografiaResponse>> GetByCitaAsync(string citaId)
    {
        var fotos = await repo.GetByCitaIdAsync(citaId);
        return fotos.Select(MapToResponse);
    }

    public async Task<IEnumerable<FotografiaResponse>> GetByClienteAsync(string clienteId)
    {
        var fotos = await repo.GetByClienteIdAsync(clienteId);
        return fotos.Select(MapToResponse);
    }

    public async Task<FotografiaResponse> UploadAsync(UploadFotografiaRequest request)
    {
        var folder = $"picflow/clientes/{request.ClienteId}/citas/{request.CitaId}";
        var result = await mediaService.UploadAsync(request.FileStream, request.FileName, folder);

        var foto = new Fotografia
        {
            CitaId = request.CitaId,
            ClienteId = request.ClienteId,
            UrlCloudinary = result.Url,
            PublicId = result.PublicId,
            Titulo = request.Titulo,
            Descripcion = request.Descripcion,
            TamanioBytes = result.Bytes,
            Formato = result.Format
        };

        var creada = await repo.CreateAsync(foto);
        return MapToResponse(creada);
    }

    public async Task MarcarEntregadasAsync(IEnumerable<string> ids)
    {
        await repo.MarcarEntregadasAsync(ids);
    }

    public async Task DeleteAsync(string id)
    {
        var foto = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Fotografía", id);

        await mediaService.DeleteAsync(foto.PublicId);
        await repo.DeleteAsync(id);
    }

    private static FotografiaResponse MapToResponse(Fotografia f) =>
        new(f.Id, f.CitaId, f.ClienteId, f.UrlCloudinary, f.PublicId,
            f.Titulo, f.Descripcion, f.Entregada, f.TamanioBytes, f.Formato, f.CreadoEn);
}

public class FacturaService(
    IFacturaRepository facturaRepo,
    IPagoRepository pagoRepo,
    IClienteRepository clienteRepo) : IFacturaService
{
    public async Task<FacturaResponse> GetByIdAsync(string id)
    {
        var factura = await facturaRepo.GetByIdAsync(id)
            ?? throw new NotFoundException("Factura", id);
        return await MapToResponseAsync(factura);
    }

    public async Task<IEnumerable<FacturaResponse>> GetByClienteAsync(string clienteId)
    {
        var facturas = await facturaRepo.GetByClienteIdAsync(clienteId);
        return await Task.WhenAll(facturas.Select(MapToResponseAsync));
    }

    public async Task<IEnumerable<FacturaResponse>> GetAllAsync()
    {
        var facturas = await facturaRepo.GetAllAsync();
        return await Task.WhenAll(facturas.Select(MapToResponseAsync));
    }

    public async Task<IEnumerable<FacturaResponse>> GetPendientesAsync()
    {
        var facturas = await facturaRepo.GetByEstadoAsync(Enums.EstadoFactura.Pendiente);
        var parciales = await facturaRepo.GetByEstadoAsync(Enums.EstadoFactura.PagoParcial);
        return await Task.WhenAll(facturas.Concat(parciales).Select(MapToResponseAsync));
    }

    public async Task<FacturaResponse> CreateAsync(CreateFacturaRequest request)
    {
        var cliente = await clienteRepo.GetByIdAsync(request.ClienteId)
            ?? throw new NotFoundException("Cliente", request.ClienteId);

        var items = request.Items.Select(i => new ItemFactura
        {
            Descripcion = i.Descripcion,
            Cantidad = i.Cantidad,
            PrecioUnitario = i.PrecioUnitario
        }).ToList();

        var subtotal = items.Sum(i => i.Subtotal);
        var total = subtotal + (subtotal * request.Impuesto / 100);
        var numero = await facturaRepo.GenerarNumeroFacturaAsync();

        var factura = new Factura
        {
            ClienteId = request.ClienteId,
            CitaId = request.CitaId,
            NumeroFactura = numero,
            Items = items,
            Subtotal = subtotal,
            Impuesto = request.Impuesto,
            Total = total,
            TotalPagado = 0,
            Estado = Enums.EstadoFactura.Pendiente,
            Notas = request.Notas
        };

        var creada = await facturaRepo.CreateAsync(factura);
        return await MapToResponseAsync(creada);
    }

    public async Task<PagoResponse> RegistrarPagoAsync(string facturaId, CreatePagoRequest request)
    {
        var factura = await facturaRepo.GetByIdAsync(facturaId)
            ?? throw new NotFoundException("Factura", facturaId);

        if (factura.Estado == Enums.EstadoFactura.Pagada)
            throw new ValidationException("La factura ya está completamente pagada.");

        var pago = new Pago
        {
            FacturaId = facturaId,
            Monto = request.Monto,
            Metodo = request.Metodo,
            Referencia = request.Referencia,
            Notas = request.Notas
        };

        var creado = await pagoRepo.CreateAsync(pago);

        // Update factura total paid and status
        factura.TotalPagado += request.Monto;
        factura.Estado = factura.TotalPagado >= factura.Total
            ? Enums.EstadoFactura.Pagada
            : Enums.EstadoFactura.PagoParcial;
        factura.ActualizadoEn = DateTime.UtcNow;

        await facturaRepo.UpdateAsync(facturaId, factura);

        return new PagoResponse(creado.Id, creado.FacturaId, creado.Fecha,
            creado.Monto, creado.Metodo, creado.Referencia, creado.Notas);
    }

    private async Task<FacturaResponse> MapToResponseAsync(Factura f)
    {
        var cliente = await clienteRepo.GetByIdAsync(f.ClienteId);
        var pagos = await pagoRepo.GetByFacturaIdAsync(f.Id);

        var itemsResponse = f.Items.Select(i =>
            new ItemFacturaResponse(i.Descripcion, i.Cantidad, i.PrecioUnitario, i.Subtotal)).ToList();

        var pagosResponse = pagos.Select(p =>
            new PagoResponse(p.Id, p.FacturaId, p.Fecha, p.Monto, p.Metodo, p.Referencia, p.Notas)).ToList();

        return new FacturaResponse(
            f.Id, f.NumeroFactura, f.ClienteId, cliente?.Nombre ?? "-",
            f.CitaId, f.Fecha, itemsResponse, f.Subtotal, f.Impuesto,
            f.Total, f.TotalPagado, f.Total - f.TotalPagado, f.Estado, f.Notas, pagosResponse);
    }
}
