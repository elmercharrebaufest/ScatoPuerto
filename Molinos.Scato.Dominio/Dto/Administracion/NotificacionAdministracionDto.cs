using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class NotificacionAdministracionDto
    {
        public int Id { get; set; }
        public string Mensaje { get; set; }
        public DateTime? Fecha { get; set; }
        public DateTime? FechaEliminacion { get; set; }
        public string UsuarioEliminacion { get; set; }
    }
}