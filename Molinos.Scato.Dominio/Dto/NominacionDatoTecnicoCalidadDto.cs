using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class NominacionDatoTecnicoCalidadDto
    {
        public int Id { get; set; }
        public CalidadValorDto CalidadValor { get; set; }
        public string CalidadValorEditado { get; set; }
    }
}
