using MongoDB.Driver;
using Picflow.Core.Entities;
using Picflow.Core.Enums;
using Picflow.Core.Interfaces.Repositories;
using Picflow.Infrastructure.Persistence;

namespace Picflow.Infrastructure.Repositories;

public class UsuarioRepository(PicflowDbContext ctx)
    : MongoRepository<Usuario>(ctx.Usuarios), IUsuarioRepository
{
    public async Task<Usuario?> GetByEmailAsync(string email) =>
        await Collection.Find(u => u.Email == email.ToLower().Trim()).FirstOrDefaultAsync();

    public async Task<IEnumerable<Usuario>> GetByRolAsync(RolUsuario rol) =>
        await Collection.Find(u => u.Rol == rol && u.Activo).ToListAsync();
}

public class ClienteRepository(PicflowDbContext ctx)
    : MongoRepository<Cliente>(ctx.Clientes), IClienteRepository
{
    public async Task<Cliente?> GetByCedulaAsync(string cedula) =>
        await Collection.Find(c => c.Cedula == cedula.Trim()).FirstOrDefaultAsync();

    public async Task<IEnumerable<Cliente>> SearchAsync(string termino)
    {
        var filter = Builders<Cliente>.Filter.Or(
            Builders<Cliente>.Filter.Regex(c => c.Nombre, new MongoDB.Bson.BsonRegularExpression(termino, "i")),
            Builders<Cliente>.Filter.Regex(c => c.Email, new MongoDB.Bson.BsonRegularExpression(termino, "i")),
            Builders<Cliente>.Filter.Regex(c => c.Telefono, new MongoDB.Bson.BsonRegularExpression(termino, "i")),
            Builders<Cliente>.Filter.Regex(c => c.Cedula, new MongoDB.Bson.BsonRegularExpression(termino, "i"))
        );
        return await Collection.Find(filter).SortByDescending(c => c.CreadoEn).ToListAsync();
    }
}

public class CitaRepository(PicflowDbContext ctx)
    : MongoRepository<Cita>(ctx.Citas), ICitaRepository
{
    public async Task<IEnumerable<Cita>> GetByClienteIdAsync(string clienteId) =>
        await Collection.Find(c => c.ClienteId == clienteId)
            .SortByDescending(c => c.FechaHora).ToListAsync();

    public async Task<IEnumerable<Cita>> GetByFotografoIdAsync(string fotografoId) =>
        await Collection.Find(c => c.FotografoId == fotografoId)
            .SortBy(c => c.FechaHora).ToListAsync();

    public async Task<IEnumerable<Cita>> GetByFechaAsync(DateTime desde, DateTime hasta) =>
        await Collection.Find(c => c.FechaHora >= desde && c.FechaHora <= hasta)
            .SortBy(c => c.FechaHora).ToListAsync();

    public async Task<IEnumerable<Cita>> GetByEstadoAsync(EstadoCita estado) =>
        await Collection.Find(c => c.Estado == estado)
            .SortByDescending(c => c.FechaHora).ToListAsync();
}

public class FotografiaRepository(PicflowDbContext ctx)
    : MongoRepository<Fotografia>(ctx.Fotografias), IFotografiaRepository
{
    public async Task<IEnumerable<Fotografia>> GetByCitaIdAsync(string citaId) =>
        await Collection.Find(f => f.CitaId == citaId)
            .SortByDescending(f => f.CreadoEn).ToListAsync();

    public async Task<IEnumerable<Fotografia>> GetByClienteIdAsync(string clienteId) =>
        await Collection.Find(f => f.ClienteId == clienteId)
            .SortByDescending(f => f.CreadoEn).ToListAsync();

    public async Task<bool> MarcarEntregadasAsync(IEnumerable<string> ids)
    {
        var filter = Builders<Fotografia>.Filter.In(f => f.Id, ids);
        var update = Builders<Fotografia>.Update
            .Set(f => f.Entregada, true)
            .Set(f => f.ActualizadoEn, DateTime.UtcNow);
        var result = await Collection.UpdateManyAsync(filter, update);
        return result.ModifiedCount > 0;
    }
}

public class FacturaRepository(PicflowDbContext ctx)
    : MongoRepository<Factura>(ctx.Facturas), IFacturaRepository
{
    public async Task<IEnumerable<Factura>> GetByClienteIdAsync(string clienteId) =>
        await Collection.Find(f => f.ClienteId == clienteId)
            .SortByDescending(f => f.Fecha).ToListAsync();

    public async Task<IEnumerable<Factura>> GetByEstadoAsync(EstadoFactura estado) =>
        await Collection.Find(f => f.Estado == estado)
            .SortByDescending(f => f.Fecha).ToListAsync();

    public async Task<Factura?> GetByCitaIdAsync(string citaId) =>
        await Collection.Find(f => f.CitaId == citaId).FirstOrDefaultAsync();

    public async Task<string> GenerarNumeroFacturaAsync()
    {
        var anio = DateTime.UtcNow.Year;
        var count = await Collection.CountDocumentsAsync(
            Builders<Factura>.Filter.Regex(f => f.NumeroFactura,
                new MongoDB.Bson.BsonRegularExpression($"^PF-{anio}-")));
        return $"PF-{anio}-{(count + 1):D4}";
    }
}

public class PagoRepository(PicflowDbContext ctx)
    : MongoRepository<Pago>(ctx.Pagos), IPagoRepository
{
    public async Task<IEnumerable<Pago>> GetByFacturaIdAsync(string facturaId) =>
        await Collection.Find(p => p.FacturaId == facturaId)
            .SortByDescending(p => p.Fecha).ToListAsync();

    public async Task<decimal> GetTotalPagadoByFacturaAsync(string facturaId)
    {
        var pagos = await GetByFacturaIdAsync(facturaId);
        return pagos.Sum(p => p.Monto);
    }
}
