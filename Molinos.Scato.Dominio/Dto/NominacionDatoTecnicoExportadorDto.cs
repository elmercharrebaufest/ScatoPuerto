using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class NominacionDatoTecnicoExportadorDto
    {
        public int Id { get; set; }
        public ExportadorDto Exportador { get; set; }
        public decimal Cantidad { get; set; }
        public int Tolerancia { get; set; }
        public bool? ToleranciasDiferenciadas { get; set; }
        public int? ToleranciaPositiva { get; set; }
        public int? ToleranciaNegativa { get; set; }
        public decimal? CantidadConTolerancia { get; set; }
        public decimal? CantidadExacta { get; set; }

    }
}
