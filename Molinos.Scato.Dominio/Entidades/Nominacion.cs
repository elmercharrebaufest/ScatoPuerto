using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class Nominacion : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual bool EnviadoFumigador { get; set; }
        public virtual bool EnviadoSurveyor { get; set; }
        public virtual bool EnviadoOtros { get; set; }
        public virtual DateTime? FechaCreacion { get; set; }
        public virtual DateTime? FechaEnvioLineUp { get; set; }
        public virtual DateTime? FechaEliminacion { get; set; }
        public virtual Embarque Embarque { get; set; } = null;
        public virtual NominacionDatoTecnico NominacionDatoTecnico { get; set; } = null;
        public virtual NominacionDetalleIntervencion NominacionDetalleIntervencion { get; set; } = null;
        public virtual ICollection<NominacionRecibo> NominacionRecibo { get; set; } = null;
        public virtual string ObservacionEnvioLineUp { get; set; }
        public virtual ICollection<NominacionEmbarque> Embarques { get; set; } = null;
        public virtual ICollection<NominacionDocumento> NominacionDocumentos { get; set; }
    }
}
