using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.AfipPuerto
{
    public class AfipSolicitarCierreCargaGranelDto
    {        
        public string IdentificadorCaratula { get; set; } 
        public IList<int> Coems { get; set; }
    }
}
