using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AcuerdoDetalleConceptoPeriodoTarifaDto
    {
        public int Id { get; set; }
        public int AcuerdoDetalleConceptoId { get; set; }
        public int AcuerdoPeriodoId { get; set; }
        public decimal ValorTarifa { get; set; }
    }
}
