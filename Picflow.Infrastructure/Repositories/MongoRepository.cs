using MongoDB.Bson;
using MongoDB.Driver;
using Picflow.Core.Common;
using Picflow.Core.Interfaces.Repositories;

namespace Picflow.Infrastructure.Repositories;

public abstract class MongoRepository<T>(IMongoCollection<T> collection)
    : IRepository<T> where T : BaseEntity
{
    protected readonly IMongoCollection<T> Collection = collection;

    public async Task<T?> GetByIdAsync(string id)
    {
        if (!ObjectId.TryParse(id, out _)) return null;
        return await Collection.Find(e => e.Id == id).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<T>> GetAllAsync() =>
        await Collection.Find(_ => true).ToListAsync();

    public async Task<T> CreateAsync(T entity)
    {
        entity.CreadoEn = DateTime.UtcNow;
        entity.ActualizadoEn = DateTime.UtcNow;
        await Collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<bool> UpdateAsync(string id, T entity)
    {
        entity.ActualizadoEn = DateTime.UtcNow;
        var result = await Collection.ReplaceOneAsync(e => e.Id == id, entity);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await Collection.DeleteOneAsync(e => e.Id == id);
        return result.DeletedCount > 0;
    }
}
