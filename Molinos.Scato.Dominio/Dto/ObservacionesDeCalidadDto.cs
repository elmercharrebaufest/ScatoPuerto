using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class ObservacionesDeCalidadDto
    {
        public int Id { get; set; }
        public DateTime FechaHoraObs { get; set; }
        public string Observaciones { get; set; }
        public bool ObservacionVisible { get; set; }

    }
}