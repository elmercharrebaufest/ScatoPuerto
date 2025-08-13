using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class NominacionDatoTecnicoCoordinadorPuertoDto
    {
        public int Id { get; set; }
        public CoordinadorPuertoDto CoordinadorPuerto { get; set; }
        public decimal Cantidad { get; set; }
        public decimal? CantidadConTolerancia { get; set; }
        public decimal? CantidadExacta { get; set; }
        public int? Tolerancia { get; set; }
    }
}
