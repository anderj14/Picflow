using Picflow.Core.Entities;
using Picflow.Core.Enums;

namespace Picflow.Core.Interfaces.Repositories;

public interface IUsuarioRepository : IRepository<Usuario>
{
    Task<Usuario?> GetByEmailAsync(string email);
    Task<IEnumerable<Usuario>> GetByRolAsync(RolUsuario rol);
}

public interface IClienteRepository : IRepository<Cliente>
{
    Task<Cliente?> GetByCedulaAsync(string cedula);
    Task<IEnumerable<Cliente>> SearchAsync(string termino);
}

public interface ICitaRepository : IRepository<Cita>
{
    Task<IEnumerable<Cita>> GetByClienteIdAsync(string clienteId);
    Task<IEnumerable<Cita>> GetByFotografoIdAsync(string fotografoId);
    Task<IEnumerable<Cita>> GetByFechaAsync(DateTime desde, DateTime hasta);
    Task<IEnumerable<Cita>> GetByEstadoAsync(EstadoCita estado);
}

public interface IFotografiaRepository : IRepository<Fotografia>
{
    Task<IEnumerable<Fotografia>> GetByCitaIdAsync(string citaId);
    Task<IEnumerable<Fotografia>> GetByClienteIdAsync(string clienteId);
    Task<bool> MarcarEntregadasAsync(IEnumerable<string> ids);
}

public interface IFacturaRepository : IRepository<Factura>
{
    Task<IEnumerable<Factura>> GetByClienteIdAsync(string clienteId);
    Task<IEnumerable<Factura>> GetByEstadoAsync(EstadoFactura estado);
    Task<Factura?> GetByCitaIdAsync(string citaId);
    Task<string> GenerarNumeroFacturaAsync();
}

public interface IPagoRepository : IRepository<Pago>
{
    Task<IEnumerable<Pago>> GetByFacturaIdAsync(string facturaId);
    Task<decimal> GetTotalPagadoByFacturaAsync(string facturaId);
    Task<IEnumerable<Pago>> GetByClienteIdAsync(string clienteId);
}

public interface ICategoriaRepository : IRepository<Categoria>
{
    Task<IEnumerable<Categoria>> GetActivasAsync();
}

public interface IServicioRepository : IRepository<Servicio>
{
    Task<IEnumerable<Servicio>> GetByCategoriaIdAsync(string categoriaId);
    Task<IEnumerable<Servicio>> GetActivosAsync();
    Task<Servicio?> GetByCodigoBarrasAsync(string codigoBarras);
}

public interface IPreOrdenRepository : IRepository<PreOrden>
{
    Task<IEnumerable<PreOrden>> GetByClienteIdAsync(string clienteId);
    Task<IEnumerable<PreOrden>> GetByEstadoAsync(EstadoPreOrden estado);
    Task<string> GenerarNumeroPreOrdenAsync();
}
