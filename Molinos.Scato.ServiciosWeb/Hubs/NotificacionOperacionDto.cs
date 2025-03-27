using System;

namespace Molinos.Scato.ServiciosWeb.Hubs
{
    public class NotificacionOperacionDto
    {
        public int Id { get; set; }
        public int IdModuloCarga { get; set; }
        public string Usuario { get; set; }
        public string Modulo { get; set; }
        public DateTime FechaActualizacion { get; set; }
    }
}