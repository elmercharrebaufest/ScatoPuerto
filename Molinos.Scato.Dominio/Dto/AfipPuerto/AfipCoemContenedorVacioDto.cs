using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.AfipPuerto
{
    public class AfipCoemContenedorVacioDto
    {
        public int Id { get; set; }
        public string IdentificadorContenedor { get; set; }
        public string CuitATA { get; set; }
        public string Tipo { get; set; }
        public string CodigoPais { get; set; }
    }
}
