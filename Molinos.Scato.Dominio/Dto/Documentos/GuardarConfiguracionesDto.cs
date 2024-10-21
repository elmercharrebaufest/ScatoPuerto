using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class GuardarConfiguracionesDto
    {
        public int nominacionId { get; set; }
        public List<ConfiguracionDocumentoDto> configuraciones { get; set; }
    }
}
