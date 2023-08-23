using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDatoTecnicoCalidad : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual CalidadValor CalidadValor { get; set; }
        public virtual NominacionDatoTecnico NominacionDatoTecnico { get; set; }
    }
}
