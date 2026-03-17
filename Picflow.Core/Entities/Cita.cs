using Picflow.Core.Common;
using Picflow.Core.Enums;

namespace Picflow.Core.Entities;

public class Cita : BaseEntity
{
    public string ClienteId { get; set; } = string.Empty;
    public string FotografoId { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public int DuracionMinutos { get; set; } = 60;
    public string Servicio { get; set; } = string.Empty;
    public EstadoCita Estado { get; set; } = EstadoCita.Pendiente;
    public string Notas { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
}
