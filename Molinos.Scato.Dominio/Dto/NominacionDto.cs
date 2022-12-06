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
        public DateTime? EnviadoFumigador { get; set; }
        public DateTime? EnviadoSurveyor { get; set; }
        public DateTime? FechaCreacion { get; set; }
        public DateTime? FechaEnvioLineUp { get; set; }
        public DateTime? FechaEliminacion { get; set; }
        public EmbarqueDto Embarque { get; set; }
        public NominacionDatoTecnicoDto NominacionDatoTecnico { get; set; }
        public NominacionDetalleIntervencionDto NominacionDetalleIntervecion { get; set; }
        public ICollection<NominacionReciboDto> NominacionRecibo { get; set; }
    }
}
