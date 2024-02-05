using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipCoemMercaderiaSueltaDto
    {
        public int Id { get; set; }
        public string IdentificadorDeclaracion { get; set; }
        public string CuitATA { get; set; }
        public IList<AfipCoemMercaderiaSueltaEmbalajeDto> Embalajes { get; set; }
    }
}
