using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos
{
    public class EliminarBuque : Comando
    {
        public int Id { get; set; }
        public string UsuarioEjecuta { get;set; }
    }
}
