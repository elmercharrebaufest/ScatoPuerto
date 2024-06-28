using Molinos.Scato.Dominio.Dto;
using System;

namespace Molinos.Scato.Dominio.Comandos
{
    public class ActualizarCartasLineUp : Comando
    {
        public LineUpDto LineUp { get; set; }
    }
}
