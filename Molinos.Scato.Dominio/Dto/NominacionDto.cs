using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class NominacionDto
    {
        public int Id { get; set; }
        public bool EnviadoFumigador { get; set; }
        public bool EnviadoSurveyor { get; set; }
        public bool EnviadoOtros { get; set; }
        public DateTime? FechaCreacion { get; set; }
        public DateTime? FechaEnvioLineUp { get; set; }
        public DateTime? FechaEliminacion { get; set; }
        public EmbarqueDto Embarque { get; set; }
        public NominacionDatoTecnicoDto NominacionDatoTecnico { get; set; }
        public NominacionDetalleIntervencionDto NominacionDetalleIntervencion { get; set; }
        public ICollection<NominacionReciboDto> NominacionRecibo { get; set; }
        public string ObservacionEnvioLineUp { get; set; }
    }
}
