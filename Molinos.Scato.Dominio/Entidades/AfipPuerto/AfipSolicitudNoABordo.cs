using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipSolicitudNoABordo
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string IdentificadorSolicitud { get; set; }
        public virtual AfipCoem AfipCoem { get; set; }
        public virtual AfipMotivoNoABordo AfipMotivoNoABordo { get; set; }
        public virtual ICollection<AfipSolicitudNoABordoDeclaracion> AfipSolicitudNoABordoDeclaraciones { get; set; }
        public virtual string DescripcionMotivo { get; set; }
        public virtual int Estado { get; set; }
        public virtual DateTime FechaCreacion { get; set; }
        public virtual DateTime FechaActualizacion { get; set; }
    }
}
