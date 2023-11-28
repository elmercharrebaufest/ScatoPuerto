using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos.AfipPuerto
{
    public class AfipSolicitarCierreCargaGranel : Comando
    {
        public AfipSolicitarCierreCargaGranelDto Dto { get; set; }
    }
}
