using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using Picflow.Core.Interfaces.Services;

namespace Picflow.Infrastructure.Services;

public class CloudinarySettings
{
    public string CloudName { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
}

public class CloudinaryMediaService : IMediaService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryMediaService(IOptions<CloudinarySettings> options)
    {
        var s = options.Value;
        var account = new Account(s.CloudName, s.ApiKey, s.ApiSecret);
        _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
    }

    public async Task<MediaUploadResult> UploadAsync(Stream fileStream, string fileName, string folder)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = folder,
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false,
            Transformation = new Transformation()
                .Quality("auto")
                .FetchFormat("auto")
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error is not null)
            throw new InvalidOperationException($"Error al subir imagen: {result.Error.Message}");

        return new MediaUploadResult(
            result.PublicId,
            result.SecureUrl.ToString(),
            result.Bytes,
            result.Format
        );
    }

    public async Task DeleteAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deleteParams);

        if (result.Result != "ok")
            throw new InvalidOperationException($"Error al eliminar imagen: {result.Error?.Message}");
    }

    public string GetUrl(string publicId, int? width = null, int? height = null)
    {
        var transformation = new Transformation().Quality("auto").FetchFormat("auto");

        if (width.HasValue) transformation = transformation.Width(width.Value);
        if (height.HasValue) transformation = transformation.Height(height.Value);
        if (width.HasValue || height.HasValue) transformation = transformation.Crop("fill");

        return _cloudinary.Api.UrlImgUp
            .Transform(transformation)
            .BuildUrl(publicId);
    }
}
