using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class ModuloDeCargaPlanillaDeTurnosObservacionesDeCalidadDto
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public DateTime Hora { get; set; }
        public DateTime FechaHora { get; set; }
        public string Observaciones { get; set; }
        public bool ObservacionVisible { get; set; }
    }
}