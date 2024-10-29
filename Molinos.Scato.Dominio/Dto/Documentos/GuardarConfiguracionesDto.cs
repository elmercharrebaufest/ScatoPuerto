using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class GuardarConfiguracionesDto
    {
        public int NominacionId { get; set; }
        public List<ConfiguracionDocumentoDto> Configuraciones { get; set; }
    }
}
