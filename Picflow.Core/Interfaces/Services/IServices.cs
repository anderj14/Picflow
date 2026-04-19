using Picflow.Core.DTOs.Request;
using Picflow.Core.DTOs.Response;

namespace Picflow.Core.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UsuarioResponse> RegisterAsync(CreateUsuarioRequest request);
}

public interface IClienteService
{
    Task<ClienteResponse> GetByIdAsync(string id);
    Task<IEnumerable<ClienteResponse>> GetAllAsync();
    Task<IEnumerable<ClienteResponse>> SearchAsync(string termino);
    Task<ClienteResponse> CreateAsync(CreateClienteRequest request);
    Task<ClienteResponse> UpdateAsync(string id, UpdateClienteRequest request);
    Task DeleteAsync(string id);
}

public interface ICitaService
{
    Task<CitaResponse> GetByIdAsync(string id);
    Task<IEnumerable<CitaResponse>> GetAllAsync();
    Task<IEnumerable<CitaResponse>> GetByClienteAsync(string clienteId);
    Task<IEnumerable<CitaResponse>> GetByFechaAsync(DateTime desde, DateTime hasta);
    Task<CitaResponse> CreateAsync(CreateCitaRequest request);
    Task<CitaResponse> UpdateAsync(string id, UpdateCitaRequest request);
    Task<CitaResponse> CambiarEstadoAsync(string id, string estado);
    Task DeleteAsync(string id);
}

public interface IFotografiaService
{
    Task<FotografiaResponse> GetByIdAsync(string id);
    Task<IEnumerable<FotografiaResponse>> GetByCitaAsync(string citaId);
    Task<IEnumerable<FotografiaResponse>> GetByClienteAsync(string clienteId);
    Task<FotografiaResponse> UploadAsync(UploadFotografiaRequest request);
    Task<FotografiaResponse> AgregarOpcionImpresionAsync(string fotografiaId, AgregarOpcionImpresionRequest request);
    Task<FotografiaResponse> EliminarOpcionImpresionAsync(string fotografiaId, string subCategoriaId);
    Task MarcarEntregadasAsync(IEnumerable<string> ids);
    Task DeleteAsync(string id);
}

public interface IFacturaService
{
    Task<FacturaResponse> GetByIdAsync(string id);
    Task<IEnumerable<FacturaResponse>> GetByClienteAsync(string clienteId);
    Task<IEnumerable<FacturaResponse>> GetPendientesAsync();
    Task<FacturaResponse> CreateAsync(CreateFacturaRequest request);
    Task<PagoResponse> RegistrarPagoAsync(string facturaId, CreatePagoRequest request);
}

public interface IPagoService
{
    Task<HistorialPagosResponse> GetHistorialByClienteAsync(string clienteId);
}

public interface ICategoriaService
{
    Task<CategoriaResponse> GetByIdAsync(string id);
    Task<IEnumerable<CategoriaResponse>> GetAllAsync();
    Task<CategoriaResponse> CreateAsync(CreateCategoriaRequest request);
    Task<CategoriaResponse> UpdateAsync(string id, UpdateCategoriaRequest request);
    Task<CategoriaResponse> AgregarSubCategoriaAsync(string id, CreateSubCategoriaRequest request);
    Task DeleteAsync(string id);
}

public interface IServicioService
{
    Task<ServicioResponse> GetByIdAsync(string id);
    Task<IEnumerable<ServicioResponse>> GetAllAsync();
    Task<IEnumerable<ServicioResponse>> GetByCategoriaAsync(string categoriaId);
    Task<ServicioResponse?> GetByCodigoBarrasAsync(string codigoBarras);
    Task<ServicioResponse> CreateAsync(CreateServicioRequest request);
    Task<ServicioResponse> UpdateAsync(string id, UpdateServicioRequest request);
    Task DeleteAsync(string id);
}

public interface IPreOrdenService
{
    Task<PreOrdenResponse> GetByIdAsync(string id);
    Task<IEnumerable<PreOrdenResponse>> GetByClienteAsync(string clienteId);
    Task<IEnumerable<PreOrdenResponse>> GetPendientesAsync();
    Task<PreOrdenResponse> CreateAsync(CreatePreOrdenRequest request);
    Task<PreOrdenResponse> ConfirmarAsync(string id);
    Task<FacturaResponse> ConvertirAFacturaAsync(string id, ConvertirPreOrdenRequest request);
    Task CancelarAsync(string id);
}

public interface IReporteService
{
    Task<ReporteIngresosResponse> GetIngresosAsync(DateTime desde, DateTime hasta);
    Task<IEnumerable<FacturaResponse>> GetCuentasPendientesAsync();
}

public interface IMediaService
{
    Task<MediaUploadResult> UploadAsync(Stream fileStream, string fileName, string folder);
    Task DeleteAsync(string publicId);
    string GetUrl(string publicId, int? width = null, int? height = null);
}

public record MediaUploadResult(string PublicId, string Url, long Bytes, string Format);
