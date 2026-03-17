using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Serializers;
using Picflow.Core.Common;

namespace Picflow.Infrastructure.Configuration;

public static class MongoDbConfiguration
{
    private static bool _configured = false;
    private static readonly object _lock = new();

    public static void Configure()
    {
        lock (_lock)
        {
            if (_configured) return;

            var conventions = new ConventionPack
            {
                new CamelCaseElementNameConvention(),
                new IgnoreIfNullConvention(true),
                new EnumRepresentationConvention(BsonType.String)
            };
            ConventionRegistry.Register("PicflowConventions", conventions, _ => true);

            BsonClassMap.RegisterClassMap<BaseEntity>(cm =>
            {
                cm.AutoMap();
                cm.MapIdMember(e => e.Id)
                .SetSerializer(new StringSerializer(BsonType.ObjectId))
                .SetIdGenerator(StringObjectIdGenerator.Instance);
                cm.SetIgnoreExtraElements(true);
            });

            _configured = true;
        }
    }
}
