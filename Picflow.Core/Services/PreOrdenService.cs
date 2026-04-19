using Picflow.Core.DTOs.Request;
using Picflow.Core.DTOs.Response;
using Picflow.Core.Entities;
using Picflow.Core.Enums;
using Picflow.Core.Exceptions;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Core.Services;

public class PreOrdenService(
    IPreOrdenRepository repo,
    IClienteRepository clienteRepo,
    IFacturaRepository facturaRepo,
    IPagoRepository pagoRepo) : IPreOrdenService
{
    public async Task<PreOrdenResponse> GetByIdAsync(string id)
    {
        var preOrden = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("PreOrden", id);
        return await MapToResponseAsync(preOrden);
    }

    public async Task<IEnumerable<PreOrdenResponse>> GetByClienteAsync(string clienteId)
    {
        var preOrdenes = await repo.GetByClienteIdAsync(clienteId);
        var responses = new List<PreOrdenResponse>();
        foreach (var p in preOrdenes)
            responses.Add(await MapToResponseAsync(p));
        return responses;
    }

    public async Task<IEnumerable<PreOrdenResponse>> GetPendientesAsync()
    {
        var borrador = await repo.GetByEstadoAsync(EstadoPreOrden.Borrador);
        var confirmadas = await repo.GetByEstadoAsync(EstadoPreOrden.Confirmada);
        var todas = borrador.Concat(confirmadas);
        var responses = new List<PreOrdenResponse>();
        foreach (var p in todas)
            responses.Add(await MapToResponseAsync(p));
        return responses;
    }

    public async Task<PreOrdenResponse> CreateAsync(CreatePreOrdenRequest request)
    {
        _ = await clienteRepo.GetByIdAsync(request.ClienteId)
            ?? throw new NotFoundException("Cliente", request.ClienteId);

        var items = request.Items.Select(i => new ItemPreOrden
        {
            ServicioId = i.ServicioId,
            Descripcion = i.Descripcion.Trim(),
            CodigoBarras = i.CodigoBarras.Trim(),
            Cantidad = i.Cantidad,
            PrecioUnitario = i.PrecioUnitario,
            OpcionImpresion = i.OpcionImpresion is null ? null : new OpcionImpresion
            {
                CategoriaId = i.OpcionImpresion.CategoriaId,
                SubCategoriaId = i.OpcionImpresion.SubCategoriaId,
                ServicioId = i.OpcionImpresion.ServicioId,
                Tamanio = i.OpcionImpresion.Tamanio,
                TipoAcabado = i.OpcionImpresion.TipoAcabado,
                Cantidad = i.OpcionImpresion.Cantidad,
                PrecioUnitario = i.OpcionImpresion.PrecioUnitario
            }
        }).ToList();

        var subtotal = items.Sum(i => i.Subtotal);
        var total = subtotal + (subtotal * request.Impuesto / 100);

        var preOrden = new PreOrden
        {
            ClienteId = request.ClienteId,
            CitaId = request.CitaId,
            NumeroPreOrden = await repo.GenerarNumeroPreOrdenAsync(),
            Items = items,
            Subtotal = subtotal,
            Impuesto = request.Impuesto,
            Total = total,
            Notas = request.Notas
        };

        var creada = await repo.CreateAsync(preOrden);
        return await MapToResponseAsync(creada);
    }

    public async Task<PreOrdenResponse> ConfirmarAsync(string id)
    {
        var preOrden = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("PreOrden", id);

        if (preOrden.Estado != EstadoPreOrden.Borrador)
            throw new InvalidOperationException("Solo se pueden confirmar pre-órdenes en estado Borrador.");

        preOrden.Estado = EstadoPreOrden.Confirmada;
        preOrden.ActualizadoEn = DateTime.UtcNow;

        await repo.UpdateAsync(id, preOrden);
        return await MapToResponseAsync(preOrden);
    }

    public async Task<FacturaResponse> ConvertirAFacturaAsync(string id, ConvertirPreOrdenRequest request)
    {
        var preOrden = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("PreOrden", id);

        if (preOrden.Estado == EstadoPreOrden.Convertida)
            throw new InvalidOperationException("Esta pre-orden ya fue convertida a factura.");

        if (preOrden.Estado == EstadoPreOrden.Cancelada)
            throw new InvalidOperationException("No se puede convertir una pre-orden cancelada.");

        var cliente = await clienteRepo.GetByIdAsync(preOrden.ClienteId)
            ?? throw new NotFoundException("Cliente", preOrden.ClienteId);

        var items = preOrden.Items.Select(i => new ItemFactura
        {
            ServicioId = i.ServicioId,
            Descripcion = i.Descripcion,
            CodigoBarras = i.CodigoBarras,
            Cantidad = i.Cantidad,
            PrecioUnitario = i.PrecioUnitario
        }).ToList();

        var subtotal = items.Sum(i => i.Subtotal);
        decimal saldoFavorAplicado = 0;

        if (request.AplicarSaldoFavor && cliente.SaldoFavor > 0)
        {
            saldoFavorAplicado = Math.Min(cliente.SaldoFavor, subtotal + (subtotal * request.Impuesto / 100));
            cliente.SaldoFavor -= saldoFavorAplicado;
            cliente.ActualizadoEn = DateTime.UtcNow;
            await clienteRepo.UpdateAsync(cliente.Id, cliente);
        }

        var total = subtotal + (subtotal * request.Impuesto / 100) - saldoFavorAplicado;

        var factura = new Factura
        {
            ClienteId = preOrden.ClienteId,
            CitaId = preOrden.CitaId,
            NumeroFactura = await facturaRepo.GenerarNumeroFacturaAsync(),
            Items = items,
            Subtotal = subtotal,
            Impuesto = request.Impuesto,
            Total = total,
            SaldoFavorAplicado = saldoFavorAplicado,
            PreOrdenId = preOrden.Id,
            Notas = request.Notas
        };

        var facturaCreada = await facturaRepo.CreateAsync(factura);

        preOrden.Estado = EstadoPreOrden.Convertida;
        preOrden.FacturaId = facturaCreada.Id;
        preOrden.ActualizadoEn = DateTime.UtcNow;
        await repo.UpdateAsync(id, preOrden);

        var pagos = await pagoRepo.GetByFacturaIdAsync(facturaCreada.Id);
        return MapFacturaToResponse(facturaCreada, cliente.Nombre, pagos);
    }

    public async Task CancelarAsync(string id)
    {
        var preOrden = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("PreOrden", id);

        if (preOrden.Estado == EstadoPreOrden.Convertida)
            throw new InvalidOperationException("No se puede cancelar una pre-orden ya convertida.");

        preOrden.Estado = EstadoPreOrden.Cancelada;
        preOrden.ActualizadoEn = DateTime.UtcNow;
        await repo.UpdateAsync(id, preOrden);
    }

    private async Task<PreOrdenResponse> MapToResponseAsync(PreOrden p)
    {
        var cliente = await clienteRepo.GetByIdAsync(p.ClienteId);
        var nombreCliente = cliente?.Nombre ?? string.Empty;

        var items = p.Items.Select(i => new ItemPreOrdenResponse(
            i.ServicioId, i.Descripcion, i.CodigoBarras,
            i.Cantidad, i.PrecioUnitario, i.Subtotal,
            i.OpcionImpresion is null ? null : new OpcionImpresionResponse(
                i.OpcionImpresion.CategoriaId, i.OpcionImpresion.NombreCategoria,
                i.OpcionImpresion.SubCategoriaId, i.OpcionImpresion.NombreSubCategoria,
                i.OpcionImpresion.ServicioId, i.OpcionImpresion.Tamanio,
                i.OpcionImpresion.TipoAcabado, i.OpcionImpresion.Cantidad,
                i.OpcionImpresion.PrecioUnitario)
        )).ToList();

        return new PreOrdenResponse(
            p.Id, p.NumeroPreOrden, p.ClienteId, nombreCliente,
            p.CitaId, items, p.Subtotal, p.Impuesto, p.Total,
            p.Estado, p.FacturaId, p.Notas, p.CreadoEn);
    }

    private static FacturaResponse MapFacturaToResponse(Factura f, string nombreCliente, IEnumerable<Pago> pagos)
    {
        var items = f.Items.Select(i => new ItemFacturaResponse(
            i.ServicioId, i.Descripcion, i.CodigoBarras,
            i.Cantidad, i.PrecioUnitario, i.Subtotal)).ToList();

        var pagoResponses = pagos.Select(p => new PagoResponse(
            p.Id, p.FacturaId, p.Fecha, p.Monto, p.Metodo, p.Referencia, p.Notas)).ToList();

        return new FacturaResponse(
            f.Id, f.NumeroFactura, f.ClienteId, nombreCliente, f.CitaId,
            f.Fecha, items, f.Subtotal, f.Impuesto, f.Total,
            f.TotalPagado, f.Total - f.TotalPagado,
            f.SaldoFavorAplicado, f.Estado, f.PreOrdenId, f.Notas, pagoResponses);
    }
}
