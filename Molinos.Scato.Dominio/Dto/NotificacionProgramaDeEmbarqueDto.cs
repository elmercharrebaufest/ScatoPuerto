using System;
using Molinos.Scato.Dominio.Enums;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class NotificacionProgramaDeEmbarqueDto
    {
        public int Id { get; set; }
        public string Mensaje { get; set; }
        public DateTime Fecha { get; set; }
        public TipoAlerta? TipoAlerta { get; set; }
    }
}
