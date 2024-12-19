using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto.HorariosExportador
{
    public class EdicionHorarioExportador
    {
        public int Id {  get; set; }
        public string FechaInicio { get; set; }
        public string HoraInicio { get; set; }
        public string FechaFin { get; set; }
        public string HoraFin { get; set; }
    }
}
