using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos.AfipPuerto
{
    public class AfipRectificarCoem : Comando
    {
        public AfipCoemDto Dto { get; set; }
    }
}
