using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AcuerdoEmbarqueDto
    {
        public int Id { get; set; }
        public EmbarqueDto Embarque { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public decimal Cantidad { get; set; }
    }
}
