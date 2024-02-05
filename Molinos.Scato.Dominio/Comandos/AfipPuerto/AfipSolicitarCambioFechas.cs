using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos
{
    public class AfipSolicitarCambioFechas : Comando
    {
        public AfipSolicitarCambioFechasDto Dto { get; set; }
    }
}
