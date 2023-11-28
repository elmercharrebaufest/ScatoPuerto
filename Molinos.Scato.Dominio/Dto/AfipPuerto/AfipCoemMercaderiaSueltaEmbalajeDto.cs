using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipCoemMercaderiaSueltaEmbalajeDto
    {
        public int Id { get; set; }
        public string CodigoEmbalaje { get; set; }
        public int Peso { get; set; }
        public int CantidadBultos { get; set; }
    }
}
