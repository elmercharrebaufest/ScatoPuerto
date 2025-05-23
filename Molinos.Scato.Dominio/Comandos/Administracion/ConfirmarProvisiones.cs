using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos.Administracion
{
    public class ConfirmarProvisiones: Comando
    {
        public List<int> IdsTarifas { get; set; }
    }
}
