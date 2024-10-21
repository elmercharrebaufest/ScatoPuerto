using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class RegistroProductoDto
    {
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public List<RegistroTipoDeCalidadDto> TiposDeCalidad { get; set; }
        public List<DocumentoMaterialPuertoDto> Documentos { get; set; }
    }
    public class RegistroTipoDeCalidadDto
    {
        public TipoDeCalidadDto TipoDeCalidad { get; set; }
        public List<CalidadValorDto> CalidadValores { get; set; }
    }
}
