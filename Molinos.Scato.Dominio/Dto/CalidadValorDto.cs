using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class CalidadValorDto
    {
        public int Id { get; set; }
        public string Valor { get; set; }
        public string Parametro { get; set; }
        public TipoDeCalidadDto TipoDeCalidad { get; set; }
    }
}
