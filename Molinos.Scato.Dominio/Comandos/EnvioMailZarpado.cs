using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Comandos
{
    public class EnvioMailZarpado : Comando
    {
        public int EmbarqueId { get; set; }
        public int LineUpId { get; set; }
    }
}
