using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class AfipCoemContenedorConCargaDto
    {
        public int Id { get; set; }
        public string IdentificadorContenedor { get; set; }
        public string CuitATA { get; set; }
        public string Tipo { get; set; }
        public decimal Peso { get; set; }
        public IList<AfipCoemContenedorConCargaPrecintoDto> Precintos { get; set; }
        public IList<AfipCoemContenedorConCargaDeclaracionDto> Declaraciones { get; set; }
    }
}
