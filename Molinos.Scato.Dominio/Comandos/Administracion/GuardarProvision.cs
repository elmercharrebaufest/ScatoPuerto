using Molinos.Scato.Dominio.Dto.Administracion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos.Administracion
{
    public class GuardarProvision: Comando
    {
        public AltaProvisionYGastoDto Dto { get; set; }
    }
}
