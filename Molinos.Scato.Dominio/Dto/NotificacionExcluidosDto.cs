using System;
using Molinos.Scato.Dominio.Enums;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class NotificacionExcluidosDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public NotificacionDto Notificacion { get; set; }       
    }
}
