using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDatoTecnicoDestino : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual NominacionDatoTecnico NominacionDatoTecnico { get; set; }
        public virtual Destino Destino { get; set; }
        public virtual decimal Cantidad { get; set; }
    }
}
