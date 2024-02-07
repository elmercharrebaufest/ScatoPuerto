using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipSolicitudNoABordoDeclaracion
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual AfipSolicitudNoABordo AfipSolicitudNoABordo { get; set; }
        public virtual AfipCoemMercaderiaSuelta AfipCoemMercaderiaSuelta { get; set; }
    }
}
