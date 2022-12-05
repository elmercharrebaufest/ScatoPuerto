using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class Nominacion
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual DateTime? EnviadoFumigador { get; set; }
        public virtual DateTime? EnviadoSurveyor { get; set; }
        public virtual DateTime? FechaCreacion { get; set; }
        public virtual DateTime? FechaEnvioLineUp { get; set; }
        public virtual DateTime? FechaEliminacion { get; set; }
        public virtual Embarque Embarque { get; set; }
        public virtual ICollection<NominacionDatoTecnico> NominacionDatoTecnico { get; set; }
        public virtual ICollection<NominacionRecibo> NominacionRecibo { get; set; }
        public virtual ICollection<NominacionDetalleIntervencion> NominacionDetalleIntervencion { get; set; }

    }
}
