using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public class ActoresDto
    {
        public string[] Coordinadores { get; set; }
        public string Ata { get; set; }
        public string AgenciaMaritima { get; set; }
        public string Estiba { get; set; }
        public string AgenciaControlPrivado { get; set; }
        public string Encargado { get; set; }

        public ActoresDto()
        {
            Coordinadores = new string[] { };
            Ata = "-";
            AgenciaMaritima = "-";
            Estiba = "-";
            AgenciaControlPrivado = "-";
            Encargado = "-";
        }
    }
}
