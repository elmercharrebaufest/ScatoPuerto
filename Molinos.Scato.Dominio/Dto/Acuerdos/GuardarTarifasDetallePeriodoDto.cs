using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class GuardarTarifasDetallePeriodoDto
    {
        public int AcuerdoDetalleId { get; set; }
        public DateTime Periodo { get; set; }
        public List<TarifaConceptoDto> Tarifas { get; set; }
        public bool Cerrar { get; set; }
    }
}
