using Molinos.Scato.Dominio.Dto;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Comandos
{
    public class ModificarOrdenLineUp : Comando
    {
        public Dictionary<int,int> IdsYOrden { get; set; }

    }
}
