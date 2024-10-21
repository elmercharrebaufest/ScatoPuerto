using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class ConfiguracionDocumentoDto
    {
        public int Id { get; set; }
        public CoordinadorPuertoDto CoordinadorPuerto { get; set; }
        public DestinoDto Destino { get; set; }
        public int CantidadDeJuegos { get; set; }
        public IList<NominacionDocumentoDto> NominacionDocumentos { get; set; }
    }
}
