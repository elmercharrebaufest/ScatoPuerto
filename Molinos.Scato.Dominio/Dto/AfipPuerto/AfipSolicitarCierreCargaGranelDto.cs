using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.AfipPuerto
{
    public class AfipSolicitarCierreCargaGranelDto
    {
        public int IdCoem { get; set; }
        public string IdentificadorCaratula { get; set; }
        public string IdentificadorCoem { get; set; }
        public IList<AfipCoemDto> Coems { get; set; }
    }
}
