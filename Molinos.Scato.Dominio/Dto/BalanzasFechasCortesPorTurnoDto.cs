using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class BalanzasFechasCortesPorTurnoDto
    {
        public string FechaInicio { get; set; }
        public string HoraInicio { get; set; }
        public string FechaCorte { get; set; }
        public string HoraCorte { get; set; }
        public TurnoPuertoDto TurnoPuerto { get; set; }
    }
    public class BalanzasFechasCortesRegistroDto
    {
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
    }
}
