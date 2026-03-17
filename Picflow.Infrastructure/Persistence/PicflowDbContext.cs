using MongoDB.Driver;
using Picflow.Core.Entities;

namespace Picflow.Infrastructure.Persistence;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
}

public class PicflowDbContext
{
    private readonly IMongoDatabase _db;

    public PicflowDbContext(MongoDbSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        _db = client.GetDatabase(settings.DatabaseName);
        ConfigureIndexes();
    }

    public IMongoCollection<Usuario> Usuarios => _db.GetCollection<Usuario>("usuarios");
    public IMongoCollection<Cliente> Clientes => _db.GetCollection<Cliente>("clientes");
    public IMongoCollection<Cita> Citas => _db.GetCollection<Cita>("citas");
    public IMongoCollection<Fotografia> Fotografias => _db.GetCollection<Fotografia>("fotografias");
    public IMongoCollection<Factura> Facturas => _db.GetCollection<Factura>("facturas");
    public IMongoCollection<Pago> Pagos => _db.GetCollection<Pago>("pagos");

    private void ConfigureIndexes()
    {
        // Usuarios: unique email
        Usuarios.Indexes.CreateOne(new CreateIndexModel<Usuario>(
            Builders<Usuario>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Unique = true }));

        // Clientes: unique cedula, text search on nombre/email
        Clientes.Indexes.CreateOne(new CreateIndexModel<Cliente>(
            Builders<Cliente>.IndexKeys.Ascending(c => c.Cedula),
            new CreateIndexOptions { Unique = true, Sparse = true }));
        Clientes.Indexes.CreateOne(new CreateIndexModel<Cliente>(
            Builders<Cliente>.IndexKeys.Text(c => c.Nombre).Text(c => c.Email).Text(c => c.Telefono)));

        // Citas: compound indexes for common queries
        Citas.Indexes.CreateOne(new CreateIndexModel<Cita>(
            Builders<Cita>.IndexKeys.Ascending(c => c.ClienteId).Descending(c => c.FechaHora)));
        Citas.Indexes.CreateOne(new CreateIndexModel<Cita>(
            Builders<Cita>.IndexKeys.Ascending(c => c.FotografoId).Ascending(c => c.FechaHora)));
        Citas.Indexes.CreateOne(new CreateIndexModel<Cita>(
            Builders<Cita>.IndexKeys.Ascending(c => c.Estado)));

        // Fotografias
        Fotografias.Indexes.CreateOne(new CreateIndexModel<Fotografia>(
            Builders<Fotografia>.IndexKeys.Ascending(f => f.CitaId)));
        Fotografias.Indexes.CreateOne(new CreateIndexModel<Fotografia>(
            Builders<Fotografia>.IndexKeys.Ascending(f => f.ClienteId).Ascending(f => f.Entregada)));

        // Facturas: unique numero, indexes for queries
        Facturas.Indexes.CreateOne(new CreateIndexModel<Factura>(
            Builders<Factura>.IndexKeys.Ascending(f => f.NumeroFactura),
            new CreateIndexOptions { Unique = true }));
        Facturas.Indexes.CreateOne(new CreateIndexModel<Factura>(
            Builders<Factura>.IndexKeys.Ascending(f => f.ClienteId).Ascending(f => f.Estado)));

        // Pagos
        Pagos.Indexes.CreateOne(new CreateIndexModel<Pago>(
            Builders<Pago>.IndexKeys.Ascending(p => p.FacturaId)));
    }
}
