using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class NominacionDatoTecnicoDestinoDto
    {
        public int Id { get; set; }
        public DestinoDto Destino { get; set; }
        public decimal Cantidad { get; set; }
        public decimal? CantidadExacta { get; set; }
        public decimal? CantidadConTolerancia { get; set; }
        public int? Tolerancia { get; set; }

    }
}
